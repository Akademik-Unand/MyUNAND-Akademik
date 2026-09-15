'use strict';

const { Op } = require('sequelize');
const {
  sequelize,
  Mahasiswa,
  Dosen,
  Matakuliah,
  Kelas,
  Semester,
  JenisSemester,
  Krs,
  PenawaranMatakuliah,
  ProgramStudi,
  Departemen,
  User,
  RekapCp,
  Cp,
  Fakultas,
} = require('../../models');
const AppError = require('../../helpers/AppError');
const appConfig = require('../../config/app');
const { getPeriod, JENIS } = require('../../helpers/academicPeriod');

const DUMMY_UNIVERSITY_SUMMARY = {
  mahasiswa: 24870,
  dosen: 1315,
  matakuliah: 2940,
  kelas: 4860,
  penawaran: 1320,
  semester: { id: 'demo-semester', tahun: 2026, jenisSemester: { nama: 'Ganjil' } },
  fakultas: [
    ['Kedokteran', 2650, 180], ['Teknik', 2430, 128], ['Ekonomi dan Bisnis', 2310, 112],
    ['Pertanian', 2180, 126], ['MIPA', 2050, 135], ['Ilmu Sosial dan Ilmu Politik', 1960, 92],
    ['Teknologi Pertanian', 1850, 96], ['Hukum', 1720, 78], ['Ilmu Budaya', 1580, 86],
    ['Keperawatan', 1380, 74], ['Kesehatan Masyarakat', 1260, 68], ['Farmasi', 1210, 70],
    ['Teknologi Informasi', 1150, 52], ['Peternakan', 1080, 64], ['Kedokteran Gigi', 930, 54],
    ['Pascasarjana', 1130, 80],
  ].map(([nama, mahasiswa, dosen], index) => ({ id: `demo-${index + 1}`, nama, mahasiswa, dosen })),
  status_krs: [
    { nama: 'Disetujui', jumlah: 18120 },
    { nama: 'Menunggu', jumlah: 2380 },
    { nama: 'Belum mengisi', jumlah: 4370 },
  ],
  cakupan_pa: [
    { nama: 'Memiliki PA', jumlah: 22480 },
    { nama: 'Belum memiliki PA', jumlah: 2390 },
  ],
  tren_akademik: [
    { semester: '2023/24 Ganjil', mahasiswa_aktif: 22100, peserta_krs: 19620 },
    { semester: '2023/24 Genap', mahasiswa_aktif: 22650, peserta_krs: 20280 },
    { semester: '2024/25 Ganjil', mahasiswa_aktif: 23320, peserta_krs: 21140 },
    { semester: '2024/25 Genap', mahasiswa_aktif: 23910, peserta_krs: 21960 },
    { semester: '2025/26 Ganjil', mahasiswa_aktif: 24430, peserta_krs: 22510 },
    { semester: '2025/26 Genap', mahasiswa_aktif: 24870, peserta_krs: 22890 },
  ],
};

