'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Cpmk extends Model {
    static associate(models) {
      Cpmk.belongsTo(models.Matakuliah, { foreignKey: 'matakuliah_id', as: 'matakuliah' });
      Cpmk.hasMany(models.SumberPenilaian, { foreignKey: 'cpmk_id', as: 'sumberPenilaian' });
      Cpmk.belongsToMany(models.Scp, {
        through: models.CpmkScp,
        foreignKey: 'cpmk_id',
        otherKey: 'scp_id',
        as: 'scp',
      });
      Cpmk.hasMany(models.CpmkScp, { foreignKey: 'cpmk_id', as: 'cpmkScp' });
    }
  }
  Cpmk.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    matakuliah_id: { type: DataTypes.UUID, allowNull: false },
    nama_cpmk: { type: DataTypes.STRING(255), allowNull: false },
    deskripsi: { type: DataTypes.TEXT, allowNull: true },
  }, { sequelize, modelName: 'Cpmk', tableName: 'cpmk', timestamps: true });
  return Cpmk;
};
