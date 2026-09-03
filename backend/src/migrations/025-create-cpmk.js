'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('cpmk', {
id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      matakuliah_id: {
        type: DataTypes.UUID, allowNull: false,
        references: { model: 'matakuliah', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      nama_cpmk: { type: DataTypes.STRING(255), allowNull: false },
      deskripsi: { type: DataTypes.TEXT, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    
  },
  async down(queryInterface) {
    await queryInterface.dropTable('cpmk');
  },
};
