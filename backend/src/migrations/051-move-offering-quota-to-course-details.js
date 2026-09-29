"use strict";

/**
 * Kuota lintas prodi kini disimpan pada baris mata kuliah. Salin nilai default
 * lama ke detail yang masih null sebelum menghapus kolom header.
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      "UPDATE penawaran_matakuliah_detil AS detail " +
        "INNER JOIN penawaran_matakuliah AS offering " +
        "ON offering.id = detail.penawaran_matakuliah_id " +
        "SET detail.kuota_lintas_prodi = offering.kuota_lintas_prodi_default " +
        "WHERE detail.kuota_lintas_prodi IS NULL",
    );
    await queryInterface.removeColumn(
      "penawaran_matakuliah",
      "kuota_lintas_prodi_default",
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("penawaran_matakuliah", "kuota_lintas_prodi_default", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  },
};
