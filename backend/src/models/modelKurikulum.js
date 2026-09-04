'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class ModelKurikulum extends Model {
    static associate(models) {
      ModelKurikulum.hasMany(models.ProgramStudi, { foreignKey: 'model_kurikulum_id', as: 'programStudi' });
    }
  }
  ModelKurikulum.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nama_model: { type: DataTypes.STRING(255), allowNull: true },
  }, { sequelize, modelName: 'ModelKurikulum', tableName: 'model_kurikulum', timestamps: true, paranoid: true });
  return ModelKurikulum;
};
