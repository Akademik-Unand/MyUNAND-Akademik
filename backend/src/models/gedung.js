'use strict';
const { Model, DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  class Gedung extends Model { static associate(models) { Gedung.hasMany(models.Ruang, { foreignKey: 'gedung_id', as: 'ruang' }); } }
  Gedung.init({ id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }, kode: { type: DataTypes.STRING(50), allowNull: false, unique: true }, nama: { type: DataTypes.STRING(255), allowNull: false }, alamat: DataTypes.TEXT }, { sequelize, modelName: 'Gedung', tableName: 'gedung', timestamps: true, paranoid: true });
  return Gedung;
};
