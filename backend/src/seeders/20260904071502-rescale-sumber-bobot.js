'use strict';

/** Menyesuaikan bobot sumber penilaian per mata kuliah agar total daun tidak > 100%. */
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [cpmks] = await queryInterface.sequelize.query(
      'SELECT id, matakuliah_id, parent_cpmk_id FROM cpmk WHERE deletedAt IS NULL'
    );
    const [sumbers] = await queryInterface.sequelize.query(
      'SELECT id, cpmk_id, bobot FROM sumber_penilaian'
    );

    const byMk = new Map();
    for (const row of cpmks) {
      if (!byMk.has(row.matakuliah_id)) byMk.set(row.matakuliah_id, []);
      byMk.get(row.matakuliah_id).push(row);
    }

    const sumberByCpmk = new Map();
    for (const row of sumbers) {
      if (!sumberByCpmk.has(row.cpmk_id)) sumberByCpmk.set(row.cpmk_id, []);
      sumberByCpmk.get(row.cpmk_id).push(row);
    }

    for (const rows of byMk.values()) {
      const parentIds = new Set(rows.map((row) => row.parent_cpmk_id).filter(Boolean));
      const leafIds = rows.filter((row) => !parentIds.has(row.id)).map((row) => row.id);
      const leafSumber = leafIds.flatMap((id) => sumberByCpmk.get(id) || []);
      const total = leafSumber.reduce((sum, row) => sum + Number(row.bobot || 0), 0);
      if (total <= 100 || total === 0) continue;
      const factor = 100 / total;
      for (let i = 0; i < leafSumber.length; i += 1) {
        const row = leafSumber[i];
        const next =
          i === leafSumber.length - 1
            ? Math.round(
                (100 -
                  leafSumber
                    .slice(0, -1)
                    .reduce((sum, item) => sum + Math.round(Number(item.bobot) * factor * 10) / 10, 0)) *
                  10
              ) / 10
            : Math.round(Number(row.bobot) * factor * 10) / 10;
        await queryInterface.sequelize.query('UPDATE sumber_penilaian SET bobot = ? WHERE id = ?', {
          replacements: [next, row.id],
        });
      }
    }
  },

  async down() {
    // Skala ulang tidak bisa dikembalikan ke nilai semula.
  },
};