const summary = async () => {
  if (appConfig.useDummyDashboard) return DUMMY_UNIVERSITY_SUMMARY;
  const semester = await findActiveSemester();
  const semesterId = semester?.id ? sequelize.escape(semester.id) : 'NULL';
  const [mahasiswa, dosen, matakuliah, kelas, fakultas, statusKrs, pa, penawaran] = await Promise.all([
    Mahasiswa.count(),
    Dosen.count(),
    Matakuliah.count(),
    Kelas.count(),
    Fakultas.findAll({ attributes: ['id', 'nama_resmi'] }),
    sequelize.query(
      `SELECT
         SUM(CASE WHEN k.approval_ke > 0 THEN 1 ELSE 0 END) AS disetujui,
         SUM(CASE WHEN k.approval_ke = 0 THEN 1 ELSE 0 END) AS menunggu,
         GREATEST((SELECT COUNT(*) FROM mahasiswa WHERE deletedAt IS NULL) - COUNT(DISTINCT k.mahasiswa_id), 0) AS belum_mengisi
       FROM krs k WHERE k.semester_id = ${semesterId}`,
      { type: sequelize.QueryTypes.SELECT },
    ),
    sequelize.query(
      `SELECT COUNT(*) AS total,
              COUNT(DISTINCT CASE WHEN ba.status = 'aktif' THEN m.id END) AS memiliki_pa
         FROM mahasiswa m
         LEFT JOIN bimbingan_akademik ba ON ba.mahasiswa_id = m.id AND ba.status = 'aktif'
        WHERE m.deletedAt IS NULL`,
      { type: sequelize.QueryTypes.SELECT },
    ),
    semester ? PenawaranMatakuliah.count({ where: { semester_id: semester.id } }) : 0,
  ]);
  const distribution = await Promise.all(fakultas.map(async (item) => {
    const include = [{ model: ProgramStudi, as: 'programStudi', attributes: [], required: true, where: { fakultas_id: item.id } }];
    const [jumlahMahasiswa, jumlahDosen] = await Promise.all([
      Mahasiswa.count({ include }),
      Dosen.count({ include }),
    ]);
    return { id: item.id, nama: item.nama_resmi, mahasiswa: jumlahMahasiswa, dosen: jumlahDosen };
  }));
  const krs = statusKrs[0] || {};
  const paRow = pa[0] || {};
  const totalPa = Number(paRow.total || 0);
  const memilikiPa = Number(paRow.memiliki_pa || 0);
  return {
    mahasiswa, dosen, matakuliah, kelas, penawaran,
    semester: semester ? { id: semester.id, tahun: semester.tahun, jenisSemester: semester.jenisSemester } : null,
    fakultas: distribution,
    status_krs: [
      { nama: 'Disetujui', jumlah: Number(krs.disetujui || 0) },
      { nama: 'Menunggu', jumlah: Number(krs.menunggu || 0) },
      { nama: 'Belum mengisi', jumlah: Number(krs.belum_mengisi || 0) },
    ],
    cakupan_pa: [
      { nama: 'Memiliki PA', jumlah: memilikiPa },
      { nama: 'Belum memiliki PA', jumlah: Math.max(totalPa - memilikiPa, 0) },
    ],
  };
};

const findActiveSemester = () => Semester.findOne({
  where: { is_aktif: true },
  include: [{ model: JenisSemester, as: 'jenisSemester' }],
  order: [['tahun', 'DESC']],
});

const resolveProdiIds = async (level, ids) => {
  if (level === 'prodi') return ids;
  const where = level === 'departemen'
    ? { departemen_id: { [Op.in]: ids } }
    : { [Op.or]: [{ fakultas_id: { [Op.in]: ids } }, { '$departemen.fakultas_id$': { [Op.in]: ids } }] };
  const rows = await ProgramStudi.findAll({
    where,
    attributes: ['id'],
    include: level === 'fakultas' ? [{ model: Departemen, as: 'departemen', attributes: [] }] : [],
  });
  return [...new Set(rows.map((row) => row.id))];
};

const cpRows = async (where) => {
  const rows = await RekapCp.findAll({
    where,
    attributes: ['cp_id', [sequelize.fn('AVG', sequelize.col('nilai_capaian')), 'nilai_capaian']],
    include: [
      { model: Cp, as: 'cp', attributes: ['nama_cp', 'nilai_min'], required: true },
      { model: Mahasiswa, as: 'mahasiswa', attributes: [], required: true },
    ],
    group: ['cp_id', 'cp.id', 'cp.nama_cp', 'cp.nilai_min'],
    order: [[{ model: Cp, as: 'cp' }, 'nama_cp', 'ASC']],
  });
  return rows.map((row) => ({
    id: row.cp_id,
    nama: row.cp?.nama_cp,
    nilai: row.get ? Number(row.get('nilai_capaian')) : Number(row.nilai_capaian),
    target: Number(row.cp?.nilai_min || 0),
  }));
};

