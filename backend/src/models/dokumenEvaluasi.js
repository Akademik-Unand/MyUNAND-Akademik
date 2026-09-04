'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class DokumenEvaluasi extends Model {
    static associate(models) {
      DokumenEvaluasi.belongsTo(models.JenisDokumenEvaluasi, {
        foreignKey: 'jenis_dokumen_evaluasi_id',
        as: 'jenisDokumenEvaluasi',
      });
      DokumenEvaluasi.belongsTo(models.Kelas, { foreignKey: 'kelas_id', as: 'kelas' });
      DokumenEvaluasi.belongsTo(models.Matakuliah, { foreignKey: 'matakuliah_id', as: 'matakuliah' });
      DokumenEvaluasi.belongsTo(models.Semester, { foreignKey: 'semester_id', as: 'semester' });
      DokumenEvaluasi.belongsTo(models.User, { foreignKey: 'user_id', as: 'uploader' });
    }
  }
  DokumenEvaluasi.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nama: { type: DataTypes.STRING(255), allowNull: false },
    jenis_dokumen_evaluasi_id: { type: DataTypes.UUID, allowNull: true },
    kelas_id: { type: DataTypes.UUID, allowNull: true },
    matakuliah_id: { type: DataTypes.UUID, allowNull: true },
    semester_id: { type: DataTypes.UUID, allowNull: true },
    file_path: { type: DataTypes.STRING(255), allowNull: true },
    user_id: { type: DataTypes.UUID, allowNull: true },
    keterangan: { type: DataTypes.TEXT, allowNull: true },
  }, {
    sequelize,
    modelName: 'DokumenEvaluasi',
    tableName: 'dokumen_evaluasi',
    timestamps: true,
  });
  return DokumenEvaluasi;
};
