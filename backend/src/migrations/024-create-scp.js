"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("scp", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      cp_id: { type: DataTypes.UUID, allowNull: false },
      nama_scp: { type: DataTypes.STRING(255), allowNull: false },
      deskripsi: { type: DataTypes.TEXT, allowNull: true },
      persen_capai_nilai_min: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        allowNull: false,
      },
      nilai_min: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
    });
    await queryInterface.addIndex("scp", ["cp_id"], { name: "idx_scp_cp" });
    await queryInterface.addConstraint("scp", {
      fields: ["cp_id"],
      type: "foreign key",
      name: "scp_cp_id_fk",
      references: { table: "cp", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("scp");
  },
};
