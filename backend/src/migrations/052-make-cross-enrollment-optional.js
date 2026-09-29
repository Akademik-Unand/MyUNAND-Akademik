"use strict";

const { DataTypes } = require("sequelize");

module.exports = {
  async up(queryInterface) {
    // Existing `semua` and `terpilih` rows retain their current visibility.
    // Only newly created offerings default to internal access.
    await queryInterface.changeColumn("penawaran_matakuliah", "akses", {
      type: DataTypes.ENUM("internal", "semua", "terpilih"),
      allowNull: false,
      defaultValue: "internal",
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      "UPDATE penawaran_matakuliah SET akses = 'semua' WHERE akses = 'internal'",
    );
    await queryInterface.changeColumn("penawaran_matakuliah", "akses", {
      type: DataTypes.ENUM("semua", "terpilih"),
      allowNull: false,
      defaultValue: "semua",
    });
  },
};
