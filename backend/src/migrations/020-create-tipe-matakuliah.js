'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('tipe_matakuliah', {
id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      kode_tipe_matakuliah: { type: DataTypes.STRING(10), allowNull: false },
      nama: { type: DataTypes.STRING(255), allowNull: false },
      is_dipakai: { type: DataTypes.TINYINT, defaultValue: 1 },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    
  },
  async down(queryInterface) {
    await queryInterface.dropTable('tipe_matakuliah');
  },
};
