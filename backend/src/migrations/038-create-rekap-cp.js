'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('rekap_cp', {
id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      mahasiswa_id: {
        type: DataTypes.UUID, allowNull: false,
        references: { model: 'mahasiswa', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      cp_id: {
        type: DataTypes.UUID, allowNull: false,
        references: { model: 'cp', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      semester_prodi_id: {
        type: DataTypes.UUID, allowNull: true,
        references: { model: 'semester_prodi', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'SET NULL',
      },
      nilai_capaian: { type: DataTypes.FLOAT, defaultValue: 0 },
      status_lulus: { type: DataTypes.BOOLEAN, defaultValue: false },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addIndex('rekap_cp', ['mahasiswa_id', 'cp_id', 'semester_prodi_id'], { unique: true, name: 'uk_rekap_cp' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('rekap_cp');
  },
};
