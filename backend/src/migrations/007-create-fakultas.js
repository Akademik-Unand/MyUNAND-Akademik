"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("fakultas", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      kode_fakultas: { type: DataTypes.STRING(15), allowNull: false },
      universitas_id: { type: DataTypes.UUID, allowNull: true },
      nama_resmi: { type: DataTypes.STRING(255), allowNull: false },
      nama_singkat: { type: DataTypes.STRING(255), allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
    });
    await queryInterface.addIndex("fakultas", ["kode_fakultas"], {
      unique: true,
      name: "kode_fakultas",
    });
    await queryInterface.addIndex("fakultas", ["universitas_id"], {
      name: "universitas_id",
    });
    await queryInterface.addConstraint("fakultas", {
      fields: ["universitas_id"],
      type: "foreign key",
      name: "fakultas_universitas_id_fk",
      references: { table: "universitas", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("fakultas");
  },
};
