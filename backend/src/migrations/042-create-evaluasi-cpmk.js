"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("evaluasi_cpmk", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      kelas_id: { type: DataTypes.UUID, allowNull: false },
      cpmk_id: { type: DataTypes.UUID, allowNull: false },
      target_nilai_min: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        allowNull: true,
      },
      target_persen_lulus: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        allowNull: true,
      },
      capaian_persen: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        allowNull: true,
      },
      rata_rata: { type: DataTypes.FLOAT, defaultValue: 0, allowNull: true },
      jumlah_lulus: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: true,
      },
      analisis: { type: DataTypes.TEXT, allowNull: true },
      tindak_lanjut: { type: DataTypes.TEXT, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addIndex("evaluasi_cpmk", ["cpmk_id"], {
      name: "cpmk_id",
    });
    await queryInterface.addIndex("evaluasi_cpmk", ["kelas_id", "cpmk_id"], {
      unique: true,
      name: "uk_evaluasi_cpmk",
    });
    await queryInterface.addConstraint("evaluasi_cpmk", {
      fields: ["kelas_id"],
      type: "foreign key",
      name: "evaluasi_cpmk_kelas_id_fk",
      references: { table: "kelas", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    await queryInterface.addConstraint("evaluasi_cpmk", {
      fields: ["cpmk_id"],
      type: "foreign key",
      name: "evaluasi_cpmk_cpmk_id_fk",
      references: { table: "cpmk", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("evaluasi_cpmk");
  },
};
