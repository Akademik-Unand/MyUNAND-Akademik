'use strict';

const { Op } = require('sequelize');
const {
  sequelize,
  BimbinganAkademik,
  Dosen,
  Mahasiswa,
  ProgramStudi,
  User,
  Krs,
  KrsDetil,
  Kelas,
  Matakuliah,
  Semester,
  JenisSemester,
} = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const logger = require('../../utils/logger');
const {
  mahasiswaIdsSql,
  orgFiltersOnMahasiswaId,
  orgFiltersOnProgramStudiId,
} = require('../../helpers/academicFilters');
const {
  assertUsableScope,
  scopeContainsUnit,
} = require('../../helpers/organizationScopeGuard');

const PA_AKTIF_SQL = "(SELECT ba.mahasiswa_id FROM bimbingan_akademik ba WHERE ba.status = 'aktif')";

const MAHASISWA_INCLUDE = {
  model: Mahasiswa,
  as: 'mahasiswa',
  include: [{ model: ProgramStudi, as: 'programStudi' }],
};

const INCLUDE = [
  { model: Dosen, as: 'dosen', include: [{ model: ProgramStudi, as: 'programStudi' }] },
  MAHASISWA_INCLUDE,
];

const LIST_OPTIONS = {
  searchFields: ['tahun_akademik', '$mahasiswa.nama$', '$mahasiswa.niu$', '$dosen.nama$'],
  sortableFields: ['tahun_akademik', 'status', 'createdAt'],
  filterableFields: ['dosen_id', 'mahasiswa_id', 'status', 'tahun_akademik'],
  // Bimbingan tidak menyimpan unit, jadi scope fakultas/departemen/prodi
  // diterjemahkan lewat mahasiswa bimbingannya.
  virtualFilters: orgFiltersOnMahasiswaId(sequelize),
  defaultInclude: INCLUDE,
  findOptions: { subQuery: false },
};

/** Kandidat PA = mahasiswa yang belum punya dosen PA aktif. */
const CANDIDATE_LIST_OPTIONS = {
  searchFields: ['nama', 'niu'],
  sortableFields: ['nama', 'niu', 'angkatan', 'createdAt'],
  filterableFields: ['program_studi_id', 'angkatan'],
  virtualFilters: orgFiltersOnProgramStudiId(sequelize),
  defaultInclude: [{ model: ProgramStudi, as: 'programStudi' }],
  findOptions: {
    where: { id: { [Op.notIn]: sequelize.literal(`(${PA_AKTIF_SQL})`) } },
  },
};

/** Level scope organisasi yang berwenang menetapkan/mengubah/menghapus PA. */
const MANAGE_LEVELS = new Set(['fakultas', 'departemen', 'prodi']);

/**
 * Identitas aktor: JWT hanya memuat `id`, jadi `dosen_id` dibaca dari DB bila
 * belum ada di payload.
 */
const actorDosenId = async (user) => {
  if (!user?.id) return null;
  if (user.dosen_id) return user.dosen_id;
  const row = await User.findByPk(user.id, { attributes: ['dosen_id'] });
  return row?.dosen_id || null;
};

/** Data dosen aktor (null bila akunnya tidak terhubung ke data dosen). */
const loadActorDosen = async (user) => {
  const dosenId = await actorDosenId(user);
  if (!dosenId) return null;
  return Dosen.findByPk(dosenId, { attributes: ['id', 'nama', 'program_studi_id'] });
};

/**
 * Dosen (mis. role `dosen`/`dosen-pa`) yang BUKAN admin unit: datanya harus
 * dibatasi ke mahasiswa bimbingannya sendiri. Mengembalikan null untuk admin
 * unit/universitas dan untuk akun yang tidak terhubung ke data dosen.
 */
const resolveDosenActor = async ({ user, orgScope } = {}) => {
  if (orgScope?.level) return null;
  return loadActorDosen(user);
};

/**
 * Penetapan/pengubahan/pelepasan PA adalah wewenang admin unit atau admin
 * universitas — dosen PA (role `dosen`/`dosen-pa`) hanya melihat & menyetujui.
 * Mengembalikan scope efektif, atau null bila pemanggilan internal.
 */
