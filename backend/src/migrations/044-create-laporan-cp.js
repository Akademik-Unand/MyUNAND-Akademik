"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("laporan_cp", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      program_studi_id: { type: DataTypes.UUID, allowNull: false },
      kurikulum_id: { type: DataTypes.UUID, allowNull: true },
      nama_laporan: { type: DataTypes.STRING(255), allowNull: false },
      keterangan: { type: DataTypes.TEXT, allowNull: true },
      file_path: { type: DataTypes.STRING(255), allowNull: true },
      dibuat_oleh: { type: DataTypes.UUID, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      semester_id: { type: DataTypes.UUID, allowNull: true },
    });
    await queryInterface.addIndex("laporan_cp", ["dibuat_oleh"], {
      name: "dibuat_oleh",
    });
    await queryInterface.addIndex("laporan_cp", ["kurikulum_id"], {
      name: "kurikulum_id",
    });
    await queryInterface.addIndex("laporan_cp", ["semester_id"], {
      name: "laporan_cp_semester_id_foreign_idx",
    });
    await queryInterface.addIndex("laporan_cp", ["program_studi_id"], {
      name: "program_studi_id",
    });
    await queryInterface.addConstraint("laporan_cp", {
      fields: ["program_studi_id"],
      type: "foreign key",
      name: "laporan_cp_program_studi_id_fk",
      references: { table: "program_studi", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    await queryInterface.addConstraint("laporan_cp", {
      fields: ["kurikulum_id"],
      type: "foreign key",
      name: "laporan_cp_kurikulum_id_fk",
      references: { table: "kurikulum", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
    await queryInterface.addConstraint("laporan_cp", {
      fields: ["dibuat_oleh"],
      type: "foreign key",
      name: "laporan_cp_dibuat_oleh_fk",
      references: { table: "users", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
    await queryInterface.addConstraint("laporan_cp", {
      fields: ["semester_id"],
      type: "foreign key",
      name: "laporan_cp_semester_id_fk",
      references: { table: "semester", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("laporan_cp");
  },
};
