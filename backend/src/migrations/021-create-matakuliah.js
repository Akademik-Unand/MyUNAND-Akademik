"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("matakuliah", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      jenis_semester_id: { type: DataTypes.UUID, allowNull: false },
      tipe_matakuliah_id: { type: DataTypes.UUID, allowNull: true },
      sifat_matakuliah_id: { type: DataTypes.UUID, allowNull: true },
      kode_matakuliah: { type: DataTypes.STRING(255), allowNull: false },
      nama_resmi: { type: DataTypes.STRING(255), allowNull: true },
      semester_kurikulum: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
        allowNull: true,
      },
      jumlah_sks_kurikulum: { type: DataTypes.TINYINT, allowNull: true },
      jumlah_sks_teori: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
        allowNull: true,
      },
      jumlah_sks_praktikum: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
        allowNull: true,
      },
      jumlah_sks_praktikum_lapangan: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
        allowNull: true,
      },
      bobot_nilai_minimal_lulus: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        allowNull: true,
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
      program_studi_id: { type: DataTypes.UUID, allowNull: true },
      has_prasyarat: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    });
    await queryInterface.addIndex("matakuliah", ["program_studi_id"], {
      name: "idx_matakuliah_program_studi",
    });
    await queryInterface.addIndex("matakuliah", ["jenis_semester_id"], {
      name: "jenis_semester_id",
    });
    await queryInterface.addIndex("matakuliah", ["kode_matakuliah"], {
      unique: true,
      name: "kode_matakuliah",
    });
    await queryInterface.addIndex("matakuliah", ["sifat_matakuliah_id"], {
      name: "sifat_matakuliah_id",
    });
    await queryInterface.addIndex("matakuliah", ["tipe_matakuliah_id"], {
      name: "tipe_matakuliah_id",
    });
    await queryInterface.addConstraint("matakuliah", {
      fields: ["jenis_semester_id"],
      type: "foreign key",
      name: "matakuliah_jenis_semester_id_fk",
      references: { table: "jenis_semester", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
    await queryInterface.addConstraint("matakuliah", {
      fields: ["tipe_matakuliah_id"],
      type: "foreign key",
      name: "matakuliah_tipe_matakuliah_id_fk",
      references: { table: "tipe_matakuliah", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
    await queryInterface.addConstraint("matakuliah", {
      fields: ["sifat_matakuliah_id"],
      type: "foreign key",
      name: "matakuliah_sifat_matakuliah_id_fk",
      references: { table: "sifat_matakuliah", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
    await queryInterface.addConstraint("matakuliah", {
      fields: ["program_studi_id"],
      type: "foreign key",
      name: "matakuliah_program_studi_id_fk",
      references: { table: "program_studi", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("matakuliah");
  },
};
