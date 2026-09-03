'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class DosenKelas extends Model {
    static associate(models) {
      DosenKelas.belongsTo(models.Dosen, { foreignKey: 'dosen_id', as: 'dosen' });
      DosenKelas.belongsTo(models.Kelas, { foreignKey: 'kelas_id', as: 'kelas' });
      DosenKelas.hasMany(models.DosenJadwal, { foreignKey: 'dosen_kelas_id', as: 'dosenJadwal' });
    }
  }
  DosenKelas.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    dosen_id: { type: DataTypes.UUID, allowNull: false },
    kelas_id: { type: DataTypes.UUID, allowNull: false },
    dosen_ke: { type: DataTypes.TINYINT, allowNull: true },
  }, { sequelize, modelName: 'DosenKelas', tableName: 'dosen_kelas', timestamps: true });
  return DosenKelas;
};
