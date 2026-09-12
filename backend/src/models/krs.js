"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Krs extends Model {
    static associate(models) {
      Krs.belongsTo(models.Mahasiswa, {
        foreignKey: "mahasiswa_id",
        as: "mahasiswa",
      });
      Krs.belongsTo(models.Semester, {
        foreignKey: "semester_id",
        as: "semester",
      });
      Krs.hasMany(models.KrsDetil, { foreignKey: "krs_id", as: "krsDetil" });
    }
  }
  Krs.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      mahasiswa_id: { type: DataTypes.UUID, allowNull: false },
      semester_id: { type: DataTypes.UUID, allowNull: false },
      jam_mulai: { type: DataTypes.DATE, allowNull: true },
      jam_selesai: { type: DataTypes.DATE, allowNull: true },
      approval_ke: { type: DataTypes.TINYINT, defaultValue: 0 },
    },
    { sequelize, modelName: "Krs", tableName: "krs", timestamps: true },
  );
  return Krs;
};
