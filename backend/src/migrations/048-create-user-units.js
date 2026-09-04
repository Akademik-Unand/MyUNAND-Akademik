'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('user_units', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      fakultas_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'fakultas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      departemen_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'departemen', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      program_studi_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'program_studi', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addIndex('user_units', ['user_id'], { name: 'idx_user_units_user' });
    await queryInterface.addIndex('user_units', ['fakultas_id'], { name: 'idx_user_units_fakultas' });
    await queryInterface.addIndex('user_units', ['departemen_id'], { name: 'idx_user_units_departemen' });
    await queryInterface.addIndex('user_units', ['program_studi_id'], { name: 'idx_user_units_prodi' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_units');
  },
};