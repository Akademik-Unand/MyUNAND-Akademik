'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const attrs = await queryInterface.describeTable('user_units');
    if (!attrs.deletedAt) {
      await queryInterface.addColumn('user_units', 'deletedAt', {
        type: DataTypes.DATE,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const attrs = await queryInterface.describeTable('user_units');
    if (attrs.deletedAt) {
      await queryInterface.removeColumn('user_units', 'deletedAt');
    }
  },
};