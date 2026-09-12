"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("shift", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      fakultas_id: { type: DataTypes.UUID, allowNull: false },
      kode: { type: DataTypes.STRING(50), allowNull: false },
      jam_mulai: { type: DataTypes.TIME, allowNull: false },
      jam_selesai: { type: DataTypes.TIME, allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
    });
    await queryInterface.addIndex("shift", ["fakultas_id"], {
      name: "idx_shift_fakultas",
    });
    await queryInterface.addConstraint("shift", {
      fields: ["fakultas_id"],
      type: "foreign key",
      name: "shift_fakultas_id_fk",
      references: { table: "fakultas", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("shift");
  },
};