const academicSummary = async (user) => {
  const actor = await User.findByPk(user?.id, { attributes: ['mahasiswa_id'] });
  if (!actor?.mahasiswa_id) throw new AppError('Akun tidak terhubung ke data mahasiswa', 403);
  const mahasiswa = await Mahasiswa.findByPk(actor.mahasiswa_id, { attributes: ['id', 'niu', 'nama', 'program_studi_id'] });
  if (!mahasiswa) throw new AppError('Data mahasiswa tidak ditemukan', 404);

  const [cpl, courses] = await Promise.all([
    cpRows({ mahasiswa_id: mahasiswa.id }),
    sequelize.query(
      `SELECT COUNT(*) AS mata_kuliah, COALESCE(SUM(x.sks), 0) AS sks FROM (
         SELECT kl.matakuliah_id, MAX(COALESCE(m.jumlah_sks_kurikulum, 0)) AS sks
           FROM krs k JOIN krs_detil kd ON kd.krs_id = k.id
           JOIN kelas kl ON kl.id = kd.kelas_id JOIN matakuliah m ON m.id = kl.matakuliah_id
          WHERE k.mahasiswa_id = ${sequelize.escape(mahasiswa.id)} AND kd.approved = '2'
          GROUP BY kl.matakuliah_id
       ) x`,
      { type: sequelize.QueryTypes.SELECT },
    ),
  ]);
  const row = courses[0] || {};
  return {
    mahasiswa: { id: mahasiswa.id, niu: mahasiswa.niu, nama: mahasiswa.nama },
    mata_kuliah: Number(row.mata_kuliah || 0),
    sks: Number(row.sks || 0),
    ipk: null,
    cpl_tercapai: cpl.filter((item) => item.nilai >= item.target).length,
    cpl,
  };
};

const orgSummary = async ({ level, prodi_ids = [], departemen_ids = [], fakultas_ids = [] }) => {
  const empty = { mahasiswa: 0, dosen: 0, kelas: 0, krs_pending: 0, penawaran: 0, periode: null, semester: null, sks_maksimal: null, prodi: [], cpl: [] };
  if (!level) return empty;
  const ids = level === 'prodi' ? prodi_ids : level === 'departemen' ? departemen_ids : fakultas_ids;
  if (!ids.length) return empty;
  const prodiIds = await resolveProdiIds(level, ids);
  if (!prodiIds.length) return empty;

  const semester = await findActiveSemester();
  const prodiWhere = { program_studi_id: { [Op.in]: prodiIds } };
  const [mahasiswa, dosen, prodi] = await Promise.all([
    Mahasiswa.count({ where: prodiWhere }),
    Dosen.count({ where: prodiWhere }),
    ProgramStudi.findAll({ attributes: ['id', 'nama_resmi'], where: { id: { [Op.in]: prodiIds } } }),
  ]);
  const breakdown = await Promise.all(prodi.map(async (item) => ({
    id: item.id, nama: item.nama_resmi, mahasiswa: await Mahasiswa.count({ where: { program_studi_id: item.id } }),
  })));
  let kelas = 0; let krs_pending = 0; let penawaran = 0; let cpl = [];
  if (semester) {
    [kelas, penawaran, cpl] = await Promise.all([
      Kelas.count({ where: { ...prodiWhere, semester_id: semester.id } }),
      PenawaranMatakuliah.count({ where: { ...prodiWhere, semester_id: semester.id } }),
      cpRows({ semester_id: semester.id, '$mahasiswa.program_studi_id$': { [Op.in]: prodiIds } }),
    ]);
    krs_pending = await Krs.count({
      where: { approval_ke: 0, semester_id: semester.id },
      include: [{ model: Mahasiswa, as: 'mahasiswa', attributes: [], required: true, where: prodiWhere }], distinct: true,
    });
  }
  const periode = semester ? await getPeriod(semester.id, JENIS.KRS) : null;
  const sks_maksimal = prodiIds.length === 1
    ? (await ProgramStudi.findByPk(prodiIds[0], { attributes: ['sks_maksimal'] }))?.sks_maksimal ?? null : null;
  return {
    mahasiswa, dosen, kelas, krs_pending, penawaran, periode, prodi: breakdown, cpl,
    semester: semester ? { id: semester.id, tahun: semester.tahun, jenisSemester: semester.jenisSemester } : null,
    sks_maksimal,
  };
};

