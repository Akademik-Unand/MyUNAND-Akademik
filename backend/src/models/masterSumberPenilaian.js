"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class MasterSumberPenilaian extends Model {
    static associate(models) {
      if (models.Fakultas) {
        MasterSumberPenilaian.belongsTo(models.Fakultas, {
          foreignKey: "fakultas_id",
          as: "fakultas",
        });
      }
    }
  }
  MasterSumberPenilaian.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      kode: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      nama: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      kategori: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: "Kognitif / Formatif",
      },
      bobot_default: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0,
      },
      fakultas_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      deskripsi: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      urutan: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_aktif: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "MasterSumberPenilaian",
      tableName: "master_sumber_penilaian",
      timestamps: true,
      paranoid: true,
    },
  );
  return MasterSumberPenilaian;
};
