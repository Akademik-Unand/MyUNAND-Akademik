'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Mahasiswa extends Model {
    static associate(models) {
      Mahasiswa.belongsTo(models.ProgramStudi, { foreignKey: 'program_studi_id', as: 'programStudi' });
      Mahasiswa.hasMany(models.Krs, { foreignKey: 'mahasiswa_id', as: 'krs' });
      Mahasiswa.hasOne(models.User, { foreignKey: 'mahasiswa_id', as: 'user' });
    }
  }
  Mahasiswa.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    niu: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    nama: { type: DataTypes.STRING(255), allowNull: false },
    angkatan: { type: DataTypes.SMALLINT, defaultValue: 0 },
    program_studi_id: { type: DataTypes.UUID, allowNull: true },
    jenis_kelamin: { type: DataTypes.ENUM('L', 'P'), allowNull: true },
  }, { sequelize, modelName: 'Mahasiswa', tableName: 'mahasiswa', timestamps: true, paranoid: true });
  return Mahasiswa;
};
