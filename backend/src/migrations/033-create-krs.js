'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('krs', {
id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      mahasiswa_id: {
        type: DataTypes.UUID, allowNull: false,
        references: { model: 'mahasiswa', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      semester_prodi_id: {
        type: DataTypes.UUID, allowNull: false,
        references: { model: 'semester_prodi', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      jam_mulai: { type: DataTypes.DATE, allowNull: true },
      jam_selesai: { type: DataTypes.DATE, allowNull: true },
      approval_ke: { type: DataTypes.TINYINT, defaultValue: 0 },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addIndex('krs', ['semester_prodi_id', 'mahasiswa_id'], { unique: true, name: 'uk_krs' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('krs');
  },
};
