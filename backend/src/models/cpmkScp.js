'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class CpmkScp extends Model {
    static associate(models) {
      CpmkScp.belongsTo(models.Scp, { foreignKey: 'scp_id', as: 'scp' });
      CpmkScp.belongsTo(models.Cpmk, { foreignKey: 'cpmk_id', as: 'cpmk' });
    }
  }
  CpmkScp.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    scp_id: { type: DataTypes.UUID, allowNull: false },
    cpmk_id: { type: DataTypes.UUID, allowNull: false },
  }, { sequelize, modelName: 'CpmkScp', tableName: 'cpmk_scp', timestamps: true });
  return CpmkScp;
};
