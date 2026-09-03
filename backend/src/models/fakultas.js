'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Fakultas extends Model {
    static associate(models) {
      Fakultas.belongsTo(models.Universitas, { foreignKey: 'universitas_id', as: 'universitas' });
      Fakultas.hasMany(models.Departemen, { foreignKey: 'fakultas_id', as: 'departemen' });
      Fakultas.hasMany(models.ProgramStudi, { foreignKey: 'fakultas_id', as: 'programStudi' });
    }
  }
  Fakultas.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    kode_fakultas: { type: DataTypes.STRING(15), allowNull: false, unique: true },
    universitas_id: { type: DataTypes.UUID, allowNull: true },
    nama_resmi: { type: DataTypes.STRING(255), allowNull: false },
    nama_singkat: { type: DataTypes.STRING(255), allowNull: true },
  }, { sequelize, modelName: 'Fakultas', tableName: 'fakultas', timestamps: true });
  return Fakultas;
};
