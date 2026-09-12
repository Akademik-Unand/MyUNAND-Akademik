"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("mahasiswa", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      niu: { type: DataTypes.STRING(20), allowNull: false },
      nama: { type: DataTypes.STRING(255), allowNull: false },
      angkatan: { type: DataTypes.SMALLINT, defaultValue: 0, allowNull: true },
      program_studi_id: { type: DataTypes.UUID, allowNull: true },
      jenis_kelamin: { type: DataTypes.ENUM("L", "P"), allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
    });
    await queryInterface.addIndex("mahasiswa", ["niu"], {
      unique: true,
      name: "niu",
    });
    await queryInterface.addIndex("mahasiswa", ["program_studi_id"], {
      name: "program_studi_id",
    });
    await queryInterface.addConstraint("mahasiswa", {
      fields: ["program_studi_id"],
      type: "foreign key",
      name: "mahasiswa_program_studi_id_fk",
      references: { table: "program_studi", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("mahasiswa");
  },
};
