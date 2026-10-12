"use strict";
const { Model, DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  class PenjadwalanVersion extends Model {}
  PenjadwalanVersion.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      scenario_id: DataTypes.UUID,
      revision: DataTypes.INTEGER,
      state: DataTypes.JSON,
      changed_by: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: "PenjadwalanVersion",
      tableName: "penjadwalan_version",
      timestamps: true,
    },
  );
  return PenjadwalanVersion;
};
