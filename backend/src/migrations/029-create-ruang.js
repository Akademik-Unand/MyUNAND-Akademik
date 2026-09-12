"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("ruang", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      kode: { type: DataTypes.STRING(50), allowNull: false },
      nama: { type: DataTypes.STRING(255), allowNull: false },
      kapasitas: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
      gedung_id: { type: DataTypes.UUID, allowNull: true },
    });
    await queryInterface.addIndex("ruang", ["gedung_id"], {
      name: "ruang_gedung_id_foreign_idx",
    });
    await queryInterface.addConstraint("ruang", {
      fields: ["gedung_id"],
      type: "foreign key",
      name: "ruang_gedung_id_fk",
      references: { table: "gedung", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("ruang");
  },
};
