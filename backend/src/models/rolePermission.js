'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class RolePermission extends Model {
    static associate(models) {
      RolePermission.belongsTo(models.Role, { foreignKey: 'role_id', as: 'role' });
      RolePermission.belongsTo(models.Permission, { foreignKey: 'permission_id', as: 'permission' });
    }
  }
  RolePermission.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    role_id: { type: DataTypes.UUID, allowNull: false },
    permission_id: { type: DataTypes.UUID, allowNull: false },
  }, { sequelize, modelName: 'RolePermission', tableName: 'role_permissions', timestamps: true });
  return RolePermission;
};
