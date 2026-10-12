"use strict";
const { Model, DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  class PenjadwalanScenario extends Model {}
  PenjadwalanScenario.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      semester_id: DataTypes.UUID,
      fakultas_id: DataTypes.UUID,
      nama: DataTypes.STRING,
      revision: DataTypes.INTEGER,
      status: DataTypes.STRING,
      input: DataTypes.JSON,
      snapshot: DataTypes.JSON,
      source_hash: DataTypes.STRING,
      result: DataTypes.JSON,
      decisions: DataTypes.JSON,
      created_by: DataTypes.UUID,
      deletedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "PenjadwalanScenario",
      tableName: "penjadwalan_scenario",
      timestamps: true,
      paranoid: true,
    },
  );
  return PenjadwalanScenario;
};
