"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("departemen", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      kode_departemen: { type: DataTypes.STRING(15), allowNull: false },
      universitas_id: { type: DataTypes.UUID, allowNull: true },
      fakultas_id: { type: DataTypes.UUID, allowNull: false },
      nama_resmi: { type: DataTypes.STRING(255), allowNull: false },
      nama_singkat: { type: DataTypes.STRING(255), allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
    });
    await queryInterface.addIndex("departemen", ["fakultas_id"], {
      name: "fakultas_id",
    });
    await queryInterface.addIndex("departemen", ["kode_departemen"], {
      unique: true,
      name: "kode_departemen",
    });
    await queryInterface.addIndex("departemen", ["universitas_id"], {
      name: "universitas_id",
    });
    await queryInterface.addConstraint("departemen", {
      fields: ["universitas_id"],
      type: "foreign key",
      name: "departemen_universitas_id_fk",
      references: { table: "universitas", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
    await queryInterface.addConstraint("departemen", {
      fields: ["fakultas_id"],
      type: "foreign key",
      name: "departemen_fakultas_id_fk",
      references: { table: "fakultas", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("departemen");
  },
};