const assertWewenangKelolaPa = (context = {}) => {
  const { access, orgScope } = context;
  if (!access || !orgScope) return null; // pemanggilan internal (seeder/CLI)
  if (!access.id) throw new AppError('Aktor tidak dikenal', 403);
  if (orgScope.level === 'universitas') return orgScope;
  if (!MANAGE_LEVELS.has(orgScope.level)) {
    throw new AppError(
      'Penetapan dosen PA hanya dapat dilakukan admin program studi, departemen, atau fakultas',
      403
    );
  }
  assertUsableScope(access, orgScope);
  return orgScope;
};

/** Wewenang atas satu mahasiswa: unitnya harus ada dalam scope aktor. */
const assertDalamUnit = (mahasiswa, context) => {
  const scope = assertWewenangKelolaPa(context);
  if (!scope) return;
  if (!scopeContainsUnit(scope, mahasiswa)) {
    throw new AppError(
      `${mahasiswa?.nama || 'Mahasiswa'} berada di luar scope organisasi Anda`,
      403
    );
  }
};

const list = async (query, actor = {}) => {
  const dosen = await resolveDosenActor(actor);
  if (!dosen) return paginate(BimbinganAkademik, query, LIST_OPTIONS);
  return paginate(BimbinganAkademik, query, {
    ...LIST_OPTIONS,
    findOptions: { ...LIST_OPTIONS.findOptions, where: { dosen_id: dosen.id } },
  });
};

/**
 * Kandidat PA hanya relevan bagi admin yang berwenang menetapkan. Dosen tetap
 * boleh melihat kandidat di prodinya (informasi, bukan wewenang), sedangkan
 * tanpa prodi hasilnya dikosongkan alih-alih membocorkan seluruh universitas.
 */
const listCandidates = async (query, actor = {}) => {
  const dosen = await resolveDosenActor(actor);
  if (!dosen) return paginate(Mahasiswa, query, CANDIDATE_LIST_OPTIONS);
  const where = dosen.program_studi_id
    ? { program_studi_id: dosen.program_studi_id }
    : { id: { [Op.in]: [] } };
  return paginate(Mahasiswa, query, {
    ...CANDIDATE_LIST_OPTIONS,
    findOptions: { ...CANDIDATE_LIST_OPTIONS.findOptions, where },
  });
};

