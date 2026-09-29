'use strict';

const round = (value) => Math.round(value * 100) / 100;

/** Aggregate component values for one leaf CPMK/Sub-CPMK. Missing is not zero. */
const calculateOutcome = (components) => {
  const graded = components.filter((item) => item.nilai !== null && item.nilai !== undefined && item.nilai !== '');
  const weighted = graded.reduce((sum, item) => sum + Number(item.nilai) * Number(item.bobot || 0), 0);
  const totalWeight = graded.reduce((sum, item) => sum + Number(item.bobot || 0), 0);
  if (!graded.length || totalWeight <= 0) return null;
  return round(weighted / totalWeight);
};

/**
 * Build student CPL data from distinct leaf CPMK outcomes. Mapping multiple
 * Sub-CPMK records to the same CPL must not count the same outcome twice.
 */
const buildCplResults = ({ cps, outcomes }) => {
  const byCp = new Map((cps || []).map((cp) => [String(cp.id), { ...cp, contributors: [] }]));
  const seen = new Set();
  for (const outcome of outcomes || []) {
    if (outcome.nilai === null || outcome.nilai === undefined) continue;
    for (const mapping of outcome.mappings || []) {
      const cpId = String(mapping.cp_id);
      const key = `${cpId}:${outcome.cpmk_id}`;
      if (seen.has(key) || !byCp.has(cpId)) continue;
      seen.add(key);
      byCp.get(cpId).contributors.push({ ...outcome, mapping });
    }
  }
  const rows = [...byCp.values()].map((cp) => {
    const total = cp.contributors.reduce((sum, item) => sum + Number(item.nilai), 0);
    const nilai = cp.contributors.length ? round(total / cp.contributors.length) : null;
    return { ...cp, nilai, jumlah_kontributor: cp.contributors.length, status: nilai === null ? 'belum_ada_data' : 'tersedia' };
  });
  const available = rows.filter((item) => item.nilai !== null);
  return {
    cpl: rows,
    capaian_keseluruhan: available.length
      ? round(available.reduce((sum, item) => sum + item.nilai, 0) / available.length)
      : null,
  };
};

module.exports = { calculateOutcome, buildCplResults };
