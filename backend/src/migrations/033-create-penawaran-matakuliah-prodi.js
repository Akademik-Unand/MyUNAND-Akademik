"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("penawaran_matakuliah_prodi", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      penawaran_matakuliah_id: { type: DataTypes.UUID, allowNull: false },
      program_studi_id: { type: DataTypes.UUID, allowNull: false },
      kuota: { type: DataTypes.INTEGER, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addIndex(
      "penawaran_matakuliah_prodi",
      ["program_studi_id"],
      {
        name: "program_studi_id",
      },
    );
    await queryInterface.addIndex(
      "penawaran_matakuliah_prodi",
      ["penawaran_matakuliah_id", "program_studi_id"],
      {
        unique: true,
        name: "uq_penawaran_prodi",
      },
    );
    await queryInterface.addConstraint("penawaran_matakuliah_prodi", {
      fields: ["penawaran_matakuliah_id"],
      type: "foreign key",
      name: "penawaran_matakuliah_prodi_penawaran_matakuliah_id_fk",
      references: { table: "penawaran_matakuliah", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    await queryInterface.addConstraint("penawaran_matakuliah_prodi", {
      fields: ["program_studi_id"],
      type: "foreign key",
      name: "penawaran_matakuliah_prodi_program_studi_id_fk",
      references: { table: "program_studi", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("penawaran_matakuliah_prodi");
  },
};
