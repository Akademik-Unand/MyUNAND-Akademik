'use strict';

const { Op } = require('sequelize');
const { sequelize, Krs, KrsDetil, Kelas, Matakuliah, JadwalKelas, DosenKelas, Ruang, Shift, Dosen, Cpmk, Scp, Cp, Mahasiswa, ProgramStudi, SemesterProdi, Semester, JenisSemester, User, BimbinganAkademik } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const logger = require('../../utils/logger');
const { assertKrsPeriodForSemesterProdi } = require('../../helpers/academicPeriod');
const { assertActivePa } = require('../../helpers/activePa');

/**
 * CPMK (hanya level root) beserta SCP pendukung dan Sub-CPMK-nya. Dipakai supaya
 * dosen PA bisa mencocokkan cakupan mata kuliah — terutama yang lintas prodi —
 * sebelum menyetujui KRS.
 */
const CPMK_INCLUDE = {
  model: Cpmk,
  as: 'cpmk',
  where: { parent_cpmk_id: null },
  required: false,
  include: [
    {
      model: Scp,
      as: 'scp',
      through: { attributes: [] },
      include: [{ model: Cp, as: 'cp' }],
    },
    {
      model: Cpmk,
      as: 'subCpmk',
      include: [
        {
          model: Scp,
          as: 'scp',
          through: { attributes: [] },
          include: [{ model: Cp, as: 'cp' }],
        },
      ],
    },
  ],
};

const LIST_OPTIONS = {
  searchFields: ['$mahasiswa.nama$', '$mahasiswa.niu$'],
  sortableFields: ['approval_ke', 'createdAt'],
  filterableFields: ['mahasiswa_id', 'semester_prodi_id'],
  defaultInclude: [
    { model: Mahasiswa, as: 'mahasiswa' },
    {
      model: SemesterProdi,
      as: 'semesterProdi',
      include: [
        { model: ProgramStudi, as: 'programStudi' },
        { model: Semester, as: 'semester', include: [{ model: JenisSemester, as: 'jenisSemester' }] },
      ],
    },
    {
      model: KrsDetil,
      as: 'krsDetil',
      include: [
        {
          model: Kelas,
          as: 'kelas',
          include: [
            { model: Matakuliah, as: 'matakuliah', include: [CPMK_INCLUDE] },
            { model: DosenKelas, as: 'dosenKelas', include: [{ model: Dosen, as: 'dosen' }] },
            {
              model: JadwalKelas,
              as: 'jadwalKelas',
              include: [{ model: Ruang, as: 'ruang' }, { model: Shift, as: 'shift' }],
            },
          ],
        },
      ],
    },
  ],
};

const getAdviseeIds = async (dosenId) => {
  const rows = await BimbinganAkademik.findAll({
    where: { dosen_id: dosenId, status: 'aktif' },
    attributes: ['mahasiswa_id'],
  });
  return [...new Set(rows.map((row) => row.mahasiswa_id))];
};

/**
 * Batasi daftar KRS sesuai peran pemanggil: mahasiswa hanya miliknya, dosen
 * hanya mahasiswa bimbingannya, admin/prodi melihat semua.
 */
const scopeWhereForUser = async (user) => {
  if (!user?.id) return null;
  const actor = await User.findByPk(user.id, { attributes: ['id', 'mahasiswa_id', 'dosen_id'] });
  if (!actor) return null;
  if (actor.mahasiswa_id) return { mahasiswa_id: actor.mahasiswa_id };
  if (actor.dosen_id) {
    const adviseeIds = await getAdviseeIds(actor.dosen_id);
    return { mahasiswa_id: { [Op.in]: adviseeIds } };
  }
  return null;
};

const list = async (query, user) => {
  const scope = await scopeWhereForUser(user);
  return paginate(Krs, query, {
    ...LIST_OPTIONS,
    findOptions: { subQuery: false, distinct: true, where: scope },
  });
};

