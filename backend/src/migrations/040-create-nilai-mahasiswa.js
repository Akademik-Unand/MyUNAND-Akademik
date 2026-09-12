"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("nilai_mahasiswa", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      krs_detil_id: { type: DataTypes.UUID, allowNull: false },
      sumber_penilaian_id: { type: DataTypes.UUID, allowNull: false },
      nilai: { type: DataTypes.FLOAT, allowNull: true },
      catatan: { type: DataTypes.TEXT, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addIndex("nilai_mahasiswa", ["sumber_penilaian_id"], {
      name: "sumber_penilaian_id",
    });
    await queryInterface.addIndex(
      "nilai_mahasiswa",
      ["krs_detil_id", "sumber_penilaian_id"],
      {
        unique: true,
        name: "uk_nilai_mahasiswa",
      },
    );
    await queryInterface.addConstraint("nilai_mahasiswa", {
      fields: ["krs_detil_id"],
      type: "foreign key",
      name: "nilai_mahasiswa_krs_detil_id_fk",
      references: { table: "krs_detil", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    await queryInterface.addConstraint("nilai_mahasiswa", {
      fields: ["sumber_penilaian_id"],
      type: "foreign key",
      name: "nilai_mahasiswa_sumber_penilaian_id_fk",
      references: { table: "sumber_penilaian", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("nilai_mahasiswa");
  },
};
