'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class JenisSemester extends Model {
    static associate(models) {
      JenisSemester.hasMany(models.Semester, { foreignKey: 'jenis_semester_id', as: 'semester' });
      JenisSemester.hasMany(models.Matakuliah, { foreignKey: 'jenis_semester_id', as: 'matakuliah' });
    }
  }
  JenisSemester.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nama: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    alias: { type: DataTypes.STRING(10), allowNull: true },
    urut: { type: DataTypes.SMALLINT, allowNull: false, defaultValue: 0 },
  }, { sequelize, modelName: 'JenisSemester', tableName: 'jenis_semester', timestamps: true });
  return JenisSemester;
};
