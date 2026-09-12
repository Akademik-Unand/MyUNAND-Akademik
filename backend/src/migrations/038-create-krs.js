"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("krs", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      mahasiswa_id: { type: DataTypes.UUID, allowNull: false },
      jam_mulai: { type: DataTypes.DATE, allowNull: true },
      jam_selesai: { type: DataTypes.DATE, allowNull: true },
      approval_ke: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
        allowNull: true,
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      semester_id: { type: DataTypes.UUID, allowNull: false },
    });
    await queryInterface.addIndex("krs", ["semester_id"], {
      name: "idx_krs_semester",
    });
    await queryInterface.addIndex("krs", ["mahasiswa_id"], {
      name: "mahasiswa_id",
    });
    await queryInterface.addIndex("krs", ["semester_id", "mahasiswa_id"], {
      unique: true,
      name: "uq_krs_semester_mahasiswa",
    });
    await queryInterface.addConstraint("krs", {
      fields: ["mahasiswa_id"],
      type: "foreign key",
      name: "krs_mahasiswa_id_fk",
      references: { table: "mahasiswa", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    await queryInterface.addConstraint("krs", {
      fields: ["semester_id"],
      type: "foreign key",
      name: "krs_semester_id_fk",
      references: { table: "semester", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("krs");
  },
};
