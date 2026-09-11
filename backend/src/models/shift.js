"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Shift extends Model {
    static associate(models) {
      Shift.belongsTo(models.Fakultas, {
        foreignKey: "fakultas_id",
        as: "fakultas",
      });
    }
  }
  Shift.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      fakultas_id: { type: DataTypes.UUID, allowNull: false },
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
