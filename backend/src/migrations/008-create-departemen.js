'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('departemen', {
id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      kode_departemen: { type: DataTypes.STRING(15), allowNull: false, unique: true },
      universitas_id: {
        type: DataTypes.UUID, allowNull: true,
        references: { model: 'universitas', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'SET NULL',
      },
      fakultas_id: {
        type: DataTypes.UUID, allowNull: false,
        references: { model: 'fakultas', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      nama_resmi: { type: DataTypes.STRING(255), allowNull: false },
      nama_singkat: { type: DataTypes.STRING(255), allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    
  },
  async down(queryInterface) {
    await queryInterface.dropTable('departemen');
  },
};
