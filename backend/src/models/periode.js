'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Periode extends Model {
    static associate(models) {
      Periode.belongsTo(models.Semester, { foreignKey: 'semester_id', as: 'semester' });
    }
  }
  Periode.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    semester_id: { type: DataTypes.UUID, allowNull: false },
    jenis: { type: DataTypes.STRING(20), allowNull: false },
    tanggal_mulai: { type: DataTypes.DATEONLY, allowNull: false },
    tanggal_selesai: { type: DataTypes.DATEONLY, allowNull: false },
  }, { sequelize, modelName: 'Periode', tableName: 'periode', timestamps: true, paranoid: true });
  return Periode;
};
