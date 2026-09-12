'use strict';

const {
  sequelize,
  Kelas,
  Matakuliah,
  MatakuliahKurikulum,
  Kurikulum,
  Semester,
  JenisSemester,
  ProgramStudi,
  Departemen,
  DosenKelas,
  Dosen,
  JadwalKelas,
  Ruang,
  Shift,
  PenawaranMatakuliah,
  PenawaranMatakuliahDetil,
} = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { restoreRecord } = require('../../helpers/softDelete');
const { kelasFilters, ORG_FILTER_FIELDS } = require('../../helpers/academicFilters');

const extraAttributes = {
  include: [
    [
      sequelize.literal('(SELECT COUNT(*) FROM krs_detil AS kd WHERE kd.kelas_id = Kelas.id)'),
      'jumlah_peserta',
    ],
    [
      sequelize.literal(`(SELECT CASE WHEN EXISTS (
        SELECT 1 FROM nilai_mahasiswa AS nm
        INNER JOIN krs_detil AS kd ON kd.id = nm.krs_detil_id
        WHERE kd.kelas_id = Kelas.id AND nm.nilai IS NOT NULL
      ) THEN 'Ada' ELSE 'Belum' END)`),
      'progress_upload_nilai',
    ],
  ],
};

const findInclude = [
  {
    model: Matakuliah,
    as: 'matakuliah',
    include: [
      {
        model: MatakuliahKurikulum,
        as: 'matakuliahKurikulum',
        include: [{ model: Kurikulum, as: 'kurikulum' }],
      },
    ],
  },
  {
    model: ProgramStudi,
    as: 'programStudi',
    include: [{ model: Departemen, as: 'departemen' }],
  },
  {
    model: Semester,
    as: 'semester',
    include: [{ model: JenisSemester, as: 'jenisSemester' }],
  },
  {
    model: DosenKelas,
    as: 'dosenKelas',
    include: [{ model: Dosen, as: 'dosen' }],
  },
  {
    model: JadwalKelas,
    as: 'jadwalKelas',
    include: [
      { model: Ruang, as: 'ruang' },
      { model: Shift, as: 'shift' },
    ],
  },
];

const LIST_OPTIONS = {
  searchFields: ['nama', '$matakuliah.nama_resmi$', '$matakuliah.kode_matakuliah$'],
  sortableFields: ['nama', 'createdAt'],
  filterableFields: ['matakuliah_id', 'semester_id', ...ORG_FILTER_FIELDS],
  virtualFilters: kelasFilters(sequelize),
  defaultInclude: findInclude,
  findOptions: { subQuery: false, attributes: extraAttributes },
};

const loadKelas = (id) =>
  Kelas.findByPk(id, { include: findInclude, attributes: extraAttributes });

