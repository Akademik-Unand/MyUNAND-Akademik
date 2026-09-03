'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('bimbingan_akademik', {
id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      dosen_id: {
        type: DataTypes.UUID, allowNull: false,
        references: { model: 'dosen', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      mahasiswa_id: {
        type: DataTypes.UUID, allowNull: false,
        references: { model: 'mahasiswa', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      tahun_akademik: { type: DataTypes.STRING(10), allowNull: true },
      status: { type: DataTypes.ENUM('aktif', 'selesai'), defaultValue: 'aktif' },
      catatan: { type: DataTypes.TEXT, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addIndex('bimbingan_akademik', ['dosen_id', 'mahasiswa_id'], { unique: true, name: 'uk_bimbingan' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('bimbingan_akademik');
  },
};
