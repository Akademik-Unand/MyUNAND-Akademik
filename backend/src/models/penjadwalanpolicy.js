"use strict";
const { Model, DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  class PenjadwalanPolicy extends Model {}
  PenjadwalanPolicy.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      semester_id: DataTypes.UUID,
      fakultas_id: DataTypes.UUID,
      config: DataTypes.JSON,
      deletedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "PenjadwalanPolicy",
      tableName: "penjadwalan_policy",
      timestamps: true,
      paranoid: true,
    },
  );
  return PenjadwalanPolicy;
};
