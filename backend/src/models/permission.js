'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Permission extends Model {
    static associate(models) {
      Permission.belongsToMany(models.Role, { through: models.RolePermission, foreignKey: 'permission_id', as: 'roles' });
    }
  }
  Permission.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    guard_name: { type: DataTypes.STRING(255), allowNull: false, defaultValue: 'api' },
    action: { type: DataTypes.STRING(50), allowNull: true },
    subject: { type: DataTypes.STRING(80), allowNull: true },
    group: { type: DataTypes.STRING(50), allowNull: true },
    description: { type: DataTypes.STRING(255), allowNull: true },
  }, { sequelize, modelName: 'Permission', tableName: 'permissions', timestamps: true, paranoid: true });
  return Permission;
};
