'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('kelas', {
id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      semester_prodi_id: {
        type: DataTypes.UUID, allowNull: true,
        references: { model: 'semester_prodi', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'SET NULL',
      },
      matakuliah_id: {
        type: DataTypes.UUID, allowNull: false,
        references: { model: 'matakuliah', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      nama: { type: DataTypes.STRING(10), allowNull: false },
      jumlah_peserta_min: { type: DataTypes.SMALLINT, defaultValue: 0 },
      jumlah_peserta_max: { type: DataTypes.SMALLINT, defaultValue: 0 },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addIndex('kelas', ['semester_prodi_id', 'matakuliah_id', 'nama'], { unique: true, name: 'uk_kelas' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('kelas');
  },
};
