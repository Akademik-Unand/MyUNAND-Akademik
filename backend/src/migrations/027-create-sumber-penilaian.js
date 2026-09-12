"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("sumber_penilaian", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      cpmk_id: { type: DataTypes.UUID, allowNull: false },
      nama_sumber_penilaian: { type: DataTypes.STRING(255), allowNull: false },
      bobot: { type: DataTypes.FLOAT, defaultValue: 0, allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addIndex("sumber_penilaian", ["cpmk_id"], {
      name: "idx_sumber_penilaian_cpmk",
    });
    await queryInterface.addConstraint("sumber_penilaian", {
      fields: ["cpmk_id"],
      type: "foreign key",
      name: "sumber_penilaian_cpmk_id_fk",
      references: { table: "cpmk", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("sumber_penilaian");
  },
};
