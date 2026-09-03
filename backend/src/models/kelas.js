'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Kelas extends Model {
    static associate(models) {
      Kelas.belongsTo(models.SemesterProdi, { foreignKey: 'semester_prodi_id', as: 'semesterProdi' });
      Kelas.belongsTo(models.Matakuliah, { foreignKey: 'matakuliah_id', as: 'matakuliah' });
      Kelas.hasMany(models.DosenKelas, { foreignKey: 'kelas_id', as: 'dosenKelas' });
      Kelas.hasMany(models.JadwalKelas, { foreignKey: 'kelas_id', as: 'jadwalKelas' });
      Kelas.hasMany(models.KrsDetil, { foreignKey: 'kelas_id', as: 'krsDetil' });
    }
  }
  Kelas.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    semester_prodi_id: { type: DataTypes.UUID, allowNull: true },
    matakuliah_id: { type: DataTypes.UUID, allowNull: false },
    nama: { type: DataTypes.STRING(10), allowNull: false },
    jumlah_peserta_min: { type: DataTypes.SMALLINT, defaultValue: 0 },
    jumlah_peserta_max: { type: DataTypes.SMALLINT, defaultValue: 0 },
  }, { sequelize, modelName: 'Kelas', tableName: 'kelas', timestamps: true });
  return Kelas;
};
