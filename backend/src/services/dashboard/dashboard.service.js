'use strict';

const { Op } = require('sequelize');
const { Mahasiswa, Dosen, Matakuliah, Kelas, SemesterProdi, Semester, JenisSemester, Krs, PenawaranMatakuliah, User } = require('../../models');
const { sequelize } = require('../../models');
const AppError = require('../../helpers/AppError');

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
 * Bangun kondisi WHERE untuk filter berdasarkan scope organisasi.
 * - prodi: filter langsung ke program_studi_id
 * - departemen: filter via subquery program_studi.departemen_id
 * - fakultas: filter via subquery program_studi.fakultas_id
 */
const buildScopeCondition = (scopeLevel, ids) => {
  if (!ids.length) return null;
  if (scopeLevel === 'prodi') return { program_studi_id: { [Op.in]: ids } };
  // departemen / fakultas — perlu subquery ke tabel program_studi
  const col = scopeLevel === 'departemen' ? 'departemen_id' : 'fakultas_id';
  return { ['$programStudi.' + col + '$']: { [Op.in]: ids } };
};

/**
 * Ringkasan dashboard yang di-scope ke level organisasi tertentu.
 * Dipakai oleh admin-prodi, admin-departemen, admin-fakultas, dan pimpinan.
 */
const orgSummary = async ({ level, prodi_ids = [], departemen_ids = [], fakultas_ids = [] }) => {
  const empty = { mahasiswa: 0, dosen: 0, kelas: 0, krs_pending: 0, penawaran: 0, semesterProdi: null };

  if (!level) return empty;

  const ids = level === 'prodi' ? prodi_ids : level === 'departemen' ? departemen_ids : fakultas_ids;
  if (!ids.length) return empty;

  const scopeCondition = buildScopeCondition(level, ids);

  // Untuk departemen/fakultas, perlu include ProgramStudi agar scope condition bisa join
  const includeProdi = level !== 'prodi'
    ? [{ model: require('../../models').ProgramStudi, as: 'programStudi', attributes: [] }]
    : [];

  // Cari semester prodi aktif yang paling baru
  const semesterProdiWhere = { is_aktif: true };
  if (level === 'prodi') {
    semesterProdiWhere.program_studi_id = { [Op.in]: ids };
  }

  const semesterProdi = await SemesterProdi.findOne({
    where: semesterProdiWhere,
    include: [
      { model: Semester, as: 'semester' },
      ...(level !== 'prodi'
        ? [{ model: require('../../models').ProgramStudi, as: 'programStudi', attributes: [] }]
        : []),
    ],
    order: [['createdAt', 'DESC']],
  });

  // Filter semester prodi IDs yang relevan untuk scope ini
  let semesterProdiIds = [];
  if (semesterProdi) {
    semesterProdiIds = [semesterProdi.id];
  } else {
    // Cari semua semester prodi aktif dalam scope
    const spRows = await SemesterProdi.findAll({
      where: semesterProdiWhere,
      attributes: ['id'],
      include: level !== 'prodi'
        ? [{ model: require('../../models').ProgramStudi, as: 'programStudi', attributes: [] }]
        : [],
    });
    semesterProdiIds = spRows.map((r) => r.id);
  }

  const mahasiswaWhere = { ...scopeCondition };
  const dosenWhere = { ...scopeCondition };

  const [mahasiswa, dosen] = await Promise.all([
    Mahasiswa.count({
      where: mahasiswaWhere,
      ...(level !== 'prodi' ? { include: includeProdi } : {}),
    }),
    Dosen.count({
      where: dosenWhere,
      ...(level !== 'prodi' ? { include: includeProdi } : {}),
    }),
  ]);

  let kelas = 0;
  let krs_pending = 0;
  let penawaran = 0;

  if (semesterProdiIds.length) {
    const whereSemProdi = { semester_prodi_id: { [Op.in]: semesterProdiIds } };

    [kelas, penawaran] = await Promise.all([
      Kelas.count({ where: whereSemProdi }),
      PenawaranMatakuliah.count({ where: whereSemProdi }),
    ]);

    krs_pending = await Krs.count({
      where: { approval_ke: 0, semester_prodi_id: { [Op.in]: semesterProdiIds } },
    });
  }

  return {
    mahasiswa,
    dosen,
    kelas,
    krs_pending,
    penawaran,
    semesterProdi: semesterProdi
      ? {
          id: semesterProdi.id,
          tanggal_krs_mulai: semesterProdi.tanggal_krs_mulai,
          tanggal_krs_selesai: semesterProdi.tanggal_krs_selesai,
          sks_maksimal: semesterProdi.sks_maksimal,
          semester: semesterProdi.semester
            ? { tahun: semesterProdi.semester.tahun, jenisSemester: semesterProdi.semester.jenisSemester }
            : null,
        }
      : null,
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
  });
  const adviseeSql = `(SELECT ba.mahasiswa_id FROM bimbingan_akademik ba
                        WHERE ba.dosen_id = ${sequelize.escape(dosenId)} AND ba.status = 'aktif')`;

  // Semester berjalan = semester_prodi milik semester ber-flag `is_aktif`.
  const activeSemesterProdiSql = `(SELECT sp.id FROM semester_prodi sp
                                    INNER JOIN semester s ON s.id = sp.semester_id
                                   WHERE s.is_aktif = 1)`;

  const [counts] = await sequelize.query(
    `SELECT
       (SELECT COUNT(*) FROM mahasiswa m WHERE m.id IN ${adviseeSql} AND m.deletedAt IS NULL) AS mahasiswa_bimbingan,
       (SELECT COUNT(DISTINCT k.mahasiswa_id) FROM krs k
         WHERE k.semester_prodi_id IN ${activeSemesterProdiSql}
           AND k.mahasiswa_id IN ${adviseeSql}) AS sudah_isi_krs,
       (SELECT COUNT(*) FROM krs k
         WHERE k.approval_ke = 0 AND k.semester_prodi_id IN ${activeSemesterProdiSql}
           AND k.mahasiswa_id IN ${adviseeSql}) AS krs_menunggu,
       (SELECT COUNT(*) FROM krs_detil kd
         WHERE kd.is_cross_enrollment = 1 AND kd.cross_enrollment_status = 'pending_pa'
           AND kd.krs_id IN (SELECT k.id FROM krs k
                              WHERE k.semester_prodi_id IN ${activeSemesterProdiSql}
                                AND k.mahasiswa_id IN ${adviseeSql})) AS pengajuan_menunggu`,
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

  // Semester berjalan ditentukan oleh `semester.is_aktif` (sama seperti alur
  // KRS di krs.service.getContext) — flag `semester_prodi.is_aktif` tidak
  // diandalkan karena banyak prodi tidak pernah di-set.
  const semesterProdi = dosen?.program_studi_id
    ? await SemesterProdi.findOne({
        where: { program_studi_id: dosen.program_studi_id },
        attributes: ['id', 'sks_maksimal'],
        include: [
          {
            model: Semester,
            as: 'semester',
            required: true,
            where: { is_aktif: true },
            include: [{ model: JenisSemester, as: 'jenisSemester' }],
          },
        ],
        order: [['createdAt', 'DESC']],
      })
    : null;

  const bimbingan = Number(counts?.mahasiswa_bimbingan || 0);
  const sudahIsi = Number(counts?.sudah_isi_krs || 0);
  return {
    mahasiswa_bimbingan: bimbingan,
    sudah_isi_krs: sudahIsi,
    belum_isi_krs: Math.max(bimbingan - sudahIsi, 0),
    krs_menunggu: Number(counts?.krs_menunggu || 0),
    pengajuan_menunggu: Number(counts?.pengajuan_menunggu || 0),
    angkatan: angkatan.map((row) => ({ ...row, jumlah: Number(row.jumlah) })),
    semesterProdi: semesterProdi
      ? {
          id: semesterProdi.id,
          sks_maksimal: semesterProdi.sks_maksimal,
          semester: semesterProdi.semester
            ? {
                tahun: semesterProdi.semester.tahun,
                jenisSemester: semesterProdi.semester.jenisSemester,
              }
            : null,
        }
      : null,
  };
};

module.exports = { summary, orgSummary, dosenSummary };
