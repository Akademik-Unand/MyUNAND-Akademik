"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Kelas extends Model {
    static associate(models) {
      Kelas.belongsTo(models.Semester, {
        foreignKey: "semester_id",
        as: "semester",
      });
      Kelas.belongsTo(models.ProgramStudi, {
        foreignKey: "program_studi_id",
        as: "programStudi",
      });
      Kelas.belongsTo(models.Matakuliah, {
        foreignKey: "matakuliah_id",
        as: "matakuliah",
      });
      Kelas.belongsTo(models.PenawaranMatakuliahDetil, {
        foreignKey: "penawaran_matakuliah_id",
        as: "penawaranMatakuliah",
      });
      Kelas.hasMany(models.DosenKelas, {
        foreignKey: "kelas_id",
        as: "dosenKelas",
      });
      Kelas.hasMany(models.JadwalKelas, {
        foreignKey: "kelas_id",
        as: "jadwalKelas",
      });
      Kelas.hasMany(models.KrsDetil, {
        foreignKey: "kelas_id",
        as: "krsDetil",
      });
    }
  }
  Kelas.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      semester_id: { type: DataTypes.UUID, allowNull: false },
      program_studi_id: { type: DataTypes.UUID, allowNull: false },
      matakuliah_id: { type: DataTypes.UUID, allowNull: false },
      penawaran_matakuliah_id: { type: DataTypes.UUID, allowNull: true },
      nama: { type: DataTypes.STRING(10), allowNull: false },
      jumlah_peserta_min: { type: DataTypes.SMALLINT, defaultValue: 0 },
      jumlah_peserta_max: { type: DataTypes.SMALLINT, defaultValue: 0 },
    },
    {
      sequelize,
      modelName: "Kelas",
      tableName: "kelas",
      timestamps: true,
      paranoid: true,
    },
  );
  return Kelas;
};
