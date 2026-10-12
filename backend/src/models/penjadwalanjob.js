"use strict";
const { Model, DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  class PenjadwalanJob extends Model {}
  PenjadwalanJob.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      scenario_id: DataTypes.UUID,
      revision: DataTypes.INTEGER,
      status: DataTypes.STRING,
      payload: DataTypes.JSON,
      result: DataTypes.JSON,
      error: DataTypes.TEXT,
      claimed_at: DataTypes.DATE,
      finished_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "PenjadwalanJob",
      tableName: "penjadwalan_job",
      timestamps: true,
      paranoid: false,
    },
  );
  return PenjadwalanJob;
};
