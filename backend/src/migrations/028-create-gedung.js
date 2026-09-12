"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("gedung", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      kode: { type: DataTypes.STRING(50), allowNull: false },
      nama: { type: DataTypes.STRING(255), allowNull: false },
      alamat: { type: DataTypes.TEXT, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
    });
    await queryInterface.addIndex("gedung", ["kode"], {
      unique: true,
      name: "kode",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("gedung");
  },
};
