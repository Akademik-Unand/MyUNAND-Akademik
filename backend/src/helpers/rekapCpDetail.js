'use strict';

const { sequelize } = require('../models');
const { normalizeListQuery } = require('./listQuery');
const { idList, prodiIdsSql, semesterProdiIdsSql } = require('./academicFilters');

const FROM_SQL = `
FROM krs_detil AS kd
INNER JOIN krs AS kr ON kr.id = kd.krs_id
INNER JOIN mahasiswa AS m ON m.id = kr.mahasiswa_id AND m.deletedAt IS NULL
INNER JOIN kelas AS k ON k.id = kd.kelas_id AND k.deletedAt IS NULL
INNER JOIN matakuliah AS mk ON mk.id = k.matakuliah_id AND mk.deletedAt IS NULL
INNER JOIN cpmk ON cpmk.matakuliah_id = mk.id AND cpmk.deletedAt IS NULL
INNER JOIN sumber_penilaian AS sp ON sp.cpmk_id = cpmk.id
LEFT JOIN cpmk_scp AS cs ON cs.cpmk_id = cpmk.id
  OR (
    NOT EXISTS (SELECT 1 FROM cpmk_scp AS z WHERE z.cpmk_id = cpmk.id)
    AND cs.cpmk_id = cpmk.parent_cpmk_id
  )
LEFT JOIN scp ON scp.id = cs.scp_id AND scp.deletedAt IS NULL
LEFT JOIN cp ON cp.id = scp.cp_id AND cp.deletedAt IS NULL
LEFT JOIN nilai_mahasiswa AS nm ON nm.krs_detil_id = kd.id AND nm.sumber_penilaian_id = sp.id
LEFT JOIN semester_prodi AS smp ON smp.id = COALESCE(k.semester_prodi_id, kr.semester_prodi_id)
LEFT JOIN semester AS sm ON sm.id = smp.semester_id AND sm.deletedAt IS NULL
LEFT JOIN jenis_semester AS js ON js.id = sm.jenis_semester_id AND js.deletedAt IS NULL
`;

const SELECT_SQL = `
SELECT
  CONCAT(kd.id, ':', sp.id, ':', COALESCE(scp.id, 'none')) AS id,
  m.niu AS niu,
  m.nama AS mahasiswa_nama,
  m.angkatan AS angkatan,
  CONCAT(COALESCE(js.nama, js.alias, ''), ' ', COALESCE(sm.tahun, '')) AS semester_label,
  mk.nama_resmi AS matakuliah_nama,
  mk.kode_matakuliah AS matakuliah_kode,
  CONCAT(COALESCE(mk.kode_matakuliah, ''), ' ', k.nama) AS kelas_nama,
  cpmk.nama_cpmk AS cpmk_nama,
  cp.nama_cp AS cp_nama,
  scp.nama_scp AS scp_nama,
  scp.nilai_min AS target_nilai_min,
  scp.persen_capai_nilai_min AS target_persen,
  CASE
    WHEN nm.nilai IS NULL OR scp.nilai_min IS NULL THEN NULL
    WHEN nm.nilai >= scp.nilai_min THEN 100
    ELSE 0
  END AS capaian_target,
  CASE
    WHEN nm.nilai IS NULL OR scp.nilai_min IS NULL THEN 0
    WHEN nm.nilai >= scp.nilai_min THEN 1
    ELSE 0
  END AS status_tercapai,
  sp.nama_sumber_penilaian AS sumber_nama,
  sp.bobot AS bobot,
  nm.nilai AS nilai,
  CASE
    WHEN nm.nilai IS NULL OR scp.nilai_min IS NULL THEN 0
    WHEN nm.nilai >= scp.nilai_min THEN 1
    ELSE 0
  END AS lulus
`;

const buildWhere = (query = {}) => {
  const parsed = normalizeListQuery(query);
  const filter = parsed.filter && typeof parsed.filter === 'object' ? parsed.filter : {};
  const clauses = ['1=1'];

  const andIn = (column, val) => {
    if (val === undefined || val === '' || val === null) return;
    clauses.push(`${column} IN (${idList(sequelize, val)})`);
  };

  if (filter.fakultas_id) {
    clauses.push(`m.program_studi_id IN (${prodiIdsSql(sequelize, { fakultas_id: filter.fakultas_id })})`);
  }
  if (filter.departemen_id) {
    clauses.push(`m.program_studi_id IN (${prodiIdsSql(sequelize, { departemen_id: filter.departemen_id })})`);
  }
  andIn('m.program_studi_id', filter.program_studi_id);
  if (filter.semester_id) {
    clauses.push(`smp.id IN (${semesterProdiIdsSql(sequelize, { semester_id: filter.semester_id })})`);
  }
  if (filter.kurikulum_id) {
    const ids = idList(sequelize, filter.kurikulum_id);
    clauses.push(`(
      cp.kurikulum_id IN (${ids})
      OR mk.id IN (SELECT mkk.matakuliah_id FROM matakuliah_kurikulum AS mkk WHERE mkk.kurikulum_id IN (${ids}))
    )`);
  }
  andIn('cp.id', filter.cp_id);
  andIn('scp.id', filter.scp_id);
  andIn('mk.id', filter.matakuliah_id);
  andIn('k.id', filter.kelas_id);
  if (filter.angkatan !== undefined && filter.angkatan !== '') {
    clauses.push(`m.angkatan = ${sequelize.escape(Number(filter.angkatan))}`);
  }
  if (filter.transkrip_saja === '1' || filter.transkrip_saja === 1 || filter.transkrip_saja === true) {
    const kur = filter.kurikulum_id
      ? `AND mkk.kurikulum_id IN (${idList(sequelize, filter.kurikulum_id)})`
      : '';
    clauses.push(`mk.id IN (
      SELECT mkk.matakuliah_id FROM matakuliah_kurikulum AS mkk
      WHERE mkk.status = 'transkrip' ${kur}
    )`);
  }

  const search = parsed.search;
  if (search) {
    const like = sequelize.escape(`%${search}%`);
    clauses.push(`(m.nama LIKE ${like} OR m.niu LIKE ${like} OR mk.nama_resmi LIKE ${like} OR mk.kode_matakuliah LIKE ${like})`);
  }

  return { whereSql: clauses.join(' AND '), page: parseInt(parsed.page, 10) || 1, limit: parseInt(parsed.limit, 10) || 20, pilihan: filter.pilihan_data };
};

module.exports = { FROM_SQL, SELECT_SQL, buildWhere };
