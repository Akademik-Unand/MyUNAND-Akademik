'use strict';
const { Model, DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  class PenawaranMatakuliahProdi extends Model { static associate(models) { this.belongsTo(models.PenawaranMatakuliah, { foreignKey: 'penawaran_matakuliah_id', as: 'penawaran' }); this.belongsTo(models.ProgramStudi, { foreignKey: 'program_studi_id', as: 'programStudi' }); } }
  PenawaranMatakuliahProdi.init({ id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }, penawaran_matakuliah_id: { type: DataTypes.UUID, allowNull: false }, program_studi_id: { type: DataTypes.UUID, allowNull: false }, kuota: DataTypes.INTEGER }, { sequelize, modelName: 'PenawaranMatakuliahProdi', tableName: 'penawaran_matakuliah_prodi', timestamps: true });
  return PenawaranMatakuliahProdi;
};
