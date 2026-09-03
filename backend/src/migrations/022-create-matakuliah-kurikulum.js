'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('matakuliah_kurikulum', {
id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      kurikulum_id: {
        type: DataTypes.UUID, allowNull: false,
        references: { model: 'kurikulum', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      matakuliah_id: {
        type: DataTypes.UUID, allowNull: false,
        references: { model: 'matakuliah', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      status: { type: DataTypes.STRING(10), allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addIndex('matakuliah_kurikulum', ['kurikulum_id', 'matakuliah_id'], { unique: true, name: 'uk_mk_kurikulum' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('matakuliah_kurikulum');
  },
};
