'use strict';

const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('jenis_dokumen_evaluasi', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      nama: { type: DataTypes.STRING(255), allowNull: false },
      tipe: { type: DataTypes.STRING(50), allowNull: true },
      keterangan: { type: DataTypes.TEXT, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('jenis_dokumen_evaluasi');
  },
};
