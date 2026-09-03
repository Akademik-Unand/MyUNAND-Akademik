'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('nilai_mahasiswa', {
id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      krs_detil_id: {
        type: DataTypes.UUID, allowNull: false,
        references: { model: 'krs_detil', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      sumber_penilaian_id: {
        type: DataTypes.UUID, allowNull: false,
        references: { model: 'sumber_penilaian', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      nilai: { type: DataTypes.FLOAT, allowNull: true },
      catatan: { type: DataTypes.TEXT, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addIndex('nilai_mahasiswa', ['krs_detil_id', 'sumber_penilaian_id'], { unique: true, name: 'uk_nilai_mahasiswa' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('nilai_mahasiswa');
  },
};
