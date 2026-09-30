"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Shift extends Model {
    static associate(models) {
      // no associations needed for now
    }
  }
  Shift.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      sistem_sks: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "2 SKS",
      },
      kode: { type: DataTypes.STRING(50), allowNull: false },
      jam_mulai: { type: DataTypes.TIME, allowNull: false },
      jam_selesai: { type: DataTypes.TIME, allowNull: false },
    },
    {
      sequelize,
      modelName: "Shift",
      tableName: "shift",
      timestamps: true,
      paranoid: true,
    },
  );
  return Shift;
};
