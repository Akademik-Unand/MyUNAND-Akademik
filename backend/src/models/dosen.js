'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Dosen extends Model {
    static associate(models) {
      Dosen.belongsTo(models.ProgramStudi, { foreignKey: 'program_studi_id', as: 'programStudi' });
      Dosen.hasMany(models.DosenKelas, { foreignKey: 'dosen_id', as: 'dosenKelas' });
      Dosen.hasOne(models.User, { foreignKey: 'dosen_id', as: 'user' });
    }
  }
  Dosen.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nip: { type: DataTypes.STRING(18), allowNull: false, unique: true },
    program_studi_id: { type: DataTypes.UUID, allowNull: true },
    nama: { type: DataTypes.STRING(255), allowNull: true },
    nidn: { type: DataTypes.STRING(10), allowNull: true },
    nip_lama: { type: DataTypes.STRING(20), allowNull: true },
    nip_baru: { type: DataTypes.STRING(20), allowNull: true },
  }, { sequelize, modelName: 'Dosen', tableName: 'dosen', timestamps: true });
  return Dosen;
};
