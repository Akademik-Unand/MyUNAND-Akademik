'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Krs extends Model {
    static associate(models) {
      Krs.belongsTo(models.Mahasiswa, { foreignKey: 'mahasiswa_id', as: 'mahasiswa' });
      Krs.belongsTo(models.SemesterProdi, { foreignKey: 'semester_prodi_id', as: 'semesterProdi' });
      Krs.hasMany(models.KrsDetil, { foreignKey: 'krs_id', as: 'krsDetil' });
    }
  }
  Krs.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    mahasiswa_id: { type: DataTypes.UUID, allowNull: false },
    semester_prodi_id: { type: DataTypes.UUID, allowNull: false },
    jam_mulai: { type: DataTypes.DATE, allowNull: true },
    jam_selesai: { type: DataTypes.DATE, allowNull: true },
    approval_ke: { type: DataTypes.TINYINT, defaultValue: 0 },
  }, { sequelize, modelName: 'Krs', tableName: 'krs', timestamps: true });
  return Krs;
};
