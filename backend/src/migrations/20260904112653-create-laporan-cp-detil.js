'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('laporan_cp_detil', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      laporan_cp_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'laporan_cp', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      cpmk_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'cpmk', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      matakuliah_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'matakuliah', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      semester_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'semester', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addIndex('laporan_cp_detil', ['laporan_cp_id'], { name: 'idx_laporan_cp_detil_laporan' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('laporan_cp_detil');
  },
};
