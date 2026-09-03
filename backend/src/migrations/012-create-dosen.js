'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('dosen', {
id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      nip: { type: DataTypes.STRING(18), allowNull: false, unique: true },
      program_studi_id: {
        type: DataTypes.UUID, allowNull: true,
        references: { model: 'program_studi', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'SET NULL',
      },
      nama: { type: DataTypes.STRING(255), allowNull: true },
      nidn: { type: DataTypes.STRING(10), allowNull: true },
      nip_lama: { type: DataTypes.STRING(20), allowNull: true },
      nip_baru: { type: DataTypes.STRING(20), allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    
  },
  async down(queryInterface) {
    await queryInterface.dropTable('dosen');
  },
};
