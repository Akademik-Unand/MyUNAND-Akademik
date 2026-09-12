"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("role_permissions", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      role_id: { type: DataTypes.UUID, allowNull: false },
      permission_id: { type: DataTypes.UUID, allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addIndex("role_permissions", ["permission_id"], {
      name: "permission_id",
    });
    await queryInterface.addIndex(
      "role_permissions",
      ["role_id", "permission_id"],
      {
        unique: true,
        name: "uk_role_permission",
      },
    );
    await queryInterface.addConstraint("role_permissions", {
      fields: ["role_id"],
      type: "foreign key",
      name: "role_permissions_role_id_fk",
      references: { table: "roles", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    await queryInterface.addConstraint("role_permissions", {
      fields: ["permission_id"],
      type: "foreign key",
      name: "role_permissions_permission_id_fk",
      references: { table: "permissions", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("role_permissions");
  },
};
