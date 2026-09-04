'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class JenjangAkademik extends Model {
    static associate(models) {
      JenjangAkademik.hasMany(models.ProgramStudi, { foreignKey: 'jenjang_akademik_id', as: 'programStudi' });
    }
  }
  JenjangAkademik.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    kode_jenjang: { type: DataTypes.STRING(10), allowNull: false, unique: true },
    nama_jenjang: { type: DataTypes.STRING(255), allowNull: true },
  }, { sequelize, modelName: 'JenjangAkademik', tableName: 'jenjang_akademik', timestamps: true, paranoid: true });
  return JenjangAkademik;
};
