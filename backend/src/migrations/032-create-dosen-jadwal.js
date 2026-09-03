'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('dosen_jadwal', {
id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      dosen_kelas_id: {
        type: DataTypes.UUID, allowNull: false,
        references: { model: 'dosen_kelas', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      jadwal_kelas_id: {
        type: DataTypes.UUID, allowNull: false,
        references: { model: 'jadwal_kelas', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    
  },
  async down(queryInterface) {
    await queryInterface.dropTable('dosen_jadwal');
  },
};
