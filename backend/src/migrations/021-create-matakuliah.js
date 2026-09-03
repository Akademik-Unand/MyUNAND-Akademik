'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('matakuliah', {
id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      jenis_semester_id: {
        type: DataTypes.UUID, allowNull: false,
        references: { model: 'jenis_semester', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      tipe_matakuliah_id: {
        type: DataTypes.UUID, allowNull: true,
        references: { model: 'tipe_matakuliah', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'SET NULL',
      },
      sifat_matakuliah_id: {
        type: DataTypes.UUID, allowNull: true,
        references: { model: 'sifat_matakuliah', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'SET NULL',
      },
      kode_matakuliah: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      nama_resmi: { type: DataTypes.STRING(255), allowNull: true },
      semester_kurikulum: { type: DataTypes.TINYINT, defaultValue: 0 },
      jumlah_sks_kurikulum: { type: DataTypes.TINYINT, allowNull: true },
      jumlah_sks_teori: { type: DataTypes.TINYINT, defaultValue: 0 },
      jumlah_sks_praktikum: { type: DataTypes.TINYINT, defaultValue: 0 },
      jumlah_sks_praktikum_lapangan: { type: DataTypes.TINYINT, defaultValue: 0 },
      bobot_nilai_minimal_lulus: { type: DataTypes.FLOAT, defaultValue: 0 },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    
  },
  async down(queryInterface) {
    await queryInterface.dropTable('matakuliah');
  },
};
