"use strict";
const { DataTypes } = require("sequelize");
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("gedung", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      kode: { type: DataTypes.STRING(50), allowNull: false, unique: true },
      nama: { type: DataTypes.STRING(255), allowNull: false },
      alamat: { type: DataTypes.TEXT },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE },
    });
    await queryInterface.createTable("penawaran_matakuliah", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      semester_prodi_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "semester_prodi", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      status: {
        type: DataTypes.ENUM("draft", "published", "closed"),
        allowNull: false,
        defaultValue: "draft",
      },
      akses: {
        type: DataTypes.ENUM("semua", "terpilih"),
        allowNull: false,
        defaultValue: "semua",
      },
      tanggal_mulai: { type: DataTypes.DATE },
      tanggal_selesai: { type: DataTypes.DATE },
      kuota_lintas_prodi_default: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      minimal_semester_default: { type: DataTypes.TINYINT },
      maksimal_semester_default: { type: DataTypes.TINYINT },
      published_at: { type: DataTypes.DATE },
      closed_at: { type: DataTypes.DATE },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE },
    });
    await queryInterface.addIndex(
      "penawaran_matakuliah",
      ["semester_prodi_id"],
      { unique: true, name: "uq_penawaran_per_semester_prodi" },
    );
    await queryInterface.createTable("penawaran_matakuliah_detil", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      penawaran_matakuliah_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "penawaran_matakuliah", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      matakuliah_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "matakuliah", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      kuota_lintas_prodi: { type: DataTypes.INTEGER },
      minimal_semester: { type: DataTypes.TINYINT },
      maksimal_semester: { type: DataTypes.TINYINT },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addIndex(
      "penawaran_matakuliah_detil",
      ["penawaran_matakuliah_id", "matakuliah_id"],
      { unique: true, name: "uq_penawaran_detil_matakuliah" },
    );
    await queryInterface.createTable("penawaran_matakuliah_prodi", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      penawaran_matakuliah_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "penawaran_matakuliah", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      program_studi_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "program_studi", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      kuota: { type: DataTypes.INTEGER },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addIndex(
      "penawaran_matakuliah_prodi",
      ["penawaran_matakuliah_id", "program_studi_id"],
      { unique: true, name: "uq_penawaran_prodi" },
    );
  },
  async down(queryInterface) {
    await queryInterface.dropTable("penawaran_matakuliah_prodi");
    await queryInterface.dropTable("penawaran_matakuliah_detil");
    await queryInterface.dropTable("penawaran_matakuliah");
    await queryInterface.dropTable("gedung");
  },
};
