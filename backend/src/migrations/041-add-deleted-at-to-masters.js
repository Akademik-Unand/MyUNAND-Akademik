'use strict';

const { MASTER_TABLES } = require('../constants/permissions');

module.exports = {
  async up(queryInterface, Sequelize) {
    for (const table of MASTER_TABLES) {
      await queryInterface.addColumn(table, 'deletedAt', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    for (const table of MASTER_TABLES) {
      await queryInterface.removeColumn(table, 'deletedAt');
    }
  },
};
