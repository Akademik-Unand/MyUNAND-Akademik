'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addColumn('cpmk', 'parent_cpmk_id', {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'cpmk', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
    await queryInterface.addIndex('cpmk', ['parent_cpmk_id'], { name: 'idx_cpmk_parent' });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('cpmk', 'idx_cpmk_parent');
    await queryInterface.removeColumn('cpmk', 'parent_cpmk_id');
  },
};
