'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class SumberPenilaian extends Model {
    static associate(models) {
      SumberPenilaian.belongsTo(models.Cpmk, { foreignKey: 'cpmk_id', as: 'cpmk' });
      SumberPenilaian.hasMany(models.NilaiMahasiswa, { foreignKey: 'sumber_penilaian_id', as: 'nilaiMahasiswa' });
    }
  }
  SumberPenilaian.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    cpmk_id: { type: DataTypes.UUID, allowNull: false },
    nama_sumber_penilaian: { type: DataTypes.STRING(255), allowNull: false },
    bobot: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  }, { sequelize, modelName: 'SumberPenilaian', tableName: 'sumber_penilaian', timestamps: true });
  return SumberPenilaian;
};
