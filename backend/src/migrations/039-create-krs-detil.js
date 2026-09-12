"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("krs_detil", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      krs_id: { type: DataTypes.UUID, allowNull: false },
      kelas_id: { type: DataTypes.UUID, allowNull: false },
      approved: {
        type: DataTypes.ENUM("0", "1", "2"),
        defaultValue: "0",
        allowNull: true,
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      is_cross_enrollment: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      cross_enrollment_status: {
        type: DataTypes.ENUM("pending_pa", "approved", "rejected"),
        allowNull: true,
      },
      rejected_by: { type: DataTypes.UUID, allowNull: true },
      rejected_at: { type: DataTypes.DATE, allowNull: true },
      rejection_reason: { type: DataTypes.TEXT, allowNull: true },
      pa_approved_by: { type: DataTypes.UUID, allowNull: true },
      pa_approved_at: { type: DataTypes.DATE, allowNull: true },
    });
    await queryInterface.addIndex(
      "krs_detil",
      ["cross_enrollment_status", "kelas_id"],
      {
        name: "idx_krs_detil_cross_status_kelas",
      },
    );
    await queryInterface.addIndex("krs_detil", ["kelas_id"], {
      name: "idx_krs_detil_kelas",
    });
    await queryInterface.addIndex("krs_detil", ["pa_approved_by"], {
      name: "krs_detil_pa_approved_by_foreign_idx",
    });
    await queryInterface.addIndex("krs_detil", ["rejected_by"], {
      name: "krs_detil_rejected_by_foreign_idx",
    });
    await queryInterface.addIndex("krs_detil", ["krs_id", "kelas_id"], {
      unique: true,
      name: "uk_krs_detil",
    });
    await queryInterface.addConstraint("krs_detil", {
      fields: ["krs_id"],
      type: "foreign key",
      name: "krs_detil_krs_id_fk",
      references: { table: "krs", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    await queryInterface.addConstraint("krs_detil", {
      fields: ["kelas_id"],
      type: "foreign key",
      name: "krs_detil_kelas_id_fk",
      references: { table: "kelas", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    await queryInterface.addConstraint("krs_detil", {
      fields: ["pa_approved_by"],
      type: "foreign key",
      name: "krs_detil_pa_approved_by_fk",
      references: { table: "users", field: "id" },
      onUpdate: "NO ACTION",
      onDelete: "SET NULL",
    });
    await queryInterface.addConstraint("krs_detil", {
      fields: ["rejected_by"],
      type: "foreign key",
      name: "krs_detil_rejected_by_fk",
      references: { table: "users", field: "id" },
      onUpdate: "NO ACTION",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("krs_detil");
  },
};
