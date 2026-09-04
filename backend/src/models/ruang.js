'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Ruang extends Model {
    static associate(models) {
      Ruang.hasMany(models.JadwalKelas, { foreignKey: 'ruang_id', as: 'jadwalKelas' });
    }
  }
  Ruang.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    kode: { type: DataTypes.STRING(50), allowNull: false },
    nama: { type: DataTypes.STRING(255), allowNull: false },
    kapasitas: { type: DataTypes.INTEGER, defaultValue: 0 },
  }, { sequelize, modelName: 'Ruang', tableName: 'ruang', timestamps: true, paranoid: true });
  return Ruang;
};
