'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Kurikulum extends Model {
    static associate(models) {
      Kurikulum.belongsTo(models.ProgramStudi, { foreignKey: 'program_studi_id', as: 'programStudi' });
      Kurikulum.hasMany(models.Cp, { foreignKey: 'kurikulum_id', as: 'cp' });
      Kurikulum.belongsToMany(models.Matakuliah, {
        through: models.MatakuliahKurikulum,
        foreignKey: 'kurikulum_id',
        otherKey: 'matakuliah_id',
        as: 'matakuliah',
      });
      Kurikulum.hasMany(models.MatakuliahKurikulum, { foreignKey: 'kurikulum_id', as: 'matakuliahKurikulum' });
    }
  }
  Kurikulum.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    program_studi_id: { type: DataTypes.UUID, allowNull: false },
    tahun: { type: DataTypes.SMALLINT, allowNull: true },
    nama: { type: DataTypes.STRING(255), allowNull: true },
    masa_studi_ideal: { type: DataTypes.TINYINT, defaultValue: 0 },
    masa_studi_maksimal: { type: DataTypes.TINYINT, defaultValue: 0 },
  }, { sequelize, modelName: 'Kurikulum', tableName: 'kurikulum', timestamps: true });
  return Kurikulum;
};
