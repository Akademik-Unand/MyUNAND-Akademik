"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("dosen_jadwal", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      dosen_kelas_id: { type: DataTypes.UUID, allowNull: false },
      jadwal_kelas_id: { type: DataTypes.UUID, allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addIndex("dosen_jadwal", ["dosen_kelas_id"], {
      name: "dosen_kelas_id",
    });
    await queryInterface.addIndex("dosen_jadwal", ["jadwal_kelas_id"], {
      name: "jadwal_kelas_id",
    });
    await queryInterface.addConstraint("dosen_jadwal", {
      fields: ["dosen_kelas_id"],
      type: "foreign key",
      name: "dosen_jadwal_dosen_kelas_id_fk",
      references: { table: "dosen_kelas", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    await queryInterface.addConstraint("dosen_jadwal", {
      fields: ["jadwal_kelas_id"],
      type: "foreign key",
      name: "dosen_jadwal_jadwal_kelas_id_fk",
      references: { table: "jadwal_kelas", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("dosen_jadwal");
  },
};
