"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("jadwal_kelas", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      kelas_id: { type: DataTypes.UUID, allowNull: false },
      ruang_id: { type: DataTypes.UUID, allowNull: true },
      hari: {
        type: DataTypes.ENUM(
          "Senin",
          "Selasa",
          "Rabu",
          "Kamis",
          "Jumat",
          "Sabtu",
          "Minggu",
        ),
        allowNull: false,
      },
      jam_mulai: { type: DataTypes.TIME, allowNull: true },
      jam_selesai: { type: DataTypes.TIME, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      shift_id: { type: DataTypes.UUID, allowNull: true },
    });
    await queryInterface.addIndex("jadwal_kelas", ["shift_id"], {
      name: "jadwal_kelas_shift_id_foreign_idx",
    });
    await queryInterface.addIndex("jadwal_kelas", ["kelas_id"], {
      name: "kelas_id",
    });
    await queryInterface.addIndex("jadwal_kelas", ["ruang_id"], {
      name: "ruang_id",
    });
    await queryInterface.addConstraint("jadwal_kelas", {
      fields: ["kelas_id"],
      type: "foreign key",
      name: "jadwal_kelas_kelas_id_fk",
      references: { table: "kelas", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    await queryInterface.addConstraint("jadwal_kelas", {
      fields: ["ruang_id"],
      type: "foreign key",
      name: "jadwal_kelas_ruang_id_fk",
      references: { table: "ruang", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
    await queryInterface.addConstraint("jadwal_kelas", {
      fields: ["shift_id"],
      type: "foreign key",
      name: "jadwal_kelas_shift_id_fk",
      references: { table: "shift", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("jadwal_kelas");
  },
};
