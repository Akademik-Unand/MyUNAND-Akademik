'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Role extends Model {
    static associate(models) {
      Role.belongsToMany(models.User, { through: models.UserRole, foreignKey: 'role_id', as: 'users' });
      Role.belongsToMany(models.Permission, { through: models.RolePermission, foreignKey: 'role_id', as: 'permissions' });
    }
  }
  Role.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    guard_name: { type: DataTypes.STRING(255), allowNull: false, defaultValue: 'api' },
  }, { sequelize, modelName: 'Role', tableName: 'roles', timestamps: true });
  return Role;
};
