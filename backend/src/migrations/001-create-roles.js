"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("roles", {
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
      deletedAt: { type: DataTypes.DATE, allowNull: true },
    });
    await queryInterface.addIndex("roles", ["name"], {
      unique: true,
      name: "name",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("roles");
  },
};
