"use strict";
const { Model, DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  class PenjadwalanPublication extends Model {}
  PenjadwalanPublication.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      semester_id: DataTypes.UUID,
      scenario_id: DataTypes.UUID,
      revision: DataTypes.INTEGER,
      assignments: DataTypes.JSON,
      published_by: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: "PenjadwalanPublication",
      tableName: "penjadwalan_publication",
      timestamps: true,
      paranoid: false,
    },
  );
  return PenjadwalanPublication;
};
