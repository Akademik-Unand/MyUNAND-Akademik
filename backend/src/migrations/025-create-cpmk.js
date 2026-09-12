"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("cpmk", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      matakuliah_id: { type: DataTypes.UUID, allowNull: false },
      nama_cpmk: { type: DataTypes.STRING(255), allowNull: false },
      deskripsi: { type: DataTypes.TEXT, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
      parent_cpmk_id: { type: DataTypes.UUID, allowNull: true },
    });
    await queryInterface.addIndex("cpmk", ["matakuliah_id"], {
      name: "idx_cpmk_matakuliah",
    });
    await queryInterface.addIndex("cpmk", ["parent_cpmk_id"], {
      name: "idx_cpmk_parent",
    });
    await queryInterface.addConstraint("cpmk", {
      fields: ["matakuliah_id"],
      type: "foreign key",
      name: "cpmk_matakuliah_id_fk",
      references: { table: "matakuliah", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
    await queryInterface.addConstraint("cpmk", {
      fields: ["parent_cpmk_id"],
      type: "foreign key",
      name: "cpmk_parent_cpmk_id_fk",
      references: { table: "cpmk", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("cpmk");
  },
};