const getById = async (id) => {
  const item = await BimbinganAkademik.findByPk(id, { include: INCLUDE });
  if (!item) {
    throw new AppError('Bimbingan Akademik dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const loadMahasiswa = (id, transaction) =>
  Mahasiswa.findByPk(id, { include: [{ model: ProgramStudi, as: 'programStudi' }], transaction });

const loadDosen = (id, transaction) =>
  Dosen.findByPk(id, { include: [{ model: ProgramStudi, as: 'programStudi' }], transaction });

const labelProdi = (prodi) => prodi?.nama_resmi || prodi?.nama_singkat || 'unit tidak diketahui';

/**
 * Dosen PA harus sedepartemen (atau seprodi) dengan mahasiswanya. Mengembalikan
 * pesan alasan bila tidak memenuhi, atau null bila valid.
 */
const periksaUnitSama = (mahasiswa, dosen) => {
  if (mahasiswa.program_studi_id && mahasiswa.program_studi_id === dosen.program_studi_id) return null;
  const departemenMahasiswa = mahasiswa.programStudi?.departemen_id;
  const departemenDosen = dosen.programStudi?.departemen_id;
  if (departemenMahasiswa && departemenMahasiswa === departemenDosen) return null;
  return `Dosen ${dosen.nama} (${labelProdi(dosen.programStudi)}) berbeda unit dengan ${mahasiswa.nama} (${labelProdi(mahasiswa.programStudi)}). Dosen PA harus dari program studi atau departemen yang sama`;
};

const assertUnitSama = (mahasiswa, dosen) => {
  const alasan = periksaUnitSama(mahasiswa, dosen);
  if (alasan) throw new AppError(alasan, 422);
};

/** Muat dan validasi pasangan mahasiswa–dosen (keduanya wajib ada & seunit). */
const muatPasanganValid = async ({ mahasiswa_id, dosen_id }, transaction) => {
  const [mahasiswa, dosen] = await Promise.all([
    loadMahasiswa(mahasiswa_id, transaction),
    loadDosen(dosen_id, transaction),
  ]);
  if (!mahasiswa) throw new AppError('Mahasiswa tidak ditemukan', 404);
  if (!dosen) throw new AppError('Dosen tidak ditemukan', 404);
  assertUnitSama(mahasiswa, dosen);
  return { mahasiswa, dosen };
};

/** Tutup PA aktif mahasiswa (jadi `selesai`) — riwayat tetap tersimpan. */
const tutupPaAktif = async (mahasiswaId, { transaction, exceptId } = {}) => {
  const where = { mahasiswa_id: mahasiswaId, status: 'aktif' };
  if (exceptId) where.id = { [Op.ne]: exceptId };
  const [jumlah] = await BimbinganAkademik.update({ status: 'selesai' }, { where, transaction });
  return jumlah;
};

const findAktif = (mahasiswaId, transaction) =>
  BimbinganAkademik.findOne({
    where: { mahasiswa_id: mahasiswaId, status: 'aktif' },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

const create = (payload, context) =>
  sequelize.transaction(async (transaction) => {
    assertWewenangKelolaPa(context);
    const { mahasiswa, dosen } = await muatPasanganValid(payload, transaction);
    assertDalamUnit(mahasiswa, context);
    const status = payload.status || 'aktif';

    if (status === 'aktif') {
      const aktif = await findAktif(mahasiswa.id, transaction);
      if (aktif?.dosen_id === dosen.id) {
        throw new AppError(`${mahasiswa.nama} sudah dibimbing oleh ${dosen.nama}`, 409);
      }
      // PA baru menggantikan PA lama: yang lama ditutup, bukan dihapus.
      await tutupPaAktif(mahasiswa.id, { transaction });
    }

    const item = await BimbinganAkademik.create({ ...payload, status }, { transaction });
    logger.info(
      { bimbinganId: item.id, mahasiswaId: mahasiswa.id, dosenId: dosen.id },
      'Dosen PA ditetapkan'
    );
    return BimbinganAkademik.findByPk(item.id, { include: INCLUDE, transaction });
  });

const update = (id, payload, context) =>
  sequelize.transaction(async (transaction) => {
    const item = await BimbinganAkademik.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
    if (!item) throw new AppError('Bimbingan Akademik dengan ID tersebut tidak ditemukan', 404);

    const targetMahasiswaId = payload.mahasiswa_id || item.mahasiswa_id;
    const { mahasiswa } = await muatPasanganValid({
      mahasiswa_id: targetMahasiswaId,
      dosen_id: payload.dosen_id || item.dosen_id,
    }, transaction);
    assertDalamUnit(mahasiswa, context);
    // Baris lama juga harus terjangkau aktor, supaya admin unit tidak bisa
    // memindahkan bimbingan milik unit lain ke dirinya.
    if (item.mahasiswa_id !== mahasiswa.id) {
      const sebelumnya = await loadMahasiswa(item.mahasiswa_id, transaction);
      if (sebelumnya) assertDalamUnit(sebelumnya, context);
    }

    // Dijadikan aktif kembali → tutup PA aktif lain milik mahasiswa tersebut.
    if ((payload.status ?? item.status) === 'aktif') {
      await tutupPaAktif(payload.mahasiswa_id || item.mahasiswa_id, { transaction, exceptId: id });
    }

    await item.update(payload, { transaction });
    return BimbinganAkademik.findByPk(id, { include: INCLUDE, transaction });
  });

const remove = async (id, context) => {
  const item = await getById(id);
  assertDalamUnit(item.mahasiswa, context);
  await item.destroy();
  return { id };
};

/**
 * Penetapan massal: satu dosen untuk banyak mahasiswa sekaligus. Mahasiswa yang
 * unitnya berbeda (atau sudah dibimbing dosen itu) dilewati dengan alasan, bukan
 * menggagalkan seluruh proses.
 */
const assignBulk = ({ dosen_id, mahasiswa_ids, tahun_akademik, catatan }, context) =>
  sequelize.transaction(async (transaction) => {
    assertWewenangKelolaPa(context);
    const dosen = await loadDosen(dosen_id, transaction);
    if (!dosen) throw new AppError('Dosen tidak ditemukan', 404);

    const ids = [...new Set(mahasiswa_ids || [])];
    const daftar = await Mahasiswa.findAll({
      where: { id: { [Op.in]: ids } },
      include: [{ model: ProgramStudi, as: 'programStudi' }],
      transaction,
    });
    const ditemukan = new Map(daftar.map((row) => [row.id, row]));

    const hasil = { ditetapkan: 0, ditutup: 0, dilewati: [] };
    for (const id of ids) {
      const mahasiswa = ditemukan.get(id);
      if (!mahasiswa) {
        hasil.dilewati.push({ mahasiswa_id: id, nama: 'Mahasiswa tidak ditemukan', alasan: 'Data mahasiswa tidak ditemukan' });
        continue;
      }
      try {
        assertDalamUnit(mahasiswa, context);
      } catch (error) {
        hasil.dilewati.push({ mahasiswa_id: id, nama: mahasiswa.nama, alasan: error.message });
        continue;
      }
      const alasan = periksaUnitSama(mahasiswa, dosen);
      if (alasan) {
        hasil.dilewati.push({ mahasiswa_id: id, nama: mahasiswa.nama, alasan });
        continue;
      }
      const aktif = await findAktif(mahasiswa.id, transaction);
      if (aktif?.dosen_id === dosen.id) {
        hasil.dilewati.push({ mahasiswa_id: id, nama: mahasiswa.nama, alasan: `Sudah dibimbing ${dosen.nama}` });
        continue;
      }
      if (aktif) {
        await aktif.update({ status: 'selesai' }, { transaction });
        hasil.ditutup += 1;
      }
      await BimbinganAkademik.create({
        dosen_id: dosen.id,
        mahasiswa_id: mahasiswa.id,
        tahun_akademik: tahun_akademik || null,
        catatan: catatan || null,
        status: 'aktif',
      }, { transaction });
      hasil.ditetapkan += 1;
    }

    logger.info(
      { dosenId: dosen.id, ditetapkan: hasil.ditetapkan, ditutup: hasil.ditutup, dilewati: hasil.dilewati.length },
      'Penetapan dosen PA massal'
    );
    return { ...hasil, dosen: { id: dosen.id, nama: dosen.nama } };
  });

/** Terjemahkan filter scope menjadi parameter unit untuk subquery mahasiswa. */
const unitParamsFromFilter = (filter = {}) => {
  for (const key of ['program_studi_id', 'departemen_id', 'fakultas_id']) {
    const value = filter[key];
    if (value === undefined || value === '' || (Array.isArray(value) && !value.length)) continue;
    return { [key]: value };
  }
  return {};
};

/**
 * Angka ringkas untuk halaman kelola PA: berapa mahasiswa yang belum punya PA
 * (calon yang terblokir ambil KRS) dan beban terbesar dosen pembimbing.
 */
/**
 * Daftar id mahasiswa yang "dimiliki" aktor: seluruh unit untuk admin, atau
 * hanya bimbingannya sendiri untuk dosen tanpa scope organisasi.
 */
const mahasiswaScopeSql = async (query, actor) => {
  const dosen = await resolveDosenActor(actor);
  if (!dosen) return mahasiswaIdsSql(sequelize, unitParamsFromFilter(query.filter));
  return `SELECT m.id FROM mahasiswa m
           WHERE m.deletedAt IS NULL
             AND m.id IN (SELECT ba.mahasiswa_id FROM bimbingan_akademik ba
                           WHERE ba.dosen_id = ${sequelize.escape(dosen.id)} AND ba.status = 'aktif')`;
};

const summary = async (query = {}, actor = {}) => {
  const mhsSql = await mahasiswaScopeSql(query, actor);

  const [counts] = await sequelize.query(
    `SELECT
       (SELECT COUNT(*) FROM (${mhsSql}) AS mhs) AS total_mahasiswa,
       (SELECT COUNT(DISTINCT ba.mahasiswa_id) FROM bimbingan_akademik ba
          WHERE ba.status = 'aktif' AND ba.mahasiswa_id IN (${mhsSql})) AS sudah_punya_pa,
       (SELECT COUNT(DISTINCT ba.dosen_id) FROM bimbingan_akademik ba
          WHERE ba.status = 'aktif' AND ba.mahasiswa_id IN (${mhsSql})) AS dosen_membimbing`,
    { type: sequelize.QueryTypes.SELECT }
  );

  const beban = await sequelize.query(
    `SELECT d.id, d.nama, COUNT(*) AS jumlah
       FROM bimbingan_akademik ba
       INNER JOIN dosen d ON d.id = ba.dosen_id AND d.deletedAt IS NULL
      WHERE ba.status = 'aktif' AND ba.mahasiswa_id IN (${mhsSql})
      GROUP BY d.id, d.nama
      ORDER BY jumlah DESC, d.nama ASC
      LIMIT 5`,
    { type: sequelize.QueryTypes.SELECT }
  );

  const total = Number(counts?.total_mahasiswa || 0);
  const sudah = Number(counts?.sudah_punya_pa || 0);
  return {
    total_mahasiswa: total,
    sudah_punya_pa: sudah,
    belum_punya_pa: total - sudah,
    dosen_membimbing: Number(counts?.dosen_membimbing || 0),
    beban_teratas: beban.map((row) => ({ ...row, jumlah: Number(row.jumlah) })),
  };
};

const SANTRI_OPTIONS = {
  searchFields: ['$mahasiswa.nama$', '$mahasiswa.niu$'],
  sortableFields: ['createdAt', 'tahun_akademik'],
  filterableFields: ['tahun_akademik', 'mahasiswa_id'],
  defaultInclude: [MAHASISWA_INCLUDE],
  findOptions: { subQuery: false },
};

const toPlain = (row) => (typeof row.toJSON === 'function' ? row.toJSON() : row);

const sksMatakuliah = (detil) => Number(detil.kelas?.matakuliah?.jumlah_sks_kurikulum || 0);

/**
 * Ringkas KRS semester berjalan tiap mahasiswa (jumlah MK, SKS, status
 * persetujuan, dan pengajuan lintas prodinya) supaya seorang PA bisa langsung
 * melihat siapa yang belum mengisi KRS dan siapa yang menunggu keputusannya.
 */
const ringkasKrsUntukMahasiswa = async (mahasiswaIds) => {
  if (!mahasiswaIds.length) return { krs: new Map(), semester: null };

  // Semester berjalan mengikuti `semester.is_aktif` (sama seperti
  // krs.service.getContext) dan bersifat global universitas.
  const semesterAktif = await Semester.findOne({
    where: { is_aktif: true },
    include: [{ model: JenisSemester, as: 'jenisSemester' }],
    order: [['tahun', 'DESC']],
  });
  if (!semesterAktif) return { krs: new Map(), semester: null };

  const krsRows = await Krs.findAll({
    where: { mahasiswa_id: { [Op.in]: mahasiswaIds }, semester_id: semesterAktif.id },
    include: [
      {
        model: KrsDetil,
        as: 'krsDetil',
        include: [{ model: Kelas, as: 'kelas', include: [{ model: Matakuliah, as: 'matakuliah' }] }],
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  const hasil = new Map();
  for (const krs of krsRows) {
    if (hasil.has(krs.mahasiswa_id)) continue; // ambil KRS terbaru saja
    const detil = krs.krsDetil || [];
    hasil.set(krs.mahasiswa_id, {
      id: krs.id,
      approval_ke: krs.approval_ke,
      jumlah_mk: detil.length,
      total_sks: detil.reduce((sum, row) => sum + sksMatakuliah(row), 0),
      cross_pending: detil.filter(
        (row) => row.is_cross_enrollment && row.cross_enrollment_status === 'pending_pa'
      ).length,
      cross_approved: detil.filter(
        (row) => row.is_cross_enrollment && row.cross_enrollment_status === 'approved'
      ).length,
    });
  }

  return { krs: hasil, semester: semesterAktif };
};

/**
 * Daftar mahasiswa bimbingan milik dosen yang sedang login, dilengkapi status
 * KRS semester berjalan. Berlaku untuk role `dosen` maupun `dosen-pa`.
 */
const listSaya = async (query, actor = {}) => {
  const dosen = await loadActorDosen(actor.user);
  if (!dosen) {
    throw new AppError(
      'Akun Anda tidak terhubung ke data dosen, sehingga daftar bimbingan tidak tersedia',
      403
    );
  }

  const { rows, pagination } = await paginate(BimbinganAkademik, query, {
    ...SANTRI_OPTIONS,
    findOptions: {
      ...SANTRI_OPTIONS.findOptions,
      where: { dosen_id: dosen.id, status: 'aktif' },
    },
  });

  const polos = rows.map(toPlain);
  const { krs: krsMap, semester } = await ringkasKrsUntukMahasiswa(
    polos.map((row) => row.mahasiswa_id)
  );

  const semesterBlock = semester
    ? {
        id: semester.id,
        tahun: semester.tahun,
        jenisSemester: semester.jenisSemester,
      }
    : null;

  return {
    rows: polos.map((row) => ({
      ...row,
      semester: semesterBlock,
      sks_maksimal: row.mahasiswa?.programStudi?.sks_maksimal ?? null,
      krs: krsMap.get(row.mahasiswa_id) || null,
    })),
    pagination,
  };
};

module.exports = {
  list,
  listCandidates,
  listSaya,
  getById,
  create,
  update,
  remove,
  assignBulk,
  summary,
  loadActorDosen,
};
