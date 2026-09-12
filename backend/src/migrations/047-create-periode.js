"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("periode", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      semester_id: { type: DataTypes.UUID, allowNull: false },
      jenis: { type: DataTypes.STRING(20), allowNull: false },
      tanggal_mulai: { type: DataTypes.DATEONLY, allowNull: false },
      tanggal_selesai: { type: DataTypes.DATEONLY, allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
    });
    await queryInterface.addIndex("periode", ["semester_id", "jenis"], {
      name: "idx_periode_semester_jenis",
    });
    await queryInterface.addConstraint("periode", {
      fields: ["semester_id"],
      type: "foreign key",
      name: "periode_semester_id_fk",
      references: { table: "semester", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("periode");
  },
};
