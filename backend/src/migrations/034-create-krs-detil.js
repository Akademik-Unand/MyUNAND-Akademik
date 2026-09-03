'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('krs_detil', {
id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      krs_id: {
        type: DataTypes.UUID, allowNull: false,
        references: { model: 'krs', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      kelas_id: {
        type: DataTypes.UUID, allowNull: false,
        references: { model: 'kelas', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      approved: { type: DataTypes.ENUM('0', '1', '2'), defaultValue: '0' },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addIndex('krs_detil', ['krs_id', 'kelas_id'], { unique: true, name: 'uk_krs_detil' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('krs_detil');
  },
};
