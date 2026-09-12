"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("kelas", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      matakuliah_id: { type: DataTypes.UUID, allowNull: false },
      nama: { type: DataTypes.STRING(10), allowNull: false },
      jumlah_peserta_min: {
        type: DataTypes.SMALLINT,
        defaultValue: 0,
        allowNull: true,
      },
      jumlah_peserta_max: {
        type: DataTypes.SMALLINT,
        defaultValue: 0,
        allowNull: true,
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
      penawaran_matakuliah_id: { type: DataTypes.UUID, allowNull: true },
      semester_id: { type: DataTypes.UUID, allowNull: false },
      program_studi_id: { type: DataTypes.UUID, allowNull: false },
    });
    await queryInterface.addIndex("kelas", ["program_studi_id"], {
      name: "idx_kelas_program_studi",
    });
    await queryInterface.addIndex("kelas", ["semester_id"], {
      name: "idx_kelas_semester",
    });
    await queryInterface.addIndex("kelas", ["penawaran_matakuliah_id"], {
      name: "kelas_penawaran_matakuliah_id_foreign_idx",
    });
    await queryInterface.addIndex("kelas", ["matakuliah_id"], {
      name: "matakuliah_id",
    });
    await queryInterface.addIndex(
      "kelas",
      ["semester_id", "program_studi_id", "matakuliah_id", "nama"],
      {
        unique: true,
        name: "uq_kelas_semester_prodi_mk_nama",
      },
    );
    await queryInterface.addConstraint("kelas", {
      fields: ["matakuliah_id"],
      type: "foreign key",
      name: "kelas_matakuliah_id_fk",
      references: { table: "matakuliah", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
    await queryInterface.addConstraint("kelas", {
      fields: ["penawaran_matakuliah_id"],
      type: "foreign key",
      name: "kelas_penawaran_matakuliah_id_fk",
      references: { table: "penawaran_matakuliah_detil", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
    await queryInterface.addConstraint("kelas", {
      fields: ["semester_id"],
      type: "foreign key",
      name: "kelas_semester_id_fk",
      references: { table: "semester", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
    await queryInterface.addConstraint("kelas", {
      fields: ["program_studi_id"],
      type: "foreign key",
      name: "kelas_program_studi_id_fk",
      references: { table: "program_studi", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("kelas");
  },
};
