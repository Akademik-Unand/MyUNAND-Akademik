"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("dosen_kelas", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      dosen_id: { type: DataTypes.UUID, allowNull: false },
      kelas_id: { type: DataTypes.UUID, allowNull: false },
      dosen_ke: { type: DataTypes.TINYINT, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addIndex("dosen_kelas", ["dosen_id"], {
      name: "dosen_id",
    });
    await queryInterface.addIndex("dosen_kelas", ["kelas_id", "dosen_id"], {
      unique: true,
      name: "uk_dosen_kelas",
    });
    await queryInterface.addConstraint("dosen_kelas", {
      fields: ["dosen_id"],
      type: "foreign key",
      name: "dosen_kelas_dosen_id_fk",
      references: { table: "dosen", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    await queryInterface.addConstraint("dosen_kelas", {
      fields: ["kelas_id"],
      type: "foreign key",
      name: "dosen_kelas_kelas_id_fk",
      references: { table: "kelas", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("dosen_kelas");
  },
};
