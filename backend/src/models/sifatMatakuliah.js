'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class SifatMatakuliah extends Model {
    static associate(models) {
      SifatMatakuliah.hasMany(models.Matakuliah, { foreignKey: 'sifat_matakuliah_id', as: 'matakuliah' });
    }
  }
  SifatMatakuliah.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    kode_sifat_matakuliah: { type: DataTypes.CHAR(1), allowNull: false },
    nama: { type: DataTypes.STRING(255), allowNull: false },
  }, { sequelize, modelName: 'SifatMatakuliah', tableName: 'sifat_matakuliah', timestamps: true });
  return SifatMatakuliah;
};
