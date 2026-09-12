"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("user_roles", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: { type: DataTypes.UUID, allowNull: false },
      role_id: { type: DataTypes.UUID, allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addIndex("user_roles", ["role_id"], {
      name: "role_id",
    });
    await queryInterface.addIndex("user_roles", ["user_id", "role_id"], {
      unique: true,
      name: "uk_user_role",
    });
    await queryInterface.addConstraint("user_roles", {
      fields: ["user_id"],
      type: "foreign key",
      name: "user_roles_user_id_fk",
      references: { table: "users", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    await queryInterface.addConstraint("user_roles", {
      fields: ["role_id"],
      type: "foreign key",
      name: "user_roles_role_id_fk",
      references: { table: "roles", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("user_roles");
  },
};
