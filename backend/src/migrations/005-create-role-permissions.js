'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('role_permissions', {
id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      role_id: {
        type: DataTypes.UUID, allowNull: false,
        references: { model: 'roles', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      permission_id: {
        type: DataTypes.UUID, allowNull: false,
        references: { model: 'permissions', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addIndex('role_permissions', ['role_id', 'permission_id'], { unique: true, name: 'uk_role_permission' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('role_permissions');
  },
};
