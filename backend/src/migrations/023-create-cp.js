"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("cp", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      kurikulum_id: { type: DataTypes.UUID, allowNull: false },
      nama_cp: { type: DataTypes.STRING(255), allowNull: false },
      deskripsi: { type: DataTypes.TEXT, allowNull: true },
      nilai_max: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
        allowNull: false,
      },
      nilai_min: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
    });
    await queryInterface.addIndex("cp", ["kurikulum_id"], {
      name: "kurikulum_id",
    });
    await queryInterface.addConstraint("cp", {
      fields: ["kurikulum_id"],
      type: "foreign key",
      name: "cp_kurikulum_id_fk",
      references: { table: "kurikulum", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("cp");
  },
};
