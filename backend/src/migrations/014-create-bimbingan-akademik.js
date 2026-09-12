"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("bimbingan_akademik", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      dosen_id: { type: DataTypes.UUID, allowNull: false },
      mahasiswa_id: { type: DataTypes.UUID, allowNull: false },
      tahun_akademik: { type: DataTypes.STRING(10), allowNull: true },
      status: {
        type: DataTypes.ENUM("aktif", "selesai"),
        defaultValue: "aktif",
        allowNull: true,
      },
      catatan: { type: DataTypes.TEXT, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addIndex("bimbingan_akademik", ["mahasiswa_id"], {
      name: "mahasiswa_id",
    });
    await queryInterface.addIndex(
      "bimbingan_akademik",
      ["dosen_id", "mahasiswa_id"],
      {
        unique: true,
        name: "uk_bimbingan",
      },
    );
    await queryInterface.addConstraint("bimbingan_akademik", {
      fields: ["dosen_id"],
      type: "foreign key",
      name: "bimbingan_akademik_dosen_id_fk",
      references: { table: "dosen", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    await queryInterface.addConstraint("bimbingan_akademik", {
      fields: ["mahasiswa_id"],
      type: "foreign key",
      name: "bimbingan_akademik_mahasiswa_id_fk",
      references: { table: "mahasiswa", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("bimbingan_akademik");
  },
};
