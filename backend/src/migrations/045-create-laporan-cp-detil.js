"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("laporan_cp_detil", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      laporan_cp_id: { type: DataTypes.UUID, allowNull: false },
      cpmk_id: { type: DataTypes.UUID, allowNull: false },
      matakuliah_id: { type: DataTypes.UUID, allowNull: false },
      semester_id: { type: DataTypes.UUID, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addIndex("laporan_cp_detil", ["cpmk_id"], {
      name: "cpmk_id",
    });
    await queryInterface.addIndex("laporan_cp_detil", ["laporan_cp_id"], {
      name: "idx_laporan_cp_detil_laporan",
    });
    await queryInterface.addIndex("laporan_cp_detil", ["matakuliah_id"], {
      name: "matakuliah_id",
    });
    await queryInterface.addIndex("laporan_cp_detil", ["semester_id"], {
      name: "semester_id",
    });
    await queryInterface.addConstraint("laporan_cp_detil", {
      fields: ["laporan_cp_id"],
      type: "foreign key",
      name: "laporan_cp_detil_laporan_cp_id_fk",
      references: { table: "laporan_cp", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    await queryInterface.addConstraint("laporan_cp_detil", {
      fields: ["cpmk_id"],
      type: "foreign key",
      name: "laporan_cp_detil_cpmk_id_fk",
      references: { table: "cpmk", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    await queryInterface.addConstraint("laporan_cp_detil", {
      fields: ["matakuliah_id"],
      type: "foreign key",
      name: "laporan_cp_detil_matakuliah_id_fk",
      references: { table: "matakuliah", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    await queryInterface.addConstraint("laporan_cp_detil", {
      fields: ["semester_id"],
      type: "foreign key",
      name: "laporan_cp_detil_semester_id_fk",
      references: { table: "semester", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("laporan_cp_detil");
  },
};
