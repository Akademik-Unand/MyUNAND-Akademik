'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('cpmk_scp', {
id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      scp_id: {
        type: DataTypes.UUID, allowNull: false,
        references: { model: 'scp', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      cpmk_id: {
        type: DataTypes.UUID, allowNull: false,
        references: { model: 'cpmk', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addIndex('cpmk_scp', ['scp_id', 'cpmk_id'], { unique: true, name: 'uk_cpmk_scp' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('cpmk_scp');
  },
};
