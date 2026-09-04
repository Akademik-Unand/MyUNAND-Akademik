'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.Dosen, { foreignKey: 'dosen_id', as: 'dosen' });
      User.belongsTo(models.Mahasiswa, { foreignKey: 'mahasiswa_id', as: 'mahasiswa' });
      User.belongsToMany(models.Role, { through: models.UserRole, foreignKey: 'user_id', as: 'roles' });
      User.hasMany(models.UserUnit, { foreignKey: 'user_id', as: 'units' });
      User.hasMany(models.RefreshToken, { foreignKey: 'user_id', as: 'refreshTokens' });
    }
  }
  User.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    email_verified_at: { type: DataTypes.DATE, allowNull: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
    role: { type: DataTypes.STRING(64), allowNull: false, defaultValue: 'admin' },
    dosen_id: { type: DataTypes.UUID, allowNull: true },
    mahasiswa_id: { type: DataTypes.UUID, allowNull: true },
    remember_token: { type: DataTypes.STRING(100), allowNull: true },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    paranoid: true,
  });
  return User;
};
