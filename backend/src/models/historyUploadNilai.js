'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class HistoryUploadNilai extends Model {
    static associate(models) {
      HistoryUploadNilai.belongsTo(models.Kelas, { foreignKey: 'kelas_id', as: 'kelas' });
      HistoryUploadNilai.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }
  HistoryUploadNilai.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    kelas_id: { type: DataTypes.UUID, allowNull: false },
    user_id: { type: DataTypes.UUID, allowNull: true },
    tipe: { type: DataTypes.STRING(50), allowNull: true },
    file_name: { type: DataTypes.STRING(255), allowNull: false },
    keterangan: { type: DataTypes.TEXT, allowNull: true },
  }, { sequelize, modelName: 'HistoryUploadNilai', tableName: 'history_upload_nilai', timestamps: true });
  return HistoryUploadNilai;
};
