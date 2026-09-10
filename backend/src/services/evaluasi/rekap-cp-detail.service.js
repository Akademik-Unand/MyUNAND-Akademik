'use strict';

const { sequelize } = require('../../models');
const { FROM_SQL, SELECT_SQL, buildWhere } = require('../../helpers/rekapCpDetail');
const cache = require('../../helpers/cache');

const CACHE_TTL_SECONDS = 300;
const cacheKey = (kind, query) => `rekap-cp:${kind}:${JSON.stringify(query || {})}`;

const listDetail = async (query) => {
  const key = cacheKey('detail', query);
  const cached = await cache.get(key);
  if (cached) return cached;
  const { whereSql, page, limit } = buildWhere(query);
  const offset = (page - 1) * limit;
  const fromWhere = `${FROM_SQL} WHERE ${whereSql}`;

  const [countRow] = await sequelize.query(
    `SELECT COUNT(*) AS total
     FROM (
       SELECT 1 ${fromWhere}
       LIMIT ${offset + limit + 1}
     ) AS matched`,
    { type: sequelize.QueryTypes.SELECT }
  );
  const total = Number(countRow?.total || 0);

  const rows = await sequelize.query(
    `${SELECT_SQL} ${fromWhere}
     ORDER BY nm.id ASC
     LIMIT ${limit} OFFSET ${offset}`,
    { type: sequelize.QueryTypes.SELECT }
  );

  const result = {
    rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
  await cache.set(key, result, CACHE_TTL_SECONDS);
  return result;
};

const listGrafik = async (query) => {
  const key = cacheKey('grafik', query);
  const cached = await cache.get(key);
  if (cached) return cached;
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

  const result = rows.map((row) => ({
    label: row.label,
    target: Number(row.target) || 0,
    capaian: Number(row.capaian) || 0,
  }));
  await cache.set(key, result, CACHE_TTL_SECONDS);
  return result;
};

module.exports = { listDetail, listGrafik };
