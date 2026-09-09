'use strict';
const { DataTypes } = require('sequelize');
module.exports = {
  async up(queryInterface) {
    await queryInterface.addColumn('ruang', 'gedung_id', { type: DataTypes.UUID, allowNull: true, references: { model: 'gedung', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' });
  },
  async down(queryInterface) { await queryInterface.removeColumn('ruang', 'gedung_id'); },
};
