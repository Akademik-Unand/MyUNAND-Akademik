"use strict";
const { DataTypes } = require("sequelize");
module.exports = {
  async up(queryInterface) {
    await queryInterface.addColumn("kelas", "penawaran_matakuliah_id", {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "penawaran_matakuliah_detil", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn("kelas", "penawaran_matakuliah_id");
  },
};
