'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('permissions', 'action', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });
    await queryInterface.addColumn('permissions', 'subject', {
      type: Sequelize.STRING(80),
      allowNull: true,
    });
    await queryInterface.addColumn('permissions', 'group', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });
    await queryInterface.addColumn('permissions', 'description', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('permissions', 'description');
    await queryInterface.removeColumn('permissions', 'group');
    await queryInterface.removeColumn('permissions', 'subject');
    await queryInterface.removeColumn('permissions', 'action');
  },
};
