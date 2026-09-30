'use strict';

const { Op } = require('sequelize');
const { sequelize, Krs, KrsDetil, Kelas, Matakuliah, JadwalKelas, DosenKelas, Ruang, Shift, Dosen, Cpmk, Scp, Cp, Mahasiswa, ProgramStudi, Semester, JenisSemester, User, BimbinganAkademik } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const logger = require('../../utils/logger');
const {
  assertKrsPeriodForSemester,
  getPeriod,
  JENIS,
} = require('../../helpers/academicPeriod');
const { assertActivePa } = require('../../helpers/activePa');
const { getUserAcademicIdentity } = require('../../helpers/userAcademicProfile');
const {
  isPendingKrsDetail,
  krsApprovalStatus,
} = require('../../helpers/krsApproval');

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
  filterableFields: ['mahasiswa_id', 'semester_id'],
  defaultInclude: [
    {
      model: Mahasiswa,
      as: 'mahasiswa',
      include: [{ model: ProgramStudi, as: 'programStudi' }],
    },
    {
      model: Semester,
      as: 'semester',
      include: [{ model: JenisSemester, as: 'jenisSemester' }],
    },
    {
      model: KrsDetil,
      as: 'krsDetil',
      // `separate: true` membuat Sequelize menjalankan query terpisah untuk
      // krsDetil setelah KRS induk diambil. Ini mencegah truncation hasMany
      // saat `subQuery: false` + `limit` diterapkan pada query induk yang
      // sudah di-JOIN dengan banyak tabel (CPMK × JadwalKelas memperbanyak
      // baris SQL sehingga LIMIT bisa memotong detil sebelum semua dimuat).
      separate: true,
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

const getActor = async (userId) => ({ id: userId, ...await getUserAcademicIdentity(userId) });

const requireActorDosen = async (user = {}) => {
  const actor = user?.id ? await getActor(user.id) : null;
  if (!actor?.dosen_id) {
    throw new AppError('Akun tidak terhubung ke data dosen', 403);
  }
  return actor;
};

const toPlainWithApprovalStatus = (row) => {
  const plain = typeof row?.toJSON === 'function' ? row.toJSON() : row;
  return { ...plain, status_persetujuan: krsApprovalStatus(plain) };
};

/**
 * Batasi daftar KRS sesuai peran pemanggil: mahasiswa hanya miliknya, dosen
 * hanya mahasiswa bimbingannya, admin/prodi melihat semua.
 */
const scopeWhereForUser = async (user) => {
  if (!user?.id) return null;
  const actor = await getActor(user.id);
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
  const result = await paginate(Krs, query, {
    ...LIST_OPTIONS,
    findOptions: { subQuery: false, distinct: true, where: scope },
  });
  return { ...result, rows: result.rows.map(toPlainWithApprovalStatus) };
};

/**
 * Semua semester yang tersedia beserta jumlah KRS pending mahasiswa bimbingan.
 * Endpoint khusus ini menghindari kebutuhan izin master semester untuk dosen PA.
 */
const listApprovalSemesters = async (user = {}) => {
  const actor = await requireActorDosen(user);
  const adviseeIds = await getAdviseeIds(actor.dosen_id);
  const semesterRows = await Semester.findAll({
    include: SEMESTER_INCLUDE,
    order: [['tahun', 'DESC'], [{ model: JenisSemester, as: 'jenisSemester' }, 'urut', 'ASC']],
  });

  const semesters = new Map(semesterRows.map((semester) => {
    const plain = typeof semester?.toJSON === 'function' ? semester.toJSON() : semester;
    return [plain.id, { ...plain, pending_count: 0 }];
  }));

  const rows = adviseeIds.length
    ? await Krs.findAll({
      where: { mahasiswa_id: { [Op.in]: adviseeIds } },
      attributes: ['id', 'semester_id', 'approval_ke'],
      include: [
        { model: Semester, as: 'semester', include: SEMESTER_INCLUDE },
        {
          model: KrsDetil,
          as: 'krsDetil',
          attributes: ['approved', 'is_cross_enrollment', 'cross_enrollment_status'],
        },
      ],
    })
    : [];

  for (const row of rows) {
    const plain = typeof row?.toJSON === 'function' ? row.toJSON() : row;
    if (!plain?.semester_id || !semesters.has(plain.semester_id)) continue;
    const current = semesters.get(plain.semester_id);
    if (krsApprovalStatus(plain) === 'pending_pa') current.pending_count += 1;
  }

  return [...semesters.values()].sort((left, right) => {
    if (Boolean(left.is_aktif) !== Boolean(right.is_aktif)) return left.is_aktif ? -1 : 1;
    if (Boolean(left.pending_count) !== Boolean(right.pending_count)) return left.pending_count ? -1 : 1;
    if (Number(left.tahun) !== Number(right.tahun)) return Number(right.tahun) - Number(left.tahun);
    return Number(left.jenisSemester?.urut || 0) - Number(right.jenisSemester?.urut || 0);
  });
};

const assertActiveAdvisor = async (krs, user, transaction) => {
  const actor = await requireActorDosen(user);
  const assignment = await BimbinganAkademik.findOne({
    where: {
      dosen_id: actor.dosen_id,
      mahasiswa_id: krs.mahasiswa_id,
      status: 'aktif',
    },
    attributes: ['id'],
    transaction,
  });
  if (!assignment) {
    throw new AppError('KRS bukan milik mahasiswa bimbingan aktif Anda', 403);
  }
};

const assertSelectedSemester = (krs, semesterId) => {
  if (String(krs.semester_id) !== String(semesterId)) {
    throw new AppError('KRS tidak berada pada semester persetujuan yang dipilih', 409);
  }
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
    const actor = await getUserAcademicIdentity(user.id);
    if (actor.mahasiswa_id) {
      resolved.mahasiswa_id = actor.mahasiswa_id;
      // KRS reguler maupun lintas prodi disetujui dosen PA, jadi PA aktif
      // wajib ada sebelum mahasiswa mulai menyusun KRS.
      await assertActivePa(actor.mahasiswa_id);
    }
  }
  await assertKrsPeriodForSemester(resolved.semester_id);
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

const approve = async (id, { approval_ke, semester_id } = {}, user = {}) => {
  return sequelize.transaction(async (transaction) => {
    const krs = await Krs.findByPk(id, {
      include: [{ model: KrsDetil, as: 'krsDetil' }],
      transaction,
    });

    if (!krs) {
      throw new AppError('KRS tidak ditemukan', 404);
    }

    await assertActiveAdvisor(krs, user, transaction);
    assertSelectedSemester(krs, semester_id);

    const now = new Date();
    await krs.update({
      approval_ke: approval_ke !== undefined ? approval_ke : krs.approval_ke + 1,
      jam_selesai: now,
    }, { transaction });

    if (krs.krsDetil && krs.krsDetil.length > 0) {
      // Baris KRS reguler ikut disetujui bersama KRS-nya.
      await KrsDetil.update(
        { approved: '1' },
        { where: { krs_id: krs.id, is_cross_enrollment: false, approved: '0' }, transaction }
      );

      // Pengajuan lintas prodi tidak punya antrean persetujuan terpisah lagi:
      // keputusan PA diambil bersamaan dengan persetujuan KRS, jadi seluruh
      // baris lintas prodi yang BELUM diputuskan ikut ditetapkan di sini —
      // `pending_pa` maupun status kosong (NULL) yang terwarisi dari data lama.
      // Baris yang sudah diputuskan (approved/rejected) tidak ditimpa agar
      // riwayatnya tetap utuh.
      await KrsDetil.update(
        {
          approved: '1',
          cross_enrollment_status: 'approved',
          pa_approved_by: user?.id || null,
          pa_approved_at: now,
        },
        {
          where: {
            krs_id: krs.id,
            is_cross_enrollment: true,
            [Op.or]: [
              { cross_enrollment_status: 'pending_pa' },
              { cross_enrollment_status: { [Op.is]: null } },
            ],
          },
          transaction,
        }
      );
    }

    logger.info({ krsId: id, approval_ke: krs.approval_ke }, 'KRS approved');
    return Krs.findByPk(id, { include: LIST_OPTIONS.defaultInclude, transaction });
  });
};

const reject = async (id, { reason, semester_id }, user = {}) => {
  return sequelize.transaction(async (transaction) => {
    const krs = await Krs.findByPk(id, {
      include: [{ model: KrsDetil, as: 'krsDetil' }],
      transaction,
    });
    if (!krs) throw new AppError('KRS tidak ditemukan', 404);

    await assertActiveAdvisor(krs, user, transaction);
    assertSelectedSemester(krs, semester_id);
    if (!(krs.krsDetil || []).some(isPendingKrsDetail)) {
      throw new AppError('KRS tidak memiliki mata kuliah yang menunggu keputusan', 409);
    }

    const now = new Date();
    const rejection = {
      approved: '2',
      rejected_by: user.id,
      rejected_at: now,
      rejection_reason: reason,
    };
    await krs.update({ jam_selesai: now }, { transaction });
    await KrsDetil.update(rejection, {
      where: {
        krs_id: krs.id,
        is_cross_enrollment: false,
        approved: '0',
      },
      transaction,
    });
    await KrsDetil.update(
      { ...rejection, cross_enrollment_status: 'rejected' },
      {
        where: {
          krs_id: krs.id,
          is_cross_enrollment: true,
          [Op.or]: [
            { cross_enrollment_status: 'pending_pa' },
            { cross_enrollment_status: { [Op.is]: null } },
          ],
        },
        transaction,
      }
    );

    logger.info({ krsId: id, rejectedBy: user.id }, 'KRS rejected');
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

const SEMESTER_INCLUDE = [
  { model: JenisSemester, as: 'jenisSemester' },
];

const getContext = async (userId) => {
  const actor = await User.findByPk(userId, {
    include: [{ model: Mahasiswa, as: 'mahasiswa', include: [{ model: ProgramStudi, as: 'programStudi' }] }],
  });
  const mahasiswa = actor?.mahasiswa;
  if (!mahasiswa) {
    throw new AppError('Akun tidak terhubung ke mahasiswa', 403);
  }

  // Semester berjalan bersifat global universitas (`semester.is_aktif`).
  const semester = await Semester.findOne({
    where: { is_aktif: true },
    include: SEMESTER_INCLUDE,
    order: [['tahun', 'DESC']],
  });

  const krs = semester
    ? await Krs.findOne({
      where: { mahasiswa_id: mahasiswa.id, semester_id: semester.id },
      include: [
        { model: Mahasiswa, as: 'mahasiswa' },
        { model: Semester, as: 'semester', include: SEMESTER_INCLUDE },
        {
          model: KrsDetil,
          as: 'krsDetil',
          include: [{
            model: Kelas,
            as: 'kelas',
            // `jadwalKelas` dibutuhkan klien untuk mendeteksi bentrok jadwal MK
            // yang mau diambil (dan menyebut MK mana yang bentrok).
            include: [
              { model: Matakuliah, as: 'matakuliah' },
              {
                model: DosenKelas,
                as: 'dosenKelas',
                include: [{ model: Dosen, as: 'dosen' }],
              },
              {
                model: JadwalKelas,
                as: 'jadwalKelas',
                include: [{ model: Ruang, as: 'ruang' }, { model: Shift, as: 'shift' }],
              },
            ],
          }],
        },
      ],
    })
    : null;

  // Jendela pengambilan KRS satu semester untuk seluruh universitas (periode
  // global) — sumber kebenaran tunggal yang menggantikan tanggal per prodi.
  const periode = semester ? await getPeriod(semester.id, JENIS.KRS) : null;

  return {
    mahasiswa,
    semester,
    sks_maksimal: mahasiswa.programStudi?.sks_maksimal ?? null,
    krs,
    periode,
  };
};

module.exports = {
  list,
  listApprovalSemesters,
  getById,
  create,
  update,
  remove,
  approve,
  reject,
  updateDetilStatus,
  getByMahasiswa,
  getContext,
  approvalStatus: krsApprovalStatus,
};
