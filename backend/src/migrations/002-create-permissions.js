"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("permissions", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: { type: DataTypes.STRING(255), allowNull: false },
      guard_name: {
        type: DataTypes.STRING(255),
        defaultValue: "api",
        allowNull: false,
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      action: { type: DataTypes.STRING(50), allowNull: true },
      subject: { type: DataTypes.STRING(80), allowNull: true },
      group: { type: DataTypes.STRING(50), allowNull: true },
      description: { type: DataTypes.STRING(255), allowNull: true },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
    });
    await queryInterface.addIndex("permissions", ["name"], {
      unique: true,
      name: "name",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("permissions");
  },
};
