'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class UserUnit extends Model {
    static associate(models) {
      UserUnit.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      UserUnit.belongsTo(models.Fakultas, { foreignKey: 'fakultas_id', as: 'fakultas' });
      UserUnit.belongsTo(models.Departemen, { foreignKey: 'departemen_id', as: 'departemen' });
      UserUnit.belongsTo(models.ProgramStudi, { foreignKey: 'program_studi_id', as: 'programStudi' });
    }
  }
  UserUnit.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      user_id: { type: DataTypes.UUID, allowNull: false },
      fakultas_id: { type: DataTypes.UUID, allowNull: true },
      departemen_id: { type: DataTypes.UUID, allowNull: true },
      program_studi_id: { type: DataTypes.UUID, allowNull: true },
    },
    {
      sequelize,
      modelName: 'UserUnit',
      tableName: 'user_units',
      timestamps: true,
      paranoid: true,
    }
  );
  return UserUnit;
};