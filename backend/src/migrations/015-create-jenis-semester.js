"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("jenis_semester", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      nama: { type: DataTypes.STRING(50), allowNull: false },
      alias: { type: DataTypes.STRING(10), allowNull: true },
      urut: { type: DataTypes.SMALLINT, defaultValue: 0, allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
    });
    await queryInterface.addIndex("jenis_semester", ["nama"], {
      unique: true,
      name: "nama",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("jenis_semester");
  },
};
