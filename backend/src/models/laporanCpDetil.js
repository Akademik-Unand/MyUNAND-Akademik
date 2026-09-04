'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class LaporanCpDetil extends Model {
    static associate(models) {
      LaporanCpDetil.belongsTo(models.LaporanCp, { foreignKey: 'laporan_cp_id', as: 'laporan' });
      LaporanCpDetil.belongsTo(models.Cpmk, { foreignKey: 'cpmk_id', as: 'cpmk' });
      LaporanCpDetil.belongsTo(models.Matakuliah, { foreignKey: 'matakuliah_id', as: 'matakuliah' });
      LaporanCpDetil.belongsTo(models.Semester, { foreignKey: 'semester_id', as: 'semester' });
    }
  }
  LaporanCpDetil.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    laporan_cp_id: { type: DataTypes.UUID, allowNull: false },
    cpmk_id: { type: DataTypes.UUID, allowNull: false },
    matakuliah_id: { type: DataTypes.UUID, allowNull: false },
    semester_id: { type: DataTypes.UUID, allowNull: true },
  }, { sequelize, modelName: 'LaporanCpDetil', tableName: 'laporan_cp_detil', timestamps: true });
  return LaporanCpDetil;
};
