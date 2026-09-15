'use strict';

const { Op } = require('sequelize');
const {
  sequelize,
  Krs,
  KrsDetil,
  Mahasiswa,
  User,
  BimbinganAkademik,
  ProgramStudi,
  Semester,
  Kelas,
  Matakuliah,
  PenawaranMatakuliah,
  PenawaranMatakuliahDetil,
  PenawaranMatakuliahProdi,
  JadwalKelas,
  DosenKelas,
} = require('../../models');
const AppError = require('../../helpers/AppError');
const { paginate } = require('../../helpers/listQuery');
const { assertKrsPeriodForSemester } = require('../../helpers/academicPeriod');
const { assertActivePa } = require('../../helpers/activePa');
const { assertJadwalKrsTidakBentrok } = require('../../helpers/jadwalBentrok');
const { assertKelasKrsReady } = require('../../helpers/kelasKrsEligibility');

/** Status yang masih dihitung memakai kapasitas kelas & kuota lintas prodi. */
const ACTIVE_STATUSES = ['pending_pa', 'approved'];

const INCLUDE = [
  {
    model: Krs,
    as: 'krs',
    include: [
      { model: Mahasiswa, as: 'mahasiswa', include: [{ model: ProgramStudi, as: 'programStudi' }] },
      { model: Semester, as: 'semester' },
    ],
  },
  {
    model: Kelas,
    as: 'kelas',
    include: [
      { model: Matakuliah, as: 'matakuliah' },
      {
        model: PenawaranMatakuliahDetil,
        as: 'penawaranMatakuliah',
        include: [{
          model: PenawaranMatakuliah,
          as: 'penawaran',
          include: [
            { model: ProgramStudi, as: 'programStudi' },
            { model: Semester, as: 'semester' },
          ],
        }],
      },
      { model: JadwalKelas, as: 'jadwalKelas' },
    ],
  },
];

const getStudent = async (userId, transaction) => {
  const row = await Mahasiswa.findOne({
    include: [
      { association: 'user', where: { id: userId }, attributes: [] },
      { model: ProgramStudi, as: 'programStudi' },
    ],
    transaction,
  });
  if (!row) throw new AppError('Akun tidak terhubung ke mahasiswa', 403);
  return row;
};

const getAdviseeIds = async (dosenId) => {
  const rows = await BimbinganAkademik.findAll({
    where: { dosen_id: dosenId, status: 'aktif' },
    attributes: ['mahasiswa_id'],
  });
  return [...new Set(rows.map((row) => row.mahasiswa_id))];
};

/**
 * Batasi daftar pengajuan sesuai peran pemanggil: mahasiswa hanya miliknya,
 * dosen hanya mahasiswa bimbingannya, admin/prodi melihat semua.
 */
const scopeWhereForUser = async (user) => {
  if (!user?.id) return null;
  const actor = await User.findByPk(user.id, { attributes: ['id', 'mahasiswa_id', 'dosen_id'] });
  if (!actor) return null;
  if (actor.mahasiswa_id) return { '$krs.mahasiswa_id$': actor.mahasiswa_id };
  if (actor.dosen_id) {
    const adviseeIds = await getAdviseeIds(actor.dosen_id);
    return { '$krs.mahasiswa_id$': { [Op.in]: adviseeIds } };
  }
  return null;
};

const list = async (query, user) => {
  const scope = await scopeWhereForUser(user);
  return paginate(KrsDetil, query, {
    searchFields: ['$krs.mahasiswa.nama$', '$krs.mahasiswa.niu$'],
    sortableFields: ['cross_enrollment_status', 'createdAt'],
    filterableFields: ['cross_enrollment_status', 'kelas_id', 'krs_id'],
    defaultInclude: INCLUDE,
    where: { is_cross_enrollment: true },
    findOptions: { subQuery: false, distinct: true, where: scope },
  });
};

/**
 * Kuota lintas prodi adalah jatah tambahan DI LUAR kapasitas kelas
 * (`kelas.jumlah_peserta_max` yang berlaku untuk mahasiswa prodi sendiri).
 * Mahasiswa lintas prodi dihitung terpisah dan dibatasi kuota ini.
 */
const validateCrossQuota = async ({ detail, target, header, student, transaction }) => {
  const crossCount = await KrsDetil.count({
    include: [
      { model: Krs, as: 'krs', include: [{ model: Mahasiswa, as: 'mahasiswa', where: { program_studi_id: student.program_studi_id } }] },
      { model: Kelas, as: 'kelas', where: { penawaran_matakuliah_id: detail.id } },
    ],
    where: { is_cross_enrollment: true, cross_enrollment_status: ACTIVE_STATUSES },
    transaction,
  });
  const quota = target?.kuota ?? detail.kuota_lintas_prodi ?? header.kuota_lintas_prodi_default;
  if (quota > 0 && crossCount >= quota) {
    throw new AppError('Kuota lintas prodi penuh', 409);
  }
};

