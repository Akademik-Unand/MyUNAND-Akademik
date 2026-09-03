'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class UserRole extends Model {
    static associate(models) {
      UserRole.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      UserRole.belongsTo(models.Role, { foreignKey: 'role_id', as: 'role' });
    }
  }
  UserRole.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    role_id: { type: DataTypes.UUID, allowNull: false },
  }, { sequelize, modelName: 'UserRole', tableName: 'user_roles', timestamps: true });
  return UserRole;
};
