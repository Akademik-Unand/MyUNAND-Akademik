'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Semester extends Model {
    static associate(models) {
      Semester.belongsTo(models.JenisSemester, { foreignKey: 'jenis_semester_id', as: 'jenisSemester' });
      Semester.hasMany(models.SemesterProdi, { foreignKey: 'semester_id', as: 'semesterProdi' });
    }
  }
  Semester.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    jenis_semester_id: { type: DataTypes.UUID, allowNull: false },
    tahun: { type: DataTypes.SMALLINT, allowNull: false },
    tanggal_mulai: { type: DataTypes.DATEONLY, allowNull: true },
    tanggal_selesai: { type: DataTypes.DATEONLY, allowNull: true },
  }, { sequelize, modelName: 'Semester', tableName: 'semester', timestamps: true, paranoid: true });
  return Semester;
};
