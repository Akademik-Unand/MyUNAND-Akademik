"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("user_units", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: { type: DataTypes.UUID, allowNull: false },
      fakultas_id: { type: DataTypes.UUID, allowNull: true },
      departemen_id: { type: DataTypes.UUID, allowNull: true },
      program_studi_id: { type: DataTypes.UUID, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
    });
    await queryInterface.addIndex("user_units", ["departemen_id"], {
      name: "idx_user_units_departemen",
    });
    await queryInterface.addIndex("user_units", ["fakultas_id"], {
      name: "idx_user_units_fakultas",
    });
    await queryInterface.addIndex("user_units", ["program_studi_id"], {
      name: "idx_user_units_prodi",
    });
    await queryInterface.addIndex("user_units", ["user_id"], {
      name: "idx_user_units_user",
    });
    await queryInterface.addIndex("user_units", ["user_id", "deletedAt"], {
      name: "idx_user_units_user_active",
    });
    await queryInterface.addIndex(
      "user_units",
      ["user_id", "departemen_id", "deletedAt"],
      {
        name: "idx_user_units_user_departemen_active",
      },
    );
    await queryInterface.addIndex(
      "user_units",
      ["user_id", "fakultas_id", "deletedAt"],
      {
        name: "idx_user_units_user_fakultas_active",
      },
    );
    await queryInterface.addIndex(
      "user_units",
      ["user_id", "program_studi_id", "deletedAt"],
      {
        name: "idx_user_units_user_prodi_active",
      },
    );
    await queryInterface.addConstraint("user_units", {
      fields: ["user_id"],
      type: "foreign key",
      name: "user_units_user_id_fk",
      references: { table: "users", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    await queryInterface.addConstraint("user_units", {
      fields: ["fakultas_id"],
      type: "foreign key",
      name: "user_units_fakultas_id_fk",
      references: { table: "fakultas", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
    await queryInterface.addConstraint("user_units", {
      fields: ["departemen_id"],
      type: "foreign key",
      name: "user_units_departemen_id_fk",
      references: { table: "departemen", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
    await queryInterface.addConstraint("user_units", {
      fields: ["program_studi_id"],
      type: "foreign key",
      name: "user_units_program_studi_id_fk",
      references: { table: "program_studi", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("user_units");
  },
};
