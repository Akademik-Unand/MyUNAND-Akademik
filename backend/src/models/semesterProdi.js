'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class SemesterProdi extends Model {
    static associate(models) {
      SemesterProdi.belongsTo(models.ProgramStudi, { foreignKey: 'program_studi_id', as: 'programStudi' });
      SemesterProdi.belongsTo(models.Semester, { foreignKey: 'semester_id', as: 'semester' });
      SemesterProdi.hasMany(models.Kelas, { foreignKey: 'semester_prodi_id', as: 'kelas' });
      SemesterProdi.hasMany(models.Krs, { foreignKey: 'semester_prodi_id', as: 'krs' });
    }
  }
  SemesterProdi.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    program_studi_id: { type: DataTypes.UUID, allowNull: false },
    semester_id: { type: DataTypes.UUID, allowNull: true },
    is_aktif: { type: DataTypes.BOOLEAN, defaultValue: false },
    tanggal_krs_mulai: { type: DataTypes.DATEONLY, allowNull: true },
    tanggal_krs_selesai: { type: DataTypes.DATEONLY, allowNull: true },
    tanggal_revisi_mulai: { type: DataTypes.DATEONLY, allowNull: true },
    tanggal_revisi_selesai: { type: DataTypes.DATEONLY, allowNull: true },
    sks_default: { type: DataTypes.SMALLINT, defaultValue: 15 },
    sks_maksimal: { type: DataTypes.SMALLINT, defaultValue: 24 },
  }, { sequelize, modelName: 'SemesterProdi', tableName: 'semester_prodi', timestamps: true });
  return SemesterProdi;
};
