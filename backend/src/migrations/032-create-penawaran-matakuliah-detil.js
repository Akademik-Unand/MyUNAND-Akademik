"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("penawaran_matakuliah_detil", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      penawaran_matakuliah_id: { type: DataTypes.UUID, allowNull: false },
      matakuliah_id: { type: DataTypes.UUID, allowNull: false },
      kuota_lintas_prodi: { type: DataTypes.INTEGER, allowNull: true },
      minimal_semester: { type: DataTypes.TINYINT, allowNull: true },
      maksimal_semester: { type: DataTypes.TINYINT, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addIndex(
      "penawaran_matakuliah_detil",
      ["matakuliah_id"],
      {
        name: "matakuliah_id",
      },
    );
    await queryInterface.addIndex(
      "penawaran_matakuliah_detil",
      ["penawaran_matakuliah_id", "matakuliah_id"],
      {
        unique: true,
        name: "uq_penawaran_detil_matakuliah",
      },
    );
    await queryInterface.addConstraint("penawaran_matakuliah_detil", {
      fields: ["penawaran_matakuliah_id"],
      type: "foreign key",
      name: "penawaran_matakuliah_detil_penawaran_matakuliah_id_fk",
      references: { table: "penawaran_matakuliah", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    await queryInterface.addConstraint("penawaran_matakuliah_detil", {
      fields: ["matakuliah_id"],
      type: "foreign key",
      name: "penawaran_matakuliah_detil_matakuliah_id_fk",
      references: { table: "matakuliah", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("penawaran_matakuliah_detil");
  },
};
