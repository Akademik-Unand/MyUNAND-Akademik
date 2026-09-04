'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addColumn('laporan_cp', 'semester_id', {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'semester', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('laporan_cp', 'semester_id');
  },
};
