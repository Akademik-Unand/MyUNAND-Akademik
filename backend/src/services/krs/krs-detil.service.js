'use strict';

const { Op } = require('sequelize');
const { KrsDetil, Krs, Mahasiswa, ProgramStudi, Kelas, Matakuliah, PenawaranMatakuliah, PenawaranMatakuliahDetil, JadwalKelas, DosenKelas } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { assertKrsPeriodForKrs } = require('../../helpers/academicPeriod');
const { assertActivePa } = require('../../helpers/activePa');
const { assertJadwalKrsTidakBentrok } = require('../../helpers/jadwalBentrok');
const { assertKelasKrsReady } = require('../../helpers/kelasKrsEligibility');
const { getUserAcademicIdentity } = require('../../helpers/userAcademicProfile');

const LIST_OPTIONS = {
  searchFields: ['$krs.mahasiswa.nama$', '$krs.mahasiswa.niu$'],
  sortableFields: ['approved', 'createdAt'],
  filterableFields: ['krs_id', 'kelas_id', 'approved'],
  findOptions: { subQuery: false },
  defaultInclude: [
    {
      model: Krs,
      as: 'krs',
      include: [
        {
          model: Mahasiswa,
          as: 'mahasiswa',
          include: [{ model: ProgramStudi, as: 'programStudi' }],
        },
      ],
    },
    {
      model: Kelas,
      as: 'kelas',
      include: [{ model: Matakuliah, as: 'matakuliah' }],
    },
  ],
};

