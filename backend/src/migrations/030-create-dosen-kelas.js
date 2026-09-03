'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('dosen_kelas', {
id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      dosen_id: {
        type: DataTypes.UUID, allowNull: false,
        references: { model: 'dosen', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      kelas_id: {
        type: DataTypes.UUID, allowNull: false,
        references: { model: 'kelas', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      dosen_ke: { type: DataTypes.TINYINT, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addIndex('dosen_kelas', ['kelas_id', 'dosen_id'], { unique: true, name: 'uk_dosen_kelas' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('dosen_kelas');
  },
};
