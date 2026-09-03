'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class MatakuliahKurikulum extends Model {
    static associate(models) {
      MatakuliahKurikulum.belongsTo(models.Kurikulum, { foreignKey: 'kurikulum_id', as: 'kurikulum' });
      MatakuliahKurikulum.belongsTo(models.Matakuliah, { foreignKey: 'matakuliah_id', as: 'matakuliah' });
    }
  }
  MatakuliahKurikulum.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    kurikulum_id: { type: DataTypes.UUID, allowNull: false },
    matakuliah_id: { type: DataTypes.UUID, allowNull: false },
    status: { type: DataTypes.STRING(10), allowNull: true },
  }, { sequelize, modelName: 'MatakuliahKurikulum', tableName: 'matakuliah_kurikulum', timestamps: true });
  return MatakuliahKurikulum;
};
