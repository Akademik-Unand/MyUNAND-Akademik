"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class KrsDetil extends Model {
    static associate(models) {
      KrsDetil.belongsTo(models.Krs, { foreignKey: "krs_id", as: "krs" });
      KrsDetil.belongsTo(models.Kelas, { foreignKey: "kelas_id", as: "kelas" });
      KrsDetil.belongsTo(models.User, {
        foreignKey: "pa_approved_by",
        as: "paApprover",
      });
      KrsDetil.belongsTo(models.User, {
        foreignKey: "rejected_by",
        as: "rejector",
      });
      KrsDetil.hasMany(models.NilaiMahasiswa, {
        foreignKey: "krs_detil_id",
        as: "nilaiMahasiswa",
      });
    }
  }
  KrsDetil.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      krs_id: { type: DataTypes.UUID, allowNull: false },
      kelas_id: { type: DataTypes.UUID, allowNull: false },
      approved: { type: DataTypes.ENUM("0", "1", "2"), defaultValue: "0" },
      is_cross_enrollment: { type: DataTypes.BOOLEAN, defaultValue: false },
      cross_enrollment_status: {
        type: DataTypes.ENUM("pending_pa", "approved", "rejected"),
        allowNull: true,
      },
      pa_approved_by: DataTypes.UUID,
      pa_approved_at: DataTypes.DATE,
      rejected_by: DataTypes.UUID,
      rejected_at: DataTypes.DATE,
      rejection_reason: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "KrsDetil",
      tableName: "krs_detil",
      timestamps: true,
    },
  );
  return KrsDetil;
};