const validateStudentLoad = async ({ krs, kelas, sksMaksimal, transaction }) => {
  const existing = await KrsDetil.findAll({
    where: {
      krs_id: krs.id,
      // Pengajuan yang ditolak tidak lagi mengikat KRS, jadi tidak dihitung
      // sebagai beban SKS/jadwal mahasiswa.
      [Op.or]: [
        { is_cross_enrollment: false },
        { cross_enrollment_status: { [Op.ne]: 'rejected' } },
      ],
    },
    include: [{ model: Kelas, as: 'kelas', include: [{ model: Matakuliah, as: 'matakuliah' }, { model: JadwalKelas, as: 'jadwalKelas' }] }],
    transaction,
  });

  const usedSks = existing.reduce((sum, row) => sum + (row.kelas.matakuliah.jumlah_sks_kurikulum || 0), 0);
  const sks = kelas.matakuliah.jumlah_sks_kurikulum || 0;
  if (sksMaksimal && usedSks + sks > sksMaksimal) {
    throw new AppError('Batas SKS maksimal terlampaui', 409);
  }

  // Pesan menyebut mata kuliah yang bentrok (kode, kelas, hari, dan jam),
  // bukan sekadar "jadwal bertabrakan".
  assertJadwalKrsTidakBentrok(kelas, existing);
};

const enroll = (userId, payload) =>
  sequelize.transaction(async (transaction) => {
    const student = await getStudent(userId, transaction);

    // payload.penawaran_matakuliah_id berisi id PenawaranMatakuliahDetil (satu mata kuliah yang ditawarkan).
    const detail = await PenawaranMatakuliahDetil.findByPk(payload.penawaran_matakuliah_id, {
      include: [
        {
          model: PenawaranMatakuliah,
          as: 'penawaran',
          include: [
            { model: ProgramStudi, as: 'programStudi' },
            { model: Semester, as: 'semester' },
            { model: PenawaranMatakuliahProdi, as: 'prodiTujuan' },
          ],
        },
        { model: Matakuliah, as: 'matakuliah' },
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    const header = detail?.penawaran;
    if (!detail || !header || header.status !== 'published') {
      throw new AppError('Matakuliah tidak ditawarkan', 409);
    }

    if (header.program_studi_id === student.program_studi_id) {
      throw new AppError('Penawaran ini bukan lintas program studi', 422);
    }

    if (detail.matakuliah.has_prasyarat) {
      throw new AppError('Mata kuliah berprasyarat tidak dapat diambil lintas prodi', 422);
    }

    const target = header.prodiTujuan.find((row) => row.program_studi_id === student.program_studi_id);
    if (header.akses === 'terpilih' && !target) {
      throw new AppError('Program studi mahasiswa tidak memiliki akses', 403);
    }

    const semesterKe = Math.max(1, (header.semester.tahun - student.angkatan) * 2 + 1);
    const min = detail.minimal_semester ?? header.minimal_semester_default;
    const max = detail.maksimal_semester ?? header.maksimal_semester_default;
    if ((min && semesterKe < min) || (max && semesterKe > max)) {
      throw new AppError('Semester mahasiswa tidak memenuhi syarat', 422);
    }

    await assertActivePa(student.id, { transaction });

    const kelas = await Kelas.findOne({
      where: { id: payload.kelas_id, penawaran_matakuliah_id: detail.id },
      include: [
        { model: Matakuliah, as: 'matakuliah' },
        { model: JadwalKelas, as: 'jadwalKelas' },
        { model: DosenKelas, as: 'dosenKelas', attributes: ['id'] },
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!kelas) throw new AppError('Kelas penawaran tidak ditemukan', 404);
    if (kelas.matakuliah.has_prasyarat) {
      throw new AppError('Mata kuliah berprasyarat tidak dapat diambil lintas prodi', 422);
    }
    assertKelasKrsReady(kelas);

    const krs = await Krs.findOne({
      where: { mahasiswa_id: student.id, semester_id: header.semester_id },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!krs) throw new AppError('KRS semester aktif belum tersedia', 409);
    await assertKrsPeriodForSemester(krs.semester_id);

    // Kelas yang sama tidak boleh muncul dua kali di KRS — baik sebagai baris
    // reguler maupun pengajuan lintas prodi.
    const duplicate = await KrsDetil.findOne({
      where: { krs_id: krs.id, kelas_id: kelas.id },
      transaction,
    });
    if (duplicate) throw new AppError('Kelas sudah diambil', 409);

    await validateCrossQuota({ detail, target, header, student, transaction });
    await validateStudentLoad({
      krs,
      kelas,
      sksMaksimal: student.programStudi?.sks_maksimal,
      transaction,
    });

    return KrsDetil.create(
      {
        krs_id: krs.id,
        kelas_id: kelas.id,
        is_cross_enrollment: true,
        cross_enrollment_status: 'pending_pa',
        approved: '0',
      },
      { transaction }
    );
  });

/**
 * Keputusan PA atas pengajuan lintas prodi tidak lagi punya endpoint sendiri:
 * pengajuan ikut disetujui saat PA menyetujui KRS-nya (`PATCH /krs/:id/approve`),
 * sehingga seluruh persetujuan KRS berada di satu tempat.
 */
module.exports = { list, enroll };
