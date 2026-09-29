"use strict";

/**
 * Collapse legacy per-target limits into the single cross-program quota on
 * each offered course. Any target that was unlimited keeps the shared quota
 * unlimited; otherwise the old per-target limits are summed.
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      UPDATE penawaran_matakuliah_detil AS detail
      INNER JOIN (
        SELECT
          detail_row.id AS detail_id,
          SUM(CASE WHEN COALESCE(target.kuota, detail_row.kuota_lintas_prodi) > 0
            THEN COALESCE(target.kuota, detail_row.kuota_lintas_prodi) ELSE 0 END) AS quota_total,
          MAX(CASE WHEN COALESCE(target.kuota, detail_row.kuota_lintas_prodi) IS NULL
            OR COALESCE(target.kuota, detail_row.kuota_lintas_prodi) <= 0 THEN 1 ELSE 0 END) AS has_unlimited_target
        FROM penawaran_matakuliah_detil AS detail_row
        INNER JOIN penawaran_matakuliah_prodi AS target
          ON target.penawaran_matakuliah_id = detail_row.penawaran_matakuliah_id
        GROUP BY detail_row.id
      ) AS migrated ON migrated.detail_id = detail.id
      SET detail.kuota_lintas_prodi = CASE
        WHEN migrated.has_unlimited_target = 1 THEN 0
        ELSE migrated.quota_total
      END
    `);
    await queryInterface.removeColumn("penawaran_matakuliah_prodi", "kuota");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("penawaran_matakuliah_prodi", "kuota", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    // NULL makes the restored legacy implementation fall back to each
    // course's shared quota instead of inventing target-specific values.
    await queryInterface.sequelize.query(
      "UPDATE penawaran_matakuliah_prodi SET kuota = NULL",
    );
  },
};