const getById = async (id) => {
  const item = await Krs.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('KRS dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload, user) => {
  // Mahasiswa hanya boleh membuat KRS untuk dirinya sendiri.
  const resolved = { ...payload };
  if (user?.id) {
    const actor = await User.findByPk(user.id, { attributes: ['mahasiswa_id'] });
    if (actor?.mahasiswa_id) {
      resolved.mahasiswa_id = actor.mahasiswa_id;
      // KRS reguler maupun lintas prodi disetujui dosen PA, jadi PA aktif
      // wajib ada sebelum mahasiswa mulai menyusun KRS.
      await assertActivePa(actor.mahasiswa_id);
    }
  }
  await assertKrsPeriodForSemesterProdi(resolved.semester_prodi_id);
  const item = await Krs.create(resolved);
  logger.info({ krsId: item.id, mahasiswaId: resolved.mahasiswa_id }, 'User submit KRS');
  return Krs.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return Krs.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

const approve = async (id, { approval_ke } = {}) => {
  return sequelize.transaction(async (transaction) => {
    const krs = await Krs.findByPk(id, {
      include: [{ model: KrsDetil, as: 'krsDetil' }],
      transaction,
    });

    if (!krs) {
      throw new AppError('KRS tidak ditemukan', 404);
    }

    await krs.update({
      approval_ke: approval_ke !== undefined ? approval_ke : krs.approval_ke + 1,
      jam_selesai: new Date(),
    }, { transaction });

    // Hanya baris KRS reguler yang ikut disetujui. Pengajuan lintas prodi punya
    // keputusan PA sendiri (`cross_enrollment_status`), jadi jangan ditimpa agar
    // statusnya tidak bertentangan (mis. `approved='1'` tapi masih menunggu PA).
    if (krs.krsDetil && krs.krsDetil.length > 0) {
      await KrsDetil.update(
        { approved: '1' },
        { where: { krs_id: krs.id, is_cross_enrollment: false, approved: '0' }, transaction }
      );
    }

    logger.info({ krsId: id, approval_ke: krs.approval_ke }, 'KRS approved');
    return Krs.findByPk(id, { include: LIST_OPTIONS.defaultInclude, transaction });
  });
};

const updateDetilStatus = async (detilId, approved) => {
  const detil = await KrsDetil.findByPk(detilId);
  if (!detil) {
    throw new AppError('Item KRS Detil tidak ditemukan', 404);
  }
  await detil.update({ approved: String(approved) });
  return detil;
};

const getByMahasiswa = async (mahasiswaId) => {
  return Krs.findAll({
    where: { mahasiswa_id: mahasiswaId },
    include: LIST_OPTIONS.defaultInclude,
    order: [['createdAt', 'DESC']],
  });
};

const SEMESTER_PRODI_INCLUDE = [
  { model: ProgramStudi, as: 'programStudi' },
  { model: Semester, as: 'semester', include: [{ model: JenisSemester, as: 'jenisSemester' }] },
];

const getContext = async (userId) => {
  const actor = await User.findByPk(userId, {
    include: [{ model: Mahasiswa, as: 'mahasiswa', include: [{ model: ProgramStudi, as: 'programStudi' }] }],
  });
  const mahasiswa = actor?.mahasiswa;
  if (!mahasiswa) {
    throw new AppError('Akun tidak terhubung ke mahasiswa', 403);
  }

  const semesterProdi = await SemesterProdi.findOne({
    where: { program_studi_id: mahasiswa.program_studi_id },
    include: SEMESTER_PRODI_INCLUDE.map((item) =>
      item.as === 'semester'
        ? { ...item, where: { is_aktif: true }, required: true }
        : item
    ),
    order: [['updatedAt', 'DESC']],
  });

  const krs = semesterProdi
    ? await Krs.findOne({
      where: { mahasiswa_id: mahasiswa.id, semester_prodi_id: semesterProdi.id },
      include: [
        { model: Mahasiswa, as: 'mahasiswa' },
        { model: SemesterProdi, as: 'semesterProdi', include: SEMESTER_PRODI_INCLUDE },
        {
          model: KrsDetil,
          as: 'krsDetil',
          include: [{
            model: Kelas,
            as: 'kelas',
            // `jadwalKelas` dibutuhkan klien untuk mendeteksi bentrok jadwal MK
            // yang mau diambil (dan menyebut MK mana yang bentrok).
            include: [{ model: Matakuliah, as: 'matakuliah' }, { model: JadwalKelas, as: 'jadwalKelas' }],
          }],
        },
      ],
    })
    : null;

  return { mahasiswa, semesterProdi, krs };
};

module.exports = { list, getById, create, update, remove, approve, updateDetilStatus, getByMahasiswa, getContext };
