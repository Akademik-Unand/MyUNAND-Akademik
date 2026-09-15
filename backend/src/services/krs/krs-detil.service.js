'use strict';

const { Op } = require('sequelize');
const { KrsDetil, Krs, Mahasiswa, ProgramStudi, Kelas, Matakuliah, PenawaranMatakuliah, PenawaranMatakuliahDetil, JadwalKelas, DosenKelas, User } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { assertKrsPeriodForKrs } = require('../../helpers/academicPeriod');
const { assertActivePa } = require('../../helpers/activePa');
const { assertJadwalKrsTidakBentrok } = require('../../helpers/jadwalBentrok');
const { assertKelasKrsReady } = require('../../helpers/kelasKrsEligibility');

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
 * Kapasitas kelas (`jumlah_peserta_max`) berlaku untuk mahasiswa prodi sendiri
 * (KRS reguler). Mahasiswa lintas prodi dibatasi kuota lintas terpisah.
 */
const assertKelasOwnCapacity = async (kelasId, transaction) => {
  const kelas = await Kelas.findByPk(kelasId, { transaction });
  if (!kelas) {
    throw new AppError('Kelas dengan ID tersebut tidak ditemukan', 404);
  }
  if (!kelas.jumlah_peserta_max) return;
  const occupied = await KrsDetil.count({
    where: { kelas_id: kelasId, is_cross_enrollment: false },
    transaction,
  });
  if (occupied >= kelas.jumlah_peserta_max) {
    throw new AppError('Kapasitas kelas penuh', 409);
  }
};

/**
 * Pintu tunggal pengambilan KRS reguler: kelas hanya bisa dipilih jika MK-nya
 * dibuka lewat penawaran yang berstatus `published` pada semester yang sama
 * dengan KRS. MK yang tidak dibuka => tidak ada kelas tersedia.
 */
const assertKelasPublishedOffering = async (kelasId, semesterId, transaction) => {
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
  const actor = await User.findByPk(user.id, { attributes: ['mahasiswa_id'] });
  if (!actor?.mahasiswa_id) return null;
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
  const kelas = await assertKelasPublishedOffering(payload.kelas_id, krs.semester_id);
  await assertKelasOwnCapacity(payload.kelas_id);
  await assertKrsJadwalTidakBentrok(payload.krs_id, kelas);
  const item = await KrsDetil.create(payload);
  return KrsDetil.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload, user) => {
  const item = await getById(id);
  await assertOwnKrs(payload.krs_id || item.krs_id, user);
  await assertKrsPeriodForKrs(payload.krs_id || item.krs_id);
  const krs = await assertKrsEditable(payload.krs_id || item.krs_id);
  if (payload.kelas_id && payload.kelas_id !== item.kelas_id) {
    const kelas = await assertKelasPublishedOffering(payload.kelas_id, krs.semester_id);
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
