"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("refresh_tokens", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: { type: DataTypes.UUID, allowNull: false },
      token_hash: { type: DataTypes.STRING(64), allowNull: false },
      expires_at: { type: DataTypes.DATE, allowNull: false },
      revoked_at: { type: DataTypes.DATE, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addIndex("refresh_tokens", ["expires_at"], {
      name: "idx_refresh_tokens_expires",
    });
    await queryInterface.addIndex("refresh_tokens", ["user_id"], {
      name: "idx_refresh_tokens_user",
    });
    await queryInterface.addIndex("refresh_tokens", ["token_hash"], {
      unique: true,
      name: "token_hash",
    });
    await queryInterface.addConstraint("refresh_tokens", {
      fields: ["user_id"],
      type: "foreign key",
      name: "refresh_tokens_user_id_fk",
      references: { table: "users", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("refresh_tokens");
  },
};
