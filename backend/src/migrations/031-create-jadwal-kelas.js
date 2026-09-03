'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('jadwal_kelas', {
id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      kelas_id: {
        type: DataTypes.UUID, allowNull: false,
        references: { model: 'kelas', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      ruang_id: {
        type: DataTypes.UUID, allowNull: true,
        references: { model: 'ruang', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'SET NULL',
      },
      hari: { type: DataTypes.ENUM('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'), allowNull: false },
      jam_mulai: { type: DataTypes.TIME, allowNull: true },
      jam_selesai: { type: DataTypes.TIME, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    
  },
  async down(queryInterface) {
    await queryInterface.dropTable('jadwal_kelas');
  },
};