const list = (query) => paginate(KrsDetil, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await KrsDetil.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('KRS Detil dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

/**
 * Kapasitas total kelas mencakup mahasiswa internal dan lintas prodi. Kuota
 * internal membatasi bagian prodi penyelenggara; kuota lintas membatasi sisanya.
 */
const assertKelasOwnCapacity = async (kelasId, transaction) => {
  const kelas = await Kelas.findByPk(kelasId, { transaction });
  if (!kelas) {
    throw new AppError('Kelas dengan ID tersebut tidak ditemukan', 404);
  }
  const activeWhere = {
    kelas_id: kelasId,
    [Op.or]: [
      { is_cross_enrollment: false },
      { cross_enrollment_status: { [Op.in]: ['pending_pa', 'approved'] } },
    ],
  };
  const occupied = await KrsDetil.count({ where: activeWhere, transaction });
  if (kelas.jumlah_peserta_max > 0 && occupied >= kelas.jumlah_peserta_max) {
    throw new AppError('Kapasitas total kelas penuh', 409);
  }
  if (kelas.jumlah_peserta_internal_max == null) return;
  const internalOccupied = await KrsDetil.count({
    where: { kelas_id: kelasId, is_cross_enrollment: false },
    transaction,
  });
  if (internalOccupied >= kelas.jumlah_peserta_internal_max) {
    throw new AppError('Kuota mahasiswa prodi sendiri pada kelas ini penuh', 409);
  }
};

/**
 * Pintu tunggal pengambilan KRS reguler: kelas hanya bisa dipilih jika MK-nya
 * dibuka lewat penawaran yang berstatus `published` pada semester yang sama
 * dengan KRS. MK yang tidak dibuka => tidak ada kelas tersedia.
 */
const assertKelasPublishedOffering = async (kelasId, semesterId, transaction, mahasiswaId) => {
  const kelas = await Kelas.findByPk(kelasId, {
    include: [
      {
        model: PenawaranMatakuliahDetil,
        as: 'penawaranMatakuliah',
        include: [{ model: PenawaranMatakuliah, as: 'penawaran' }],
      },
      { model: Matakuliah, as: 'matakuliah' },
      { model: JadwalKelas, as: 'jadwalKelas' },
      { model: DosenKelas, as: 'dosenKelas', attributes: ['id'] },
    ],
    transaction,
  });
  if (!kelas) {
    throw new AppError('Kelas dengan ID tersebut tidak ditemukan', 404);
  }
  if (semesterId && kelas.semester_id !== semesterId) {
    throw new AppError('Kelas tidak sesuai dengan semester KRS', 422);
  }
  const offering = kelas.penawaranMatakuliah?.penawaran;
  if (!offering || offering.status !== 'published') {
    throw new AppError('Mata kuliah belum dibuka pada semester ini', 409);
  }
  if (mahasiswaId) {
    const student = await Mahasiswa.findByPk(mahasiswaId, { attributes: ['program_studi_id'], transaction });
    if (student?.program_studi_id && offering.program_studi_id !== student.program_studi_id) {
      throw new AppError('Mata kuliah lintas prodi harus diajukan melalui Cross Enrollment', 403);
    }
  }
  assertKelasKrsReady(kelas);
  return kelas;
};

/**
 * Jadwal kelas yang mau diambil tidak boleh bertabrakan dengan jadwal mata
 * kuliah yang sudah ada di KRS yang sama. Pengajuan lintas prodi yang ditolak
 * tidak mengikat, jadi tidak dihitung.
 */
const assertKrsJadwalTidakBentrok = async (krsId, kelas, transaction) => {
  const existing = await KrsDetil.findAll({
    where: {
      krs_id: krsId,
      [Op.or]: [
        { is_cross_enrollment: false },
        { cross_enrollment_status: { [Op.ne]: 'rejected' } },
      ],
    },
    include: [
      {
        model: Kelas,
        as: 'kelas',
        include: [{ model: Matakuliah, as: 'matakuliah' }, { model: JadwalKelas, as: 'jadwalKelas' }],
      },
    ],
    transaction,
  });
  assertJadwalKrsTidakBentrok(kelas, existing);
};

const assertKrsEditable = async (krsId, transaction) => {
  const krs = await Krs.findByPk(krsId, {
    attributes: ['id', 'semester_id', 'approval_ke'],
    transaction,
  });
  if (!krs) throw new AppError('KRS tidak ditemukan', 404);
  if (krs.approval_ke > 0) throw new AppError('KRS sudah disetujui, tidak dapat diubah', 409);
  return krs;
};

/**
 * Mahasiswa hanya boleh menyentuh baris KRS miliknya sendiri. Pemanggil
 * non-mahasiswa (admin/prodi/dosen) tidak punya `mahasiswa_id` sehingga tidak
 * dibatasi.
 */
const assertOwnKrs = async (krsId, user) => {
  if (!user?.id) return null;
  const actor = await getUserAcademicIdentity(user.id);
  if (!actor.mahasiswa_id) return null;
  const krs = await Krs.findByPk(krsId, { attributes: ['id', 'mahasiswa_id'] });
  if (!krs) throw new AppError('KRS tidak ditemukan', 404);
  if (krs.mahasiswa_id !== actor.mahasiswa_id) {
    throw new AppError('KRS bukan milik Anda', 403);
  }
  return actor.mahasiswa_id;
};

const create = async (payload, user) => {
  const mahasiswaId = await assertOwnKrs(payload.krs_id, user);
  // Mahasiswa wajib punya dosen PA aktif sebelum mengambil mata kuliah — sama
  // seperti jalur lintas prodi, karena KRS reguler pun disetujui PA.
  if (mahasiswaId) await assertActivePa(mahasiswaId);
  await assertKrsPeriodForKrs(payload.krs_id);
  const krs = await assertKrsEditable(payload.krs_id);
  const kelas = await assertKelasPublishedOffering(payload.kelas_id, krs.semester_id, undefined, mahasiswaId);
  await assertKelasOwnCapacity(payload.kelas_id);
  await assertKrsJadwalTidakBentrok(payload.krs_id, kelas);
  const item = await KrsDetil.create(payload);
  return KrsDetil.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload, user) => {
  const item = await getById(id);
  const targetKrsId = payload.krs_id || item.krs_id;
  const mahasiswaId = await assertOwnKrs(targetKrsId, user);
  await assertKrsPeriodForKrs(targetKrsId);
  const krs = await assertKrsEditable(targetKrsId);
  if (payload.kelas_id && payload.kelas_id !== item.kelas_id) {
    const kelas = await assertKelasPublishedOffering(payload.kelas_id, krs.semester_id, undefined, mahasiswaId);
    await assertKelasOwnCapacity(payload.kelas_id);
    await assertKrsJadwalTidakBentrok(payload.krs_id || item.krs_id, kelas);
  }
  await item.update(payload);
  return KrsDetil.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id, user) => {
  const item = await getById(id);
  if (item.krs?.approval_ke > 0) throw new AppError('KRS sudah disetujui, tidak dapat diubah', 409);
  await assertOwnKrs(item.krs_id, user);
  await item.destroy();
  return { id };
};

module.exports = { list, getById, create, update, remove, assertKelasOwnCapacity, assertKelasPublishedOffering, assertKrsJadwalTidakBentrok, assertOwnKrs };
