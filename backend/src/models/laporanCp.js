'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class LaporanCp extends Model {
    static associate(models) {
      LaporanCp.belongsTo(models.ProgramStudi, { foreignKey: 'program_studi_id', as: 'programStudi' });
      LaporanCp.belongsTo(models.Kurikulum, { foreignKey: 'kurikulum_id', as: 'kurikulum' });
      LaporanCp.belongsTo(models.Semester, { foreignKey: 'semester_id', as: 'semester' });
      LaporanCp.belongsTo(models.User, { foreignKey: 'dibuat_oleh', as: 'pembuat' });
      LaporanCp.hasMany(models.LaporanCpDetil, { foreignKey: 'laporan_cp_id', as: 'items' });
    }
  }
  LaporanCp.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    program_studi_id: { type: DataTypes.UUID, allowNull: false },
    kurikulum_id: { type: DataTypes.UUID, allowNull: true },
    nama_laporan: { type: DataTypes.STRING(255), allowNull: false },
    keterangan: { type: DataTypes.TEXT, allowNull: true },
    file_path: { type: DataTypes.STRING(255), allowNull: true },
    dibuat_oleh: { type: DataTypes.UUID, allowNull: true },
    semester_id: { type: DataTypes.UUID, allowNull: true },
  }, { sequelize, modelName: 'LaporanCp', tableName: 'laporan_cp', timestamps: true });
  return LaporanCp;
};
