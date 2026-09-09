'use strict';
const { Model, DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  class PenawaranMatakuliahDetil extends Model { static associate(models) { this.belongsTo(models.PenawaranMatakuliah, { foreignKey: 'penawaran_matakuliah_id', as: 'penawaran' }); this.belongsTo(models.Matakuliah, { foreignKey: 'matakuliah_id', as: 'matakuliah' }); this.hasMany(models.Kelas, { foreignKey: 'penawaran_matakuliah_id', as: 'kelas' }); } }
  PenawaranMatakuliahDetil.init({ id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }, penawaran_matakuliah_id: { type: DataTypes.UUID, allowNull: false }, matakuliah_id: { type: DataTypes.UUID, allowNull: false }, kuota_lintas_prodi: DataTypes.INTEGER, minimal_semester: DataTypes.TINYINT, maksimal_semester: DataTypes.TINYINT }, { sequelize, modelName: 'PenawaranMatakuliahDetil', tableName: 'penawaran_matakuliah_detil', timestamps: true }); return PenawaranMatakuliahDetil;
};
