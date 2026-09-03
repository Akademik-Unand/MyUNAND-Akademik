'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class JadwalKelas extends Model {
    static associate(models) {
      JadwalKelas.belongsTo(models.Kelas, { foreignKey: 'kelas_id', as: 'kelas' });
      JadwalKelas.belongsTo(models.Ruang, { foreignKey: 'ruang_id', as: 'ruang' });
      JadwalKelas.hasMany(models.DosenJadwal, { foreignKey: 'jadwal_kelas_id', as: 'dosenJadwal' });
    }
  }
  JadwalKelas.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    kelas_id: { type: DataTypes.UUID, allowNull: false },
    ruang_id: { type: DataTypes.UUID, allowNull: true },
    hari: { type: DataTypes.ENUM('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'), allowNull: false },
    jam_mulai: { type: DataTypes.TIME, allowNull: true },
    jam_selesai: { type: DataTypes.TIME, allowNull: true },
  }, { sequelize, modelName: 'JadwalKelas', tableName: 'jadwal_kelas', timestamps: true });
  return JadwalKelas;
};
