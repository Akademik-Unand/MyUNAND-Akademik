'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class RekapCp extends Model {
    static associate(models) {
      RekapCp.belongsTo(models.Mahasiswa, { foreignKey: 'mahasiswa_id', as: 'mahasiswa' });
      RekapCp.belongsTo(models.Cp, { foreignKey: 'cp_id', as: 'cp' });
      RekapCp.belongsTo(models.SemesterProdi, { foreignKey: 'semester_prodi_id', as: 'semesterProdi' });
    }
  }
  RekapCp.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    mahasiswa_id: { type: DataTypes.UUID, allowNull: false },
    cp_id: { type: DataTypes.UUID, allowNull: false },
    semester_prodi_id: { type: DataTypes.UUID, allowNull: true },
    nilai_capaian: { type: DataTypes.FLOAT, defaultValue: 0 },
    status_lulus: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, { sequelize, modelName: 'RekapCp', tableName: 'rekap_cp', timestamps: true });
  return RekapCp;
};
