'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class ActivityLog extends Model {
    static associate(models) {
      ActivityLog.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }

  ActivityLog.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
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
  }, {
    sequelize,
    modelName: 'ActivityLog',
    tableName: 'activity_logs',
    timestamps: true,
    updatedAt: false,
  });

  return ActivityLog;
};
