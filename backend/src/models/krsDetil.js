'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class KrsDetil extends Model {
    static associate(models) {
      KrsDetil.belongsTo(models.Krs, { foreignKey: 'krs_id', as: 'krs' });
      KrsDetil.belongsTo(models.Kelas, { foreignKey: 'kelas_id', as: 'kelas' });
      KrsDetil.hasMany(models.NilaiMahasiswa, { foreignKey: 'krs_detil_id', as: 'nilaiMahasiswa' });
    }
  }
  KrsDetil.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    krs_id: { type: DataTypes.UUID, allowNull: false },
    kelas_id: { type: DataTypes.UUID, allowNull: false },
    approved: { type: DataTypes.ENUM('0', '1', '2'), defaultValue: '0' },
  }, { sequelize, modelName: 'KrsDetil', tableName: 'krs_detil', timestamps: true });
  return KrsDetil;
};
