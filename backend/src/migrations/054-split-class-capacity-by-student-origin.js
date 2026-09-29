"use strict";

const { DataTypes } = require("sequelize");

module.exports = {
  async up(queryInterface) {
    await queryInterface.addColumn("penawaran_matakuliah_detil", "jumlah_peserta_max_default", {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 40,
    });
    await queryInterface.addColumn("penawaran_matakuliah_detil", "jumlah_peserta_internal_max_default", {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 40,
    });
    await queryInterface.addColumn("kelas", "jumlah_peserta_internal_max", {
      type: DataTypes.SMALLINT,
      allowNull: true,
    });
    await queryInterface.addColumn("kelas", "jumlah_peserta_lintas_prodi_max", {
      type: DataTypes.SMALLINT,
      allowNull: true,
    });

    // Previously the class maximum applied only to local students and the
    // offering quota applied globally to all cross-program students. Move
    // those limits to each class. Any indivisible remainder is left unused,
    // so migration never increases the old aggregate quota.
    await queryInterface.sequelize.query(`
      UPDATE kelas AS kelas_row
      LEFT JOIN penawaran_matakuliah_detil AS detail
        ON detail.id = kelas_row.penawaran_matakuliah_id
      LEFT JOIN (
        SELECT offering_classes.penawaran_matakuliah_id, COUNT(*) AS class_count
        FROM (
          SELECT id, penawaran_matakuliah_id
          FROM kelas
          WHERE penawaran_matakuliah_id IS NOT NULL
        ) AS offering_classes
        GROUP BY offering_classes.penawaran_matakuliah_id
      ) AS counts
        ON counts.penawaran_matakuliah_id = detail.id
      SET
        kelas_row.jumlah_peserta_internal_max = NULLIF(kelas_row.jumlah_peserta_max, 0),
        kelas_row.jumlah_peserta_lintas_prodi_max = CASE
          WHEN detail.id IS NULL THEN 0
          WHEN detail.kuota_lintas_prodi IS NULL OR detail.kuota_lintas_prodi <= 0 THEN NULL
          ELSE FLOOR(detail.kuota_lintas_prodi / counts.class_count)
        END,
        kelas_row.jumlah_peserta_max = CASE
          WHEN kelas_row.jumlah_peserta_max = 0
            OR detail.kuota_lintas_prodi IS NULL
            OR detail.kuota_lintas_prodi <= 0 THEN 0
          ELSE kelas_row.jumlah_peserta_max + FLOOR(detail.kuota_lintas_prodi / counts.class_count)
        END
    `);

    // The old course-wide quota becomes a safe per-class default. Existing
    // classes keep their allocated limits; future classes start with cross
    // seats closed until the owner explicitly configures them.
    await queryInterface.sequelize.query(`
      UPDATE penawaran_matakuliah_detil AS detail
      SET detail.kuota_lintas_prodi = 0
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      UPDATE penawaran_matakuliah_detil AS detail
      LEFT JOIN (
        SELECT
          penawaran_matakuliah_id,
          SUM(COALESCE(jumlah_peserta_lintas_prodi_max, 0)) AS finite_quota,
          MAX(jumlah_peserta_lintas_prodi_max IS NULL) AS has_unlimited
        FROM kelas
        WHERE penawaran_matakuliah_id IS NOT NULL
        GROUP BY penawaran_matakuliah_id
      ) AS quotas ON quotas.penawaran_matakuliah_id = detail.id
      SET detail.kuota_lintas_prodi = CASE
        WHEN quotas.has_unlimited = 1 THEN 0
        ELSE COALESCE(quotas.finite_quota, 0)
      END
    `);
    await queryInterface.sequelize.query(`
      UPDATE kelas
      SET jumlah_peserta_max = COALESCE(jumlah_peserta_internal_max, 0)
    `);
    await queryInterface.removeColumn("kelas", "jumlah_peserta_lintas_prodi_max");
    await queryInterface.removeColumn("kelas", "jumlah_peserta_internal_max");
    await queryInterface.removeColumn("penawaran_matakuliah_detil", "jumlah_peserta_internal_max_default");
    await queryInterface.removeColumn("penawaran_matakuliah_detil", "jumlah_peserta_max_default");
  },
};
