"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("activity_logs", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: { type: DataTypes.UUID, allowNull: true },
      user_email: { type: DataTypes.STRING(255), allowNull: true },
      user_name: { type: DataTypes.STRING(255), allowNull: true },
      action: { type: DataTypes.STRING(50), allowNull: false },
      subject: { type: DataTypes.STRING(80), allowNull: true },
      resource_id: { type: DataTypes.STRING(64), allowNull: true },
      method: { type: DataTypes.STRING(10), allowNull: false },
      path: { type: DataTypes.STRING(255), allowNull: false },
      status_code: { type: DataTypes.INTEGER, allowNull: false },
      ip: { type: DataTypes.STRING(64), allowNull: true },
      user_agent: { type: DataTypes.STRING(512), allowNull: true },
      summary: { type: DataTypes.STRING(255), allowNull: true },
      payload: { type: DataTypes.JSON, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addIndex("activity_logs", ["action"], {
      name: "idx_activity_logs_action",
    });
    await queryInterface.addIndex("activity_logs", ["createdAt"], {
      name: "idx_activity_logs_created_at",
    });
    await queryInterface.addIndex("activity_logs", ["subject"], {
      name: "idx_activity_logs_subject",
    });
    await queryInterface.addIndex("activity_logs", ["user_email"], {
      name: "idx_activity_logs_user_email",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("activity_logs");
  },
};