const dosenSummary = async (user) => {
  const actor = user?.id ? await User.findByPk(user.id, { attributes: ['dosen_id'] }) : null;
  const dosenId = actor?.dosen_id;
  if (!dosenId) throw new AppError('Akun Anda tidak terhubung ke data dosen, sehingga ringkasan bimbingan tidak tersedia', 403);
  const dosen = await Dosen.findByPk(dosenId, {
    attributes: ['id', 'nama', 'program_studi_id'],
    include: [{ model: ProgramStudi, as: 'programStudi', attributes: ['id', 'sks_maksimal'] }],
  });
  const adviseeSql = `(SELECT ba.mahasiswa_id FROM bimbingan_akademik ba WHERE ba.dosen_id = ${sequelize.escape(dosenId)} AND ba.status = 'aktif')`;
  const semester = await findActiveSemester();
  const activeSemesterSql = semester ? sequelize.escape(semester.id) : 'NULL';
  const [counts] = await sequelize.query(
    `SELECT (SELECT COUNT(*) FROM mahasiswa m WHERE m.id IN ${adviseeSql} AND m.deletedAt IS NULL) AS mahasiswa_bimbingan,
       (SELECT COUNT(DISTINCT k.mahasiswa_id) FROM krs k WHERE k.semester_id = ${activeSemesterSql} AND k.mahasiswa_id IN ${adviseeSql}) AS sudah_isi_krs,
       (SELECT COUNT(*) FROM krs k WHERE k.approval_ke = 0 AND k.semester_id = ${activeSemesterSql} AND k.mahasiswa_id IN ${adviseeSql}) AS krs_menunggu`,
    { type: sequelize.QueryTypes.SELECT },
  );
  const angkatan = await sequelize.query(
    `SELECT m.angkatan, COUNT(*) AS jumlah FROM mahasiswa m WHERE m.id IN ${adviseeSql} AND m.deletedAt IS NULL GROUP BY m.angkatan ORDER BY m.angkatan DESC`,
    { type: sequelize.QueryTypes.SELECT },
  );
  const periode = semester ? await getPeriod(semester.id, JENIS.KRS) : null;
  const bimbingan = Number(counts?.mahasiswa_bimbingan || 0); const sudahIsi = Number(counts?.sudah_isi_krs || 0);
  return {
    mahasiswa_bimbingan: bimbingan, sudah_isi_krs: sudahIsi, belum_isi_krs: Math.max(bimbingan - sudahIsi, 0),
    krs_menunggu: Number(counts?.krs_menunggu || 0), angkatan: angkatan.map((row) => ({ ...row, jumlah: Number(row.jumlah) })),
    status_krs: [{ nama: 'Disetujui/terisi', jumlah: Math.max(sudahIsi - Number(counts?.krs_menunggu || 0), 0) }, { nama: 'Menunggu', jumlah: Number(counts?.krs_menunggu || 0) }, { nama: 'Belum mengisi', jumlah: Math.max(bimbingan - sudahIsi, 0) }],
    periode,
    semester: semester ? { id: semester.id, tahun: semester.tahun, jenisSemester: semester.jenisSemester } : null,
    sks_maksimal: dosen?.programStudi?.sks_maksimal ?? null,
  };
};

module.exports = { summary, academicSummary, orgSummary, dosenSummary };
