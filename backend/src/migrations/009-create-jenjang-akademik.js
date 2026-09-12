"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("jenjang_akademik", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      kode_jenjang: { type: DataTypes.STRING(10), allowNull: false },
      nama_jenjang: { type: DataTypes.STRING(255), allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
    });
    await queryInterface.addIndex("jenjang_akademik", ["kode_jenjang"], {
      unique: true,
      name: "kode_jenjang",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("jenjang_akademik");
  },
};
