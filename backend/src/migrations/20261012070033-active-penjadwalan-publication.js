"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "semester",
      "active_penjadwalan_publication_id",
      { type: Sequelize.UUID, allowNull: true },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      "semester",
      "active_penjadwalan_publication_id",
    );
  },
};
