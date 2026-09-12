"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("universitas", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      kode_universitas: { type: DataTypes.STRING(15), allowNull: false },
      nama_resmi: { type: DataTypes.STRING(255), allowNull: false },
      nama_singkat: { type: DataTypes.STRING(50), allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
    });
    await queryInterface.addIndex("universitas", ["kode_universitas"], {
      unique: true,
      name: "kode_universitas",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("universitas");
  },
};
