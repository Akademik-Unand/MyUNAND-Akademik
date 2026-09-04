'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Matakuliah extends Model {
    static associate(models) {
      Matakuliah.belongsTo(models.JenisSemester, { foreignKey: 'jenis_semester_id', as: 'jenisSemester' });
      Matakuliah.belongsTo(models.TipeMatakuliah, { foreignKey: 'tipe_matakuliah_id', as: 'tipeMatakuliah' });
      Matakuliah.belongsTo(models.SifatMatakuliah, { foreignKey: 'sifat_matakuliah_id', as: 'sifatMatakuliah' });
      Matakuliah.hasMany(models.Cpmk, { foreignKey: 'matakuliah_id', as: 'cpmk' });
      Matakuliah.hasMany(models.Kelas, { foreignKey: 'matakuliah_id', as: 'kelas' });
      Matakuliah.belongsToMany(models.Kurikulum, {
        through: models.MatakuliahKurikulum,
        foreignKey: 'matakuliah_id',
        otherKey: 'kurikulum_id',
        as: 'kurikulum',
      });
      Matakuliah.hasMany(models.MatakuliahKurikulum, { foreignKey: 'matakuliah_id', as: 'matakuliahKurikulum' });
    }
  }
  Matakuliah.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    jenis_semester_id: { type: DataTypes.UUID, allowNull: false },
    tipe_matakuliah_id: { type: DataTypes.UUID, allowNull: true },
    sifat_matakuliah_id: { type: DataTypes.UUID, allowNull: true },
    kode_matakuliah: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    nama_resmi: { type: DataTypes.STRING(255), allowNull: true },
    semester_kurikulum: { type: DataTypes.TINYINT, defaultValue: 0 },
    jumlah_sks_kurikulum: { type: DataTypes.TINYINT, allowNull: true },
    jumlah_sks_teori: { type: DataTypes.TINYINT, defaultValue: 0 },
    jumlah_sks_praktikum: { type: DataTypes.TINYINT, defaultValue: 0 },
    jumlah_sks_praktikum_lapangan: { type: DataTypes.TINYINT, defaultValue: 0 },
    bobot_nilai_minimal_lulus: { type: DataTypes.FLOAT, defaultValue: 0 },
  }, { sequelize, modelName: 'Matakuliah', tableName: 'matakuliah', timestamps: true, paranoid: true });
  return Matakuliah;
};
