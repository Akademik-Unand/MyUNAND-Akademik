'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class EvaluasiCpmk extends Model {
    static associate(models) {
      EvaluasiCpmk.belongsTo(models.Kelas, { foreignKey: 'kelas_id', as: 'kelas' });
      EvaluasiCpmk.belongsTo(models.Cpmk, { foreignKey: 'cpmk_id', as: 'cpmk' });
    }
  }
  EvaluasiCpmk.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    kelas_id: { type: DataTypes.UUID, allowNull: false },
    cpmk_id: { type: DataTypes.UUID, allowNull: false },
    target_nilai_min: { type: DataTypes.FLOAT, defaultValue: 0 },
    target_persen_lulus: { type: DataTypes.FLOAT, defaultValue: 0 },
    capaian_persen: { type: DataTypes.FLOAT, defaultValue: 0 },
    rata_rata: { type: DataTypes.FLOAT, defaultValue: 0 },
    jumlah_lulus: { type: DataTypes.INTEGER, defaultValue: 0 },
    analisis: { type: DataTypes.TEXT, allowNull: true },
    tindak_lanjut: { type: DataTypes.TEXT, allowNull: true },
  }, { sequelize, modelName: 'EvaluasiCpmk', tableName: 'evaluasi_cpmk', timestamps: true });
  return EvaluasiCpmk;
};
