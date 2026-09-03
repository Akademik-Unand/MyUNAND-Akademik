'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Universitas extends Model {
    static associate(models) {
      Universitas.hasMany(models.Fakultas, { foreignKey: 'universitas_id', as: 'fakultas' });
      Universitas.hasMany(models.Departemen, { foreignKey: 'universitas_id', as: 'departemen' });
      Universitas.hasMany(models.ProgramStudi, { foreignKey: 'universitas_id', as: 'programStudi' });
    }
  }
  Universitas.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    kode_universitas: { type: DataTypes.STRING(15), allowNull: false, unique: true },
    nama_resmi: { type: DataTypes.STRING(255), allowNull: false },
    nama_singkat: { type: DataTypes.STRING(50), allowNull: true },
  }, { sequelize, modelName: 'Universitas', tableName: 'universitas', timestamps: true });
  return Universitas;
};
