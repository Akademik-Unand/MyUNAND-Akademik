'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Departemen extends Model {
    static associate(models) {
      Departemen.belongsTo(models.Universitas, { foreignKey: 'universitas_id', as: 'universitas' });
      Departemen.belongsTo(models.Fakultas, { foreignKey: 'fakultas_id', as: 'fakultas' });
      Departemen.hasMany(models.ProgramStudi, { foreignKey: 'departemen_id', as: 'programStudi' });
    }
  }
  Departemen.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    kode_departemen: { type: DataTypes.STRING(15), allowNull: false, unique: true },
    universitas_id: { type: DataTypes.UUID, allowNull: true },
    fakultas_id: { type: DataTypes.UUID, allowNull: false },
    nama_resmi: { type: DataTypes.STRING(255), allowNull: false },
    nama_singkat: { type: DataTypes.STRING(255), allowNull: true },
  }, { sequelize, modelName: 'Departemen', tableName: 'departemen', timestamps: true, paranoid: true });
  return Departemen;
};
