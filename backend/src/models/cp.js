'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Cp extends Model {
    static associate(models) {
      Cp.belongsTo(models.Kurikulum, { foreignKey: 'kurikulum_id', as: 'kurikulum' });
      Cp.hasMany(models.Scp, { foreignKey: 'cp_id', as: 'scp' });
    }
  }
  Cp.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    kurikulum_id: { type: DataTypes.UUID, allowNull: false },
    nama_cp: { type: DataTypes.STRING(255), allowNull: false },
    deskripsi: { type: DataTypes.TEXT, allowNull: true },
    nilai_max: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 100 },
    nilai_min: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  }, { sequelize, modelName: 'Cp', tableName: 'cp', timestamps: true });
  return Cp;
};
