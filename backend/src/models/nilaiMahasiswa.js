'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class NilaiMahasiswa extends Model {
    static associate(models) {
      NilaiMahasiswa.belongsTo(models.KrsDetil, { foreignKey: 'krs_detil_id', as: 'krsDetil' });
      NilaiMahasiswa.belongsTo(models.SumberPenilaian, { foreignKey: 'sumber_penilaian_id', as: 'sumberPenilaian' });
    }
  }
  NilaiMahasiswa.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    krs_detil_id: { type: DataTypes.UUID, allowNull: false },
    sumber_penilaian_id: { type: DataTypes.UUID, allowNull: false },
    nilai: { type: DataTypes.FLOAT, allowNull: true },
    catatan: { type: DataTypes.TEXT, allowNull: true },
  }, { sequelize, modelName: 'NilaiMahasiswa', tableName: 'nilai_mahasiswa', timestamps: true });
  return NilaiMahasiswa;
};
