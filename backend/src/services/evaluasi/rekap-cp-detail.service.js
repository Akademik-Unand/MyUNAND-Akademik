'use strict';

const { sequelize } = require('../../models');
const { FROM_SQL, SELECT_SQL, buildWhere } = require('../../helpers/rekapCpDetail');

const listDetail = async (query) => {
  const { whereSql, page, limit } = buildWhere(query);
  const offset = (page - 1) * limit;
  const fromWhere = `${FROM_SQL} WHERE ${whereSql}`;

  const [countRow] = await sequelize.query(
    `SELECT COUNT(*) AS total ${fromWhere}`,
    { type: sequelize.QueryTypes.SELECT }
  );
  const total = Number(countRow?.total || 0);

  const rows = await sequelize.query(
    `${SELECT_SQL} ${fromWhere}
     ORDER BY m.niu ASC, mk.nama_resmi ASC, k.nama ASC, cpmk.nama_cpmk ASC, sp.nama_sumber_penilaian ASC
     LIMIT ${limit} OFFSET ${offset}`,
    { type: sequelize.QueryTypes.SELECT }
  );

  return {
    rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
};

const listGrafik = async (query) => {
  const { whereSql, pilihan } = buildWhere({ ...query, page: 1, limit: 200 });
  const capaianExpr = pilihan === 'nilai_rata'
    ? 'AVG(nm.nilai)'
    : `AVG(CASE
        WHEN nm.nilai IS NULL OR scp.nilai_min IS NULL THEN NULL
        WHEN nm.nilai >= scp.nilai_min THEN 100
        ELSE 0
      END)`;

  const rows = await sequelize.query(
    `SELECT
      CONCAT(COALESCE(cp.nama_cp, '—'), ' - ', COALESCE(scp.nama_scp, '—')) AS label,
      ROUND(AVG(scp.persen_capai_nilai_min), 2) AS target,
      ROUND(${capaianExpr}, 2) AS capaian
     ${FROM_SQL}
     WHERE ${whereSql}
     GROUP BY cp.id, scp.id, cp.nama_cp, scp.nama_scp
     ORDER BY cp.nama_cp ASC, scp.nama_scp ASC
     LIMIT 80`,
    { type: sequelize.QueryTypes.SELECT }
  );

  return rows.map((row) => ({
    label: row.label,
    target: Number(row.target) || 0,
    capaian: Number(row.capaian) || 0,
  }));
};

module.exports = { listDetail, listGrafik };
