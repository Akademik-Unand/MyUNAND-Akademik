'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class JenisDokumenEvaluasi extends Model {
    static associate(models) {
      JenisDokumenEvaluasi.hasMany(models.DokumenEvaluasi, {
        foreignKey: 'jenis_dokumen_evaluasi_id',
        as: 'dokumenEvaluasi',
      });
    }
  }
  JenisDokumenEvaluasi.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nama: { type: DataTypes.STRING(255), allowNull: false },
    tipe: { type: DataTypes.STRING(50), allowNull: true },
    keterangan: { type: DataTypes.TEXT, allowNull: true },
  }, {
    sequelize,
    modelName: 'JenisDokumenEvaluasi',
    tableName: 'jenis_dokumen_evaluasi',
    timestamps: true,
    paranoid: true,
  });
  return JenisDokumenEvaluasi;
};
