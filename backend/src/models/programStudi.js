'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class ProgramStudi extends Model {
    static associate(models) {
      ProgramStudi.belongsTo(models.JenjangAkademik, { foreignKey: 'jenjang_akademik_id', as: 'jenjangAkademik' });
      ProgramStudi.belongsTo(models.ModelKurikulum, { foreignKey: 'model_kurikulum_id', as: 'modelKurikulum' });
      ProgramStudi.belongsTo(models.Universitas, { foreignKey: 'universitas_id', as: 'universitas' });
      ProgramStudi.belongsTo(models.Fakultas, { foreignKey: 'fakultas_id', as: 'fakultas' });
      ProgramStudi.belongsTo(models.Departemen, { foreignKey: 'departemen_id', as: 'departemen' });
      ProgramStudi.hasMany(models.Dosen, { foreignKey: 'program_studi_id', as: 'dosen' });
      ProgramStudi.hasMany(models.Mahasiswa, { foreignKey: 'program_studi_id', as: 'mahasiswa' });
      ProgramStudi.hasMany(models.Kurikulum, { foreignKey: 'program_studi_id', as: 'kurikulum' });
      ProgramStudi.hasMany(models.SemesterProdi, { foreignKey: 'program_studi_id', as: 'semesterProdi' });
    }
  }
  ProgramStudi.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    kode_prodi: { type: DataTypes.STRING(15), allowNull: false, unique: true },
    jenjang_akademik_id: { type: DataTypes.UUID, allowNull: true },
    model_kurikulum_id: { type: DataTypes.UUID, allowNull: true },
    universitas_id: { type: DataTypes.UUID, allowNull: true },
    fakultas_id: { type: DataTypes.UUID, allowNull: false },
    departemen_id: { type: DataTypes.UUID, allowNull: true },
    nama_resmi: { type: DataTypes.STRING(255), allowNull: false },
    nama_singkat: { type: DataTypes.STRING(255), allowNull: true },
  }, { sequelize, modelName: 'ProgramStudi', tableName: 'program_studi', timestamps: true, paranoid: true });
  return ProgramStudi;
};
