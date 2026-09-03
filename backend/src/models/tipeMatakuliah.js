'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class TipeMatakuliah extends Model {
    static associate(models) {
      TipeMatakuliah.hasMany(models.Matakuliah, { foreignKey: 'tipe_matakuliah_id', as: 'matakuliah' });
    }
  }
  TipeMatakuliah.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    kode_tipe_matakuliah: { type: DataTypes.STRING(10), allowNull: false },
    nama: { type: DataTypes.STRING(255), allowNull: false },
    is_dipakai: { type: DataTypes.TINYINT, defaultValue: 1 },
  }, { sequelize, modelName: 'TipeMatakuliah', tableName: 'tipe_matakuliah', timestamps: true });
  return TipeMatakuliah;
};
