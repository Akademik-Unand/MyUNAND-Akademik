"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("kurikulum", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      program_studi_id: { type: DataTypes.UUID, allowNull: false },
      tahun: { type: DataTypes.SMALLINT, allowNull: true },
      nama: { type: DataTypes.STRING(255), allowNull: true },
      masa_studi_ideal: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
        allowNull: true,
      },
      masa_studi_maksimal: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
        allowNull: true,
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
    });
    await queryInterface.addIndex(
      "kurikulum",
      ["program_studi_id", "tahun", "nama"],
      {
        unique: true,
        name: "uk_kurikulum",
      },
    );
    await queryInterface.addConstraint("kurikulum", {
      fields: ["program_studi_id"],
      type: "foreign key",
      name: "kurikulum_program_studi_id_fk",
      references: { table: "program_studi", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("kurikulum");
  },
};
