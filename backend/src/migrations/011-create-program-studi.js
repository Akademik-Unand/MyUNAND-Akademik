"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("program_studi", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      kode_prodi: { type: DataTypes.STRING(15), allowNull: false },
      jenjang_akademik_id: { type: DataTypes.UUID, allowNull: true },
      model_kurikulum_id: { type: DataTypes.UUID, allowNull: true },
      universitas_id: { type: DataTypes.UUID, allowNull: true },
      fakultas_id: { type: DataTypes.UUID, allowNull: false },
      departemen_id: { type: DataTypes.UUID, allowNull: true },
      nama_resmi: { type: DataTypes.STRING(255), allowNull: false },
      nama_singkat: { type: DataTypes.STRING(255), allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
      sks_default: {
        type: DataTypes.SMALLINT,
        defaultValue: 15,
        allowNull: true,
      },
      sks_maksimal: {
        type: DataTypes.SMALLINT,
        defaultValue: 24,
        allowNull: true,
      },
    });
    await queryInterface.addIndex("program_studi", ["departemen_id"], {
      name: "departemen_id",
    });
    await queryInterface.addIndex("program_studi", ["fakultas_id"], {
      name: "fakultas_id",
    });
    await queryInterface.addIndex("program_studi", ["jenjang_akademik_id"], {
      name: "jenjang_akademik_id",
    });
    await queryInterface.addIndex("program_studi", ["kode_prodi"], {
      unique: true,
      name: "kode_prodi",
    });
    await queryInterface.addIndex("program_studi", ["model_kurikulum_id"], {
      name: "model_kurikulum_id",
    });
    await queryInterface.addIndex(
      "program_studi",
      ["kode_prodi", "jenjang_akademik_id", "model_kurikulum_id"],
      {
        unique: true,
        name: "uk_prodi_jenjang_model",
      },
    );
    await queryInterface.addIndex("program_studi", ["universitas_id"], {
      name: "universitas_id",
    });
    await queryInterface.addConstraint("program_studi", {
      fields: ["jenjang_akademik_id"],
      type: "foreign key",
      name: "program_studi_jenjang_akademik_id_fk",
      references: { table: "jenjang_akademik", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
    await queryInterface.addConstraint("program_studi", {
      fields: ["model_kurikulum_id"],
      type: "foreign key",
      name: "program_studi_model_kurikulum_id_fk",
      references: { table: "model_kurikulum", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
    await queryInterface.addConstraint("program_studi", {
      fields: ["universitas_id"],
      type: "foreign key",
      name: "program_studi_universitas_id_fk",
      references: { table: "universitas", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
    await queryInterface.addConstraint("program_studi", {
      fields: ["fakultas_id"],
      type: "foreign key",
      name: "program_studi_fakultas_id_fk",
      references: { table: "fakultas", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
    await queryInterface.addConstraint("program_studi", {
      fields: ["departemen_id"],
      type: "foreign key",
      name: "program_studi_departemen_id_fk",
      references: { table: "departemen", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("program_studi");
  },
};
