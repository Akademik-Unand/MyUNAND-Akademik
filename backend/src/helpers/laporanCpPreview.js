'use strict';

const { sequelize, Semester, JenisSemester } = require('../models');

const semesterOnOrBeforeSql = (tahun, urut) => {
  const year = Number(tahun);
  const order = Number(urut);
  if (!Number.isFinite(year)) return '';
  const orderValue = Number.isFinite(order) ? order : 0;
  return `AND (
      sm.id IS NULL
      OR sm.tahun < ${year}
      OR (sm.tahun = ${year} AND COALESCE(js.urut, 0) <= ${orderValue})
    )`;
};

const listPreview = async ({ kurikulum_id, semester_id } = {}) => {
  if (!kurikulum_id) return [];

  let semesterFilter = '';
  if (semester_id) {
    const semester = await Semester.findByPk(semester_id, {
      include: [{ model: JenisSemester, as: 'jenisSemester' }],
    });
    if (semester) {
      semesterFilter = semesterOnOrBeforeSql(semester.tahun, semester.jenisSemester?.urut);
    } else {
      semesterFilter = `AND (sm.id = ${sequelize.escape(semester_id)} OR sm.id IS NULL)`;
    }
  }

  const rows = await sequelize.query(
    `SELECT
      CONCAT(cpmk.id, ':', mk.id, ':', COALESCE(sm.id, 'none')) AS id,
      cp.id AS cp_id,
      cp.nama_cp AS cp_nama,
      cp.deskripsi AS cp_deskripsi,
      scp.id AS scp_id,
      scp.nama_scp AS scp_nama,
      scp.deskripsi AS scp_deskripsi,
      cpmk.id AS cpmk_id,
      cpmk.nama_cpmk AS cpmk_nama,
      cpmk.deskripsi AS cpmk_deskripsi,
      mk.id AS matakuliah_id,
      mk.nama_resmi AS matakuliah_nama,
      sm.id AS semester_id,
      TRIM(CONCAT(COALESCE(js.nama, js.alias, ''), ' ', COALESCE(sm.tahun, ''))) AS semester_label,
      MAX(CASE WHEN mkk.status = 'transkrip' THEN 1 ELSE 0 END) AS is_transkrip,
      GROUP_CONCAT(DISTINCT CONCAT(sp.nama_sumber_penilaian, ' ', sp.bobot, '%') SEPARATOR ', ') AS sumber_label,
      GROUP_CONCAT(DISTINCT d.nama ORDER BY d.nama SEPARATOR ', ') AS dosen_label,
      scp.nilai_min AS nilai_min,
      scp.persen_capai_nilai_min AS target_persen,
      ROUND(AVG(CASE
        WHEN nm.nilai IS NULL OR scp.nilai_min IS NULL THEN NULL
        WHEN nm.nilai >= scp.nilai_min THEN 100
        ELSE 0
      END), 2) AS capaian
    FROM cpmk
    INNER JOIN matakuliah AS mk ON mk.id = cpmk.matakuliah_id AND mk.deletedAt IS NULL
    INNER JOIN matakuliah_kurikulum AS mkk
      ON mkk.matakuliah_id = mk.id AND mkk.kurikulum_id = ${sequelize.escape(kurikulum_id)}
    INNER JOIN cpmk_scp AS cs ON cs.cpmk_id = cpmk.id
      OR (
        NOT EXISTS (SELECT 1 FROM cpmk_scp AS z WHERE z.cpmk_id = cpmk.id)
        AND cs.cpmk_id = cpmk.parent_cpmk_id
      )
    INNER JOIN scp ON scp.id = cs.scp_id AND scp.deletedAt IS NULL
    INNER JOIN cp ON cp.id = scp.cp_id AND cp.deletedAt IS NULL
      AND cp.kurikulum_id = ${sequelize.escape(kurikulum_id)}
    LEFT JOIN sumber_penilaian AS sp ON sp.cpmk_id = cpmk.id
    LEFT JOIN kelas AS k ON k.matakuliah_id = mk.id AND k.deletedAt IS NULL
    LEFT JOIN semester_prodi AS smp ON smp.id = k.semester_prodi_id
    LEFT JOIN semester AS sm ON sm.id = smp.semester_id AND sm.deletedAt IS NULL
    LEFT JOIN jenis_semester AS js ON js.id = sm.jenis_semester_id AND js.deletedAt IS NULL
    LEFT JOIN krs_detil AS kd ON kd.kelas_id = k.id
    LEFT JOIN nilai_mahasiswa AS nm ON nm.krs_detil_id = kd.id AND nm.sumber_penilaian_id = sp.id
    LEFT JOIN dosen_kelas AS dk ON dk.kelas_id = k.id
    LEFT JOIN dosen AS d ON d.id = dk.dosen_id AND d.deletedAt IS NULL
    WHERE cpmk.deletedAt IS NULL
      ${semesterFilter}
    GROUP BY
      cp.id, cp.nama_cp, cp.deskripsi,
      scp.id, scp.nama_scp, scp.deskripsi, scp.nilai_min, scp.persen_capai_nilai_min,
      cpmk.id, cpmk.nama_cpmk, cpmk.deskripsi,
      mk.id, mk.nama_resmi,
      sm.id, js.nama, js.alias, sm.tahun
    ORDER BY cp.nama_cp ASC, scp.nama_scp ASC, mk.nama_resmi ASC, cpmk.nama_cpmk ASC
    LIMIT 2000`,
    { type: sequelize.QueryTypes.SELECT }
  );

  return rows.map((row) => ({
    ...row,
    dosen_label: row.dosen_label || '',
    is_transkrip: Boolean(Number(row.is_transkrip)),
    nilai_min: row.nilai_min == null ? null : Number(row.nilai_min),
    target_persen: row.target_persen == null ? null : Number(row.target_persen),
    capaian: row.capaian == null ? null : Number(row.capaian),
  }));
};

module.exports = { listPreview, semesterOnOrBeforeSql };
