'use strict';

const { Op } = require('sequelize');
const { Mahasiswa, Dosen, Matakuliah, Kelas, Semester, JenisSemester, Krs, PenawaranMatakuliah, ProgramStudi, Departemen, User } = require('../../models');
const { sequelize } = require('../../models');
const AppError = require('../../helpers/AppError');
const { getPeriod, JENIS } = require('../../helpers/academicPeriod');

const summary = async () => {
  const [mahasiswa, dosen, matakuliah, kelas] = await Promise.all([
    Mahasiswa.count(),
    Dosen.count(),
    Matakuliah.count(),
    Kelas.count(),
  ]);

  return { mahasiswa, dosen, matakuliah, kelas };
};

/**
 * Semester berjalan bersifat global universitas (`semester.is_aktif`).
 * `null` bila belum ada semester yang diaktifkan.
 */
const findActiveSemester = () =>
  Semester.findOne({
    where: { is_aktif: true },
    include: [{ model: JenisSemester, as: 'jenisSemester' }],
    order: [['tahun', 'DESC']],
  });

/**
 * Ubah scope organisasi menjadi daftar id program studi. Level prodi memakai id
 * yang diberikan; departemen/fakultas memetakan unitnya ke seluruh prodi di
 * dalamnya (fakultas ikut menghitung prodi yang menempel lewat departemen).
 */
const resolveProdiIds = async (level, ids) => {
  if (level === 'prodi') return ids;
  const column = level === 'departemen' ? 'departemen_id' : 'fakultas_id';
  const where =
    level === 'departemen'
      ? { departemen_id: { [Op.in]: ids } }
      : {
          [Op.or]: [
            { fakultas_id: { [Op.in]: ids } },
            { '$departemen.fakultas_id$': { [Op.in]: ids } },
          ],
        };
  const rows = await ProgramStudi.findAll({
    where,
    attributes: ['id'],
    include:
      level === 'fakultas'
        ? [{ model: Departemen, as: 'departemen', attributes: [] }]
        : [],
  });
  return [...new Set(rows.map((row) => row.id))];
};

/**
 * Ringkasan dashboard yang di-scope ke level organisasi tertentu.
 * Dipakai oleh admin-prodi, admin-departemen, admin-fakultas, dan pimpinan.
 */
const orgSummary = async ({ level, prodi_ids = [], departemen_ids = [], fakultas_ids = [] }) => {
  const empty = { mahasiswa: 0, dosen: 0, kelas: 0, krs_pending: 0, penawaran: 0, periode: null, semester: null, sks_maksimal: null };

  if (!level) return empty;

  const ids = level === 'prodi' ? prodi_ids : level === 'departemen' ? departemen_ids : fakultas_ids;
  if (!ids.length) return empty;

  const prodiIds = await resolveProdiIds(level, ids);
  if (!prodiIds.length) return empty;

  const semester = await findActiveSemester();
  const prodiWhere = { program_studi_id: { [Op.in]: prodiIds } };

  const [mahasiswa, dosen] = await Promise.all([
    Mahasiswa.count({ where: prodiWhere }),
    Dosen.count({ where: prodiWhere }),
  ]);

  let kelas = 0;
  let krs_pending = 0;
  let penawaran = 0;

  if (semester) {
    [kelas, penawaran] = await Promise.all([
      Kelas.count({ where: { ...prodiWhere, semester_id: semester.id } }),
      PenawaranMatakuliah.count({ where: { ...prodiWhere, semester_id: semester.id } }),
    ]);

    krs_pending = await Krs.count({
      where: { approval_ke: 0, semester_id: semester.id },
      include: [
        {
          model: Mahasiswa,
          as: 'mahasiswa',
          attributes: [],
          required: true,
          where: prodiWhere,
        },
      ],
      distinct: true,
    });
  }

  // Jendela pengambilan KRS semester berjalan (periode global).
  const periode = semester ? await getPeriod(semester.id, JENIS.KRS) : null;

  // Kuota SKS hanya bermakna tunggal saat scope-nya satu prodi.
  const sks_maksimal =
    prodiIds.length === 1
      ? (await ProgramStudi.findByPk(prodiIds[0], { attributes: ['sks_maksimal'] }))?.sks_maksimal ?? null
      : null;

  return {
    mahasiswa,
    dosen,
    kelas,
    krs_pending,
    penawaran,
    periode,
    semester: semester
      ? { id: semester.id, tahun: semester.tahun, jenisSemester: semester.jenisSemester }
      : null,
    sks_maksimal,
  };
};

/**
 * Ringkasan dashboard dosen pembimbing akademik (role `dosen`/`dosen-pa`):
 * berapa mahasiswa bimbingannya, siapa yang belum mengisi KRS, dan berapa tugas
 * persetujuan yang menunggu keputusannya.
 */
const dosenSummary = async (user) => {
  const actor = user?.id
    ? await User.findByPk(user.id, { attributes: ['dosen_id'] })
    : null;
  const dosenId = actor?.dosen_id;
  if (!dosenId) {
    throw new AppError(
      'Akun Anda tidak terhubung ke data dosen, sehingga ringkasan bimbingan tidak tersedia',
      403
    );
  }

  const dosen = await Dosen.findByPk(dosenId, {
    attributes: ['id', 'nama', 'program_studi_id'],
    include: [{ model: ProgramStudi, as: 'programStudi', attributes: ['id', 'sks_maksimal'] }],
  });
  const adviseeSql = `(SELECT ba.mahasiswa_id FROM bimbingan_akademik ba
                        WHERE ba.dosen_id = ${sequelize.escape(dosenId)} AND ba.status = 'aktif')`;

  const semester = await findActiveSemester();
  const activeSemesterSql = semester ? sequelize.escape(semester.id) : 'NULL';

  // Pengajuan lintas prodi ikut disetujui bersama KRS-nya, jadi tugas persetujuan
  // PA cukup dihitung sekali: berapa KRS yang belum disetujui.
  const [counts] = await sequelize.query(
    `SELECT
       (SELECT COUNT(*) FROM mahasiswa m WHERE m.id IN ${adviseeSql} AND m.deletedAt IS NULL) AS mahasiswa_bimbingan,
       (SELECT COUNT(DISTINCT k.mahasiswa_id) FROM krs k
         WHERE k.semester_id = ${activeSemesterSql}
           AND k.mahasiswa_id IN ${adviseeSql}) AS sudah_isi_krs,
       (SELECT COUNT(*) FROM krs k
         WHERE k.approval_ke = 0 AND k.semester_id = ${activeSemesterSql}
           AND k.mahasiswa_id IN ${adviseeSql}) AS krs_menunggu`,
    { type: sequelize.QueryTypes.SELECT }
  );

  const angkatan = await sequelize.query(
    `SELECT m.angkatan, COUNT(*) AS jumlah
       FROM mahasiswa m
      WHERE m.id IN ${adviseeSql} AND m.deletedAt IS NULL
      GROUP BY m.angkatan
      ORDER BY m.angkatan DESC`,
    { type: sequelize.QueryTypes.SELECT }
  );

  // Jendela pengambilan KRS semester berjalan (periode global).
  const periode = semester ? await getPeriod(semester.id, JENIS.KRS) : null;

  const bimbingan = Number(counts?.mahasiswa_bimbingan || 0);
  const sudahIsi = Number(counts?.sudah_isi_krs || 0);
  return {
    mahasiswa_bimbingan: bimbingan,
    sudah_isi_krs: sudahIsi,
    belum_isi_krs: Math.max(bimbingan - sudahIsi, 0),
    krs_menunggu: Number(counts?.krs_menunggu || 0),
    angkatan: angkatan.map((row) => ({ ...row, jumlah: Number(row.jumlah) })),
    periode,
    semester: semester
      ? { id: semester.id, tahun: semester.tahun, jenisSemester: semester.jenisSemester }
      : null,
    sks_maksimal: dosen?.programStudi?.sks_maksimal ?? null,
  };
};

module.exports = { summary, orgSummary, dosenSummary };
