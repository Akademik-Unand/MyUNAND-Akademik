"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("rekap_cp", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      mahasiswa_id: { type: DataTypes.UUID, allowNull: false },
      cp_id: { type: DataTypes.UUID, allowNull: false },
      nilai_capaian: { type: DataTypes.FLOAT, defaultValue: 0, allowNull: true },
      status_lulus: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      semester_id: { type: DataTypes.UUID, allowNull: true },
    });
    await queryInterface.addIndex("rekap_cp", ["cp_id"], { name: "cp_id" });
    await queryInterface.addIndex("rekap_cp", ["mahasiswa_id", "cp_id", "semester_id"], {
      unique: true,
      name: "uq_rekap_cp_semester",
    });
    await queryInterface.addIndex("rekap_cp", ["semester_id"], {
      name: "idx_rekap_cp_semester",
    });
    await queryInterface.addConstraint("rekap_cp", {
      fields: ["mahasiswa_id"],
      type: "foreign key",
      name: "rekap_cp_mahasiswa_id_fk",
      references: { table: "mahasiswa", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    await queryInterface.addConstraint("rekap_cp", {
      fields: ["cp_id"],
      type: "foreign key",
      name: "rekap_cp_cp_id_fk",
      references: { table: "cp", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    await queryInterface.addConstraint("rekap_cp", {
      fields: ["semester_id"],
      type: "foreign key",
      name: "rekap_cp_semester_id_fk",
      references: { table: "semester", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("rekap_cp");
  },
};
