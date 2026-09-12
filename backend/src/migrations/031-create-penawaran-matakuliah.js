"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("penawaran_matakuliah", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      status: {
        type: DataTypes.ENUM("draft", "published", "closed"),
        defaultValue: "draft",
        allowNull: false,
      },
      akses: {
        type: DataTypes.ENUM("semua", "terpilih"),
        defaultValue: "semua",
        allowNull: false,
      },
      tanggal_mulai: { type: DataTypes.DATE, allowNull: true },
      tanggal_selesai: { type: DataTypes.DATE, allowNull: true },
      kuota_lintas_prodi_default: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      minimal_semester_default: { type: DataTypes.TINYINT, allowNull: true },
      maksimal_semester_default: { type: DataTypes.TINYINT, allowNull: true },
      published_at: { type: DataTypes.DATE, allowNull: true },
      closed_at: { type: DataTypes.DATE, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
      semester_id: { type: DataTypes.UUID, allowNull: false },
      program_studi_id: { type: DataTypes.UUID, allowNull: false },
    });
    await queryInterface.addIndex(
      "penawaran_matakuliah",
      ["program_studi_id"],
      {
        name: "idx_penawaran_program_studi",
      },
    );
    await queryInterface.addIndex(
      "penawaran_matakuliah",
      ["semester_id", "program_studi_id"],
      {
        unique: true,
        name: "uq_penawaran_semester_prodi",
      },
    );
    await queryInterface.addConstraint("penawaran_matakuliah", {
      fields: ["semester_id"],
      type: "foreign key",
      name: "penawaran_matakuliah_semester_id_fk",
      references: { table: "semester", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
    await queryInterface.addConstraint("penawaran_matakuliah", {
      fields: ["program_studi_id"],
      type: "foreign key",
      name: "penawaran_matakuliah_program_studi_id_fk",
      references: { table: "program_studi", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("penawaran_matakuliah");
  },
};
