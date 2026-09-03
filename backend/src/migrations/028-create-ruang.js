'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('ruang', {
id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      kode: { type: DataTypes.STRING(50), allowNull: false },
      nama: { type: DataTypes.STRING(255), allowNull: false },
      kapasitas: { type: DataTypes.INTEGER, defaultValue: 0 },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    
  },
  async down(queryInterface) {
    await queryInterface.dropTable('ruang');
  },
};
