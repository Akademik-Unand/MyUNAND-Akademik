'use strict';

const {
  sequelize,
  Kelas,
  Matakuliah,
  MatakuliahKurikulum,
  Kurikulum,
  SemesterProdi,
  Semester,
  JenisSemester,
  ProgramStudi,
  Departemen,
  DosenKelas,
  Dosen,
  JadwalKelas,
  Ruang,
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
    model: SemesterProdi,
    as: 'semesterProdi',
    include: [
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
    ],
  },
  {
    model: DosenKelas,
    as: 'dosenKelas',
    include: [{ model: Dosen, as: 'dosen' }],
  },
  {
    model: JadwalKelas,
    as: 'jadwalKelas',
    include: [{ model: Ruang, as: 'ruang' }],
  },
];

const LIST_OPTIONS = {
  searchFields: ['nama', '$matakuliah.nama_resmi$', '$matakuliah.kode_matakuliah$'],
  sortableFields: ['nama', 'createdAt'],
  filterableFields: ['matakuliah_id', 'semester_prodi_id', ...ORG_FILTER_FIELDS],
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

const create = async (payload) => {
  const item = await Kelas.create(payload);
  return loadKelas(item.id);
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return loadKelas(id);
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

const restore = (id) => restoreRecord(Kelas, id, 'Kelas');

module.exports = { list, getById, create, update, remove, restore };