const list = (query) => paginate(Kelas, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await loadKelas(id);
  if (!item) {
    throw new AppError('Kelas dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

/**
 * Pastikan kelas mengacu pada kombinasi (semester, prodi, MK, penawaran) yang
 * konsisten: MK milik prodi tersebut, dan detail penawaran cocok dengan MK
 * serta semester/prodi yang dipilih.
 */
const assertKelasConsistency = async (payload, transaction) => {
  const { semester_id, program_studi_id, matakuliah_id, penawaran_matakuliah_id } = payload;
  if (penawaran_matakuliah_id) {
    const detil = await PenawaranMatakuliahDetil.findByPk(penawaran_matakuliah_id, {
      include: [{ model: PenawaranMatakuliah, as: 'penawaran' }],
      transaction,
    });
    if (!detil) throw new AppError('Detail penawaran tidak ditemukan', 404);
    if (matakuliah_id && detil.matakuliah_id !== matakuliah_id) {
      throw new AppError('Mata kuliah tidak sesuai dengan penawaran', 422);
    }
    if (semester_id && detil.penawaran?.semester_id !== semester_id) {
      throw new AppError('Semester tidak sesuai dengan penawaran', 422);
    }
    if (program_studi_id && detil.penawaran?.program_studi_id !== program_studi_id) {
      throw new AppError('Program studi tidak sesuai dengan penawaran', 422);
    }
  }
  if (program_studi_id && matakuliah_id) {
    const mk = await Matakuliah.findByPk(matakuliah_id, { transaction });
    if (!mk) throw new AppError('Mata kuliah tidak ditemukan', 404);
    if (mk.program_studi_id !== program_studi_id) {
      throw new AppError('Mata kuliah tidak dimiliki program studi tersebut', 422);
    }
  }
};

const DUPLICATE_INCLUDE = [
  {
    model: Matakuliah,
    as: 'matakuliah',
    attributes: ['kode_matakuliah', 'nama_resmi'],
  },
  {
    model: ProgramStudi,
    as: 'programStudi',
    attributes: ['nama_resmi', 'nama_singkat'],
  },
  {
    model: Semester,
    as: 'semester',
    attributes: ['tahun'],
    include: [
      { model: JenisSemester, as: 'jenisSemester', attributes: ['nama'] },
    ],
  },
];

/** Usulan nama kelas berikutnya untuk pesan galat (A → B, Z → AA). */
const saranNamaKelas = (nama) => {
  const trimmed = String(nama || '').trim();
  if (!/^[A-Za-z]$/.test(trimmed)) return `${trimmed}-2`;
  const next = String.fromCharCode(trimmed.toUpperCase().charCodeAt(0) + 1);
  return next > 'Z' ? 'AA' : next;
};

/**
 * Satu nama kelas hanya boleh sekali untuk kombinasi mata kuliah × semester ×
 * prodi (`uq_kelas_semester_prodi_mk_nama`). Dicek lebih dulu di service supaya
 * admin menerima pesan yang menyebut kelas mana yang sudah ada — bukan pesan
 * mentah MySQL "... must be unique" yang membingungkan.
 */
const assertNamaKelasUnik = async (payload, { excludeId, transaction } = {}) => {
  const { semester_id, program_studi_id, matakuliah_id, nama } = payload;
  if (!semester_id || !program_studi_id || !matakuliah_id || !nama) return;

  const bentrok = await Kelas.findOne({
    where: { semester_id, program_studi_id, matakuliah_id, nama },
    include: DUPLICATE_INCLUDE,
    attributes: ['id'],
    transaction,
  });
  if (!bentrok || bentrok.id === excludeId) return;

  const mk = bentrok.matakuliah;
  const mkLabel = mk
    ? `${mk.kode_matakuliah} — ${mk.nama_resmi}`
    : 'mata kuliah tersebut';
  const prodi = bentrok.programStudi?.nama_resmi;
  const semester = bentrok.semester
    ? [bentrok.semester.jenisSemester?.nama, bentrok.semester.tahun]
        .filter(Boolean)
        .join(' ')
    : null;
  const konteks = [prodi, semester].filter(Boolean).join(', ');

  throw new AppError(
    `Kelas "${nama}" untuk ${mkLabel}${konteks ? ` (${konteks})` : ''} sudah ada. ` +
      `Nama kelas hanya perlu unik di dalam satu mata kuliah, jadi pakai nama ` +
      `kelas lain (mis. "${saranNamaKelas(nama)}") atau ubah kelas yang sudah ada.`,
    422,
  );
};

const create = async (payload) => {
  await assertKelasConsistency(payload);
  await assertNamaKelasUnik(payload);
  const item = await Kelas.create(payload);
  return loadKelas(item.id);
};

const update = async (id, payload) => {
  const item = await getById(id);
  const merged = { ...item.toJSON(), ...payload };
  await assertKelasConsistency(merged);
  await assertNamaKelasUnik(merged, { excludeId: item.id });
  await item.update(payload);
  return loadKelas(id);
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

const restore = (id) => restoreRecord(Kelas, id, 'Kelas');

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  restore,
  assertKelasConsistency,
  assertNamaKelasUnik,
};
