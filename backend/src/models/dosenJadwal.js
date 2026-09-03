'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class DosenJadwal extends Model {
    static associate(models) {
      DosenJadwal.belongsTo(models.DosenKelas, { foreignKey: 'dosen_kelas_id', as: 'dosenKelas' });
      DosenJadwal.belongsTo(models.JadwalKelas, { foreignKey: 'jadwal_kelas_id', as: 'jadwalKelas' });
    }
  }
  DosenJadwal.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    dosen_kelas_id: { type: DataTypes.UUID, allowNull: false },
    jadwal_kelas_id: { type: DataTypes.UUID, allowNull: false },
  }, { sequelize, modelName: 'DosenJadwal', tableName: 'dosen_jadwal', timestamps: true });
  return DosenJadwal;
};
