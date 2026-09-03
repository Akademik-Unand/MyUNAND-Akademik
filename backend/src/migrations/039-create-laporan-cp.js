'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('laporan_cp', {
id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      program_studi_id: {
        type: DataTypes.UUID, allowNull: false,
        references: { model: 'program_studi', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      kurikulum_id: {
        type: DataTypes.UUID, allowNull: true,
        references: { model: 'kurikulum', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'SET NULL',
      },
      nama_laporan: { type: DataTypes.STRING(255), allowNull: false },
      keterangan: { type: DataTypes.TEXT, allowNull: true },
      file_path: { type: DataTypes.STRING(255), allowNull: true },
      dibuat_oleh: {
        type: DataTypes.UUID, allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'SET NULL',
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    
  },
  async down(queryInterface) {
    await queryInterface.dropTable('laporan_cp');
  },
};
