"use strict";
const { Model, DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  class PenawaranMatakuliah extends Model {
    static associate(models) {
      this.belongsTo(models.Semester, {
        foreignKey: "semester_id",
        as: "semester",
      });
      this.belongsTo(models.ProgramStudi, {
        foreignKey: "program_studi_id",
        as: "programStudi",
      });
      this.hasMany(models.PenawaranMatakuliahDetil, {
        foreignKey: "penawaran_matakuliah_id",
        as: "matakuliahDitawarkan",
      });
      this.hasMany(models.PenawaranMatakuliahProdi, {
        foreignKey: "penawaran_matakuliah_id",
        as: "prodiTujuan",
      });
    }
  }
  PenawaranMatakuliah.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      semester_id: { type: DataTypes.UUID, allowNull: false },
      program_studi_id: { type: DataTypes.UUID, allowNull: false },
      status: {
        type: DataTypes.ENUM("draft", "published", "closed"),
        defaultValue: "draft",
      },
      akses: {
        type: DataTypes.ENUM("semua", "terpilih"),
        defaultValue: "semua",
      },
      tanggal_mulai: DataTypes.DATE,
      tanggal_selesai: DataTypes.DATE,
      kuota_lintas_prodi_default: { type: DataTypes.INTEGER, defaultValue: 0 },
      minimal_semester_default: DataTypes.TINYINT,
      maksimal_semester_default: DataTypes.TINYINT,
      published_at: DataTypes.DATE,
      closed_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "PenawaranMatakuliah",
      tableName: "penawaran_matakuliah",
      timestamps: true,
      paranoid: true,
    },
  );
  return PenawaranMatakuliah;
};
