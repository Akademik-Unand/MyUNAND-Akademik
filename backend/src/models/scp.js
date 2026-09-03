'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Scp extends Model {
    static associate(models) {
      Scp.belongsTo(models.Cp, { foreignKey: 'cp_id', as: 'cp' });
      Scp.belongsToMany(models.Cpmk, {
        through: models.CpmkScp,
        foreignKey: 'scp_id',
        otherKey: 'cpmk_id',
        as: 'cpmk',
      });
      Scp.hasMany(models.CpmkScp, { foreignKey: 'scp_id', as: 'cpmkScp' });
    }
  }
  Scp.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    cp_id: { type: DataTypes.UUID, allowNull: false },
    nama_scp: { type: DataTypes.STRING(255), allowNull: false },
    deskripsi: { type: DataTypes.TEXT, allowNull: true },
    persen_capai_nilai_min: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    nilai_min: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  }, { sequelize, modelName: 'Scp', tableName: 'scp', timestamps: true });
  return Scp;
};
