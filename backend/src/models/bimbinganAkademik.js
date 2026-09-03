'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class BimbinganAkademik extends Model {
    static associate(models) {
      BimbinganAkademik.belongsTo(models.Dosen, { foreignKey: 'dosen_id', as: 'dosen' });
      BimbinganAkademik.belongsTo(models.Mahasiswa, { foreignKey: 'mahasiswa_id', as: 'mahasiswa' });
    }
  }
  BimbinganAkademik.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    dosen_id: { type: DataTypes.UUID, allowNull: false },
    mahasiswa_id: { type: DataTypes.UUID, allowNull: false },
    tahun_akademik: { type: DataTypes.STRING(10), allowNull: true },
    status: { type: DataTypes.ENUM('aktif', 'selesai'), defaultValue: 'aktif' },
    catatan: { type: DataTypes.TEXT, allowNull: true },
  }, { sequelize, modelName: 'BimbinganAkademik', tableName: 'bimbingan_akademik', timestamps: true });
  return BimbinganAkademik;
};
