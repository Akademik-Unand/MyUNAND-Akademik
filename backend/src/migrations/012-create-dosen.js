"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("dosen", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      nip: { type: DataTypes.STRING(18), allowNull: false },
      program_studi_id: { type: DataTypes.UUID, allowNull: true },
      nama: { type: DataTypes.STRING(255), allowNull: true },
      nidn: { type: DataTypes.STRING(10), allowNull: true },
      nip_lama: { type: DataTypes.STRING(20), allowNull: true },
      nip_baru: { type: DataTypes.STRING(20), allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
    });
    await queryInterface.addIndex("dosen", ["nip"], {
      unique: true,
      name: "nip",
    });
    await queryInterface.addIndex("dosen", ["program_studi_id"], {
      name: "program_studi_id",
    });
    await queryInterface.addConstraint("dosen", {
      fields: ["program_studi_id"],
      type: "foreign key",
      name: "dosen_program_studi_id_fk",
      references: { table: "program_studi", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("dosen");
  },
};
