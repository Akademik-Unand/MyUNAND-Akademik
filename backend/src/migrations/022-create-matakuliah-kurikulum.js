"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("matakuliah_kurikulum", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      kurikulum_id: { type: DataTypes.UUID, allowNull: false },
      matakuliah_id: { type: DataTypes.UUID, allowNull: false },
      status: { type: DataTypes.STRING(10), allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addIndex(
      "matakuliah_kurikulum",
      ["kurikulum_id", "matakuliah_id"],
      {
        name: "idx_mk_kurikulum_lookup",
      },
    );
    await queryInterface.addIndex("matakuliah_kurikulum", ["matakuliah_id"], {
      name: "matakuliah_id",
    });
    await queryInterface.addIndex(
      "matakuliah_kurikulum",
      ["kurikulum_id", "matakuliah_id"],
      {
        unique: true,
        name: "uk_mk_kurikulum",
      },
    );
    await queryInterface.addConstraint("matakuliah_kurikulum", {
      fields: ["kurikulum_id"],
      type: "foreign key",
      name: "matakuliah_kurikulum_kurikulum_id_fk",
      references: { table: "kurikulum", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
    await queryInterface.addConstraint("matakuliah_kurikulum", {
      fields: ["matakuliah_id"],
      type: "foreign key",
      name: "matakuliah_kurikulum_matakuliah_id_fk",
      references: { table: "matakuliah", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("matakuliah_kurikulum");
  },
};
