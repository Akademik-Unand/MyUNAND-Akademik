'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('semester_prodi', {
id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      program_studi_id: {
        type: DataTypes.UUID, allowNull: false,
        references: { model: 'program_studi', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      semester_id: {
        type: DataTypes.UUID, allowNull: true,
        references: { model: 'semester', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'SET NULL',
      },
      is_aktif: { type: DataTypes.BOOLEAN, defaultValue: false },
      tanggal_krs_mulai: { type: DataTypes.DATEONLY, allowNull: true },
      tanggal_krs_selesai: { type: DataTypes.DATEONLY, allowNull: true },
      tanggal_revisi_mulai: { type: DataTypes.DATEONLY, allowNull: true },
      tanggal_revisi_selesai: { type: DataTypes.DATEONLY, allowNull: true },
      sks_default: { type: DataTypes.SMALLINT, defaultValue: 15 },
      sks_maksimal: { type: DataTypes.SMALLINT, defaultValue: 24 },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addIndex('semester_prodi', ['semester_id', 'program_studi_id'], { unique: true, name: 'uk_semprodi' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('semester_prodi');
  },
};
