'use strict';

const { sequelize, Semester, JenisSemester } = require('../../models');
const AppError = require('../../helpers/AppError');
const {
  buildCpmkRows,
  buildEvaluasi,
  buildNilaiPeserta,
} = require('../../helpers/laporanCpMatakuliah');

const semesterFilterSql = (semesterId) =>
  semesterId ? `AND sm.id = ${sequelize.escape(semesterId)}` : '';

const kurikulumLabel = (row) => {
  if (!row?.kurikulum_nama) return null;
  if (row.kurikulum_tahun === null || row.kurikulum_tahun === undefined) return row.kurikulum_nama;
  return `${row.kurikulum_nama} — tahun ${row.kurikulum_tahun}`;
};

const getMatakuliahDetail = async ({ matakuliahId, semester_id, kurikulum_id } = {}) => {
  if (!matakuliahId) {
    throw new AppError('Mata kuliah wajib diisi', 422);
  }
  const mkId = sequelize.escape(matakuliahId);
  const kur = kurikulum_id ? sequelize.escape(kurikulum_id) : null;

  const mkRows = await sequelize.query(
    `SELECT
      mk.id,
      mk.kode_matakuliah,
      mk.nama_resmi,
      mk.jumlah_sks_kurikulum,
      kur.id AS kurikulum_id,
      kur.nama AS kurikulum_nama,
      kur.tahun AS kurikulum_tahun,
      ps.nama_resmi AS prodi_nama
    FROM matakuliah AS mk
    INNER JOIN matakuliah_kurikulum AS mkk ON mkk.matakuliah_id = mk.id
    INNER JOIN kurikulum AS kur ON kur.id = mkk.kurikulum_id AND kur.deletedAt IS NULL
    LEFT JOIN program_studi AS ps ON ps.id = kur.program_studi_id AND ps.deletedAt IS NULL
    WHERE mk.id = ${mkId} AND mk.deletedAt IS NULL
    ORDER BY (mkk.kurikulum_id = ${kur}) DESC, kur.tahun DESC
    LIMIT 1`,
    { type: sequelize.QueryTypes.SELECT }
  );
  const mk = mkRows[0];
  if (!mk) {
    throw new AppError('Mata kuliah dengan ID tersebut tidak ditemukan', 404);
  }

  const semesterInfo = semester_id
    ? await Semester.findByPk(semester_id, {
      include: [{ model: JenisSemester, as: 'jenisSemester' }],
    })
    : null;
  const semesterLabel = semesterInfo
    ? [semesterInfo.jenisSemester?.nama || semesterInfo.jenisSemester?.alias, semesterInfo.tahun]
      .filter((part) => part !== undefined && part !== null && part !== '')
      .join(' ')
    : null;

  const kelasRows = await sequelize.query(
    `SELECT
      k.id,
      k.nama,
      (SELECT COUNT(*) FROM krs_detil AS kd WHERE kd.kelas_id = k.id) AS jumlah_peserta,
      GROUP_CONCAT(DISTINCT d.nama ORDER BY d.nama SEPARATOR '||') AS dosen_names
    FROM kelas AS k
    LEFT JOIN semester_prodi AS smp ON smp.id = k.semester_prodi_id
    LEFT JOIN semester AS sm ON sm.id = smp.semester_id AND sm.deletedAt IS NULL
    LEFT JOIN dosen_kelas AS dk ON dk.kelas_id = k.id
    LEFT JOIN dosen AS d ON d.id = dk.dosen_id AND d.deletedAt IS NULL
    WHERE k.matakuliah_id = ${mkId} AND k.deletedAt IS NULL
      ${semesterFilterSql(semester_id)}
    GROUP BY k.id, k.nama
    ORDER BY k.nama ASC`,
    { type: sequelize.QueryTypes.SELECT }
  );

  const cpmkRows = await sequelize.query(
    `SELECT
      cpmk.id AS cpmk_id,
      cpmk.parent_cpmk_id AS parent_cpmk_id,
      cpmk.nama_cpmk,
      cpmk.deskripsi,
      scp.persen_capai_nilai_min AS target_persen,
      scp.nilai_min,
      cp.nama_cp,
      scp.nama_scp,
      scp.deskripsi AS scp_deskripsi,
      sp.id AS sumber_id,
      sp.nama_sumber_penilaian,
      sp.bobot
    FROM cpmk
    INNER JOIN matakuliah AS mk ON mk.id = cpmk.matakuliah_id AND mk.deletedAt IS NULL
    LEFT JOIN cpmk_scp AS cs ON cs.cpmk_id = cpmk.id
      OR (
        NOT EXISTS (SELECT 1 FROM cpmk_scp AS z WHERE z.cpmk_id = cpmk.id)
        AND cs.cpmk_id = cpmk.parent_cpmk_id
      )
    LEFT JOIN scp ON scp.id = cs.scp_id AND scp.deletedAt IS NULL
    LEFT JOIN cp ON cp.id = scp.cp_id AND cp.deletedAt IS NULL
      ${kur ? `AND cp.kurikulum_id = ${kur}` : ''}
    LEFT JOIN sumber_penilaian AS sp ON sp.cpmk_id = cpmk.id
    WHERE cpmk.matakuliah_id = ${mkId} AND cpmk.deletedAt IS NULL
    ORDER BY cpmk.createdAt ASC, cpmk.nama_cpmk ASC, sp.nama_sumber_penilaian ASC`,
    { type: sequelize.QueryTypes.SELECT }
  );

  const nilaiRows = await sequelize.query(
    `SELECT
      kd.id AS krs_detil_id,
      m.id AS mahasiswa_id,
      m.niu,
      m.nama AS mahasiswa_nama,
      m.angkatan,
      k.nama AS kelas_nama,
      COALESCE(cpmk_parent.id, cpmk.id) AS root_cpmk_id,
      COALESCE(cpmk_parent.nama_cpmk, cpmk.nama_cpmk) AS root_cpmk_nama,
      cpmk.id AS cpmk_id,
      cpmk.nama_cpmk AS cpmk_nama,
      sp.id AS sumber_id,
      sp.nama_sumber_penilaian AS sumber_nama,
      sp.bobot,
      nm.nilai
    FROM krs_detil AS kd
    INNER JOIN krs AS kr ON kr.id = kd.krs_id
    INNER JOIN mahasiswa AS m ON m.id = kr.mahasiswa_id AND m.deletedAt IS NULL
    INNER JOIN kelas AS k ON k.id = kd.kelas_id AND k.deletedAt IS NULL
    INNER JOIN matakuliah AS mk ON mk.id = k.matakuliah_id AND mk.deletedAt IS NULL
    INNER JOIN cpmk ON cpmk.matakuliah_id = mk.id AND cpmk.deletedAt IS NULL
      AND (
        cpmk.parent_cpmk_id IS NOT NULL
        OR NOT EXISTS (SELECT 1 FROM cpmk AS child WHERE child.parent_cpmk_id = cpmk.id AND child.deletedAt IS NULL)
      )
    LEFT JOIN cpmk AS cpmk_parent ON cpmk_parent.id = cpmk.parent_cpmk_id AND cpmk_parent.deletedAt IS NULL
    INNER JOIN sumber_penilaian AS sp ON sp.cpmk_id = cpmk.id
    LEFT JOIN nilai_mahasiswa AS nm ON nm.krs_detil_id = kd.id AND nm.sumber_penilaian_id = sp.id
    INNER JOIN semester_prodi AS smp ON smp.id = k.semester_prodi_id
    LEFT JOIN semester AS sm ON sm.id = smp.semester_id AND sm.deletedAt IS NULL
    WHERE mk.id = ${mkId}
      ${semesterFilterSql(semester_id)}
    ORDER BY m.niu ASC, cpmk.createdAt ASC, sp.nama_sumber_penilaian ASC`,
    { type: sequelize.QueryTypes.SELECT }
  );

  const dokumenRows = await sequelize.query(
    `SELECT
      d.id,
      d.nama,
      d.keterangan,
      d.file_path,
      jd.nama AS jenis_nama
    FROM dokumen_evaluasi AS d
    LEFT JOIN jenis_dokumen_evaluasi AS jd ON jd.id = d.jenis_dokumen_evaluasi_id AND jd.deletedAt IS NULL
    WHERE d.matakuliah_id = ${mkId}
      ${semester_id ? `AND d.semester_id = ${sequelize.escape(semester_id)}` : ''}
    ORDER BY d.createdAt DESC`,
    { type: sequelize.QueryTypes.SELECT }
  );

  const kelas = kelasRows.map((row) => ({
    id: row.id,
    nama: row.nama,
    jumlah_peserta: Number(row.jumlah_peserta) || 0,
    dosen: row.dosen_names ? row.dosen_names.split('||').filter(Boolean) : [],
  }));
  const cpmk = buildCpmkRows(cpmkRows);
  const evaluasi = buildEvaluasi(nilaiRows, cpmk);
  const nilai = buildNilaiPeserta(nilaiRows, cpmkRows);

  return {
    matakuliah: {
      id: mk.id,
      kode_matakuliah: mk.kode_matakuliah,
      nama_resmi: mk.nama_resmi,
      jumlah_sks_kurikulum: mk.jumlah_sks_kurikulum,
    },
    semester: semesterInfo ? { id: semesterInfo.id, label: semesterLabel } : null,
    kurikulum: mk.kurikulum_nama
      ? { id: mk.kurikulum_id, nama: kurikulumLabel(mk) }
      : null,
    program_studi: mk.prodi_nama || null,
    jumlah_peserta: kelas.reduce((total, item) => total + item.jumlah_peserta, 0),
    kelas,
    cpmk,
    evaluasi,
    nilai,
    dokumen: dokumenRows.map((row) => ({
      id: row.id,
      nama: row.nama,
      keterangan: row.keterangan,
      file_path: row.file_path,
      jenis_nama: row.jenis_nama,
    })),
  };
};

module.exports = { getMatakuliahDetail };