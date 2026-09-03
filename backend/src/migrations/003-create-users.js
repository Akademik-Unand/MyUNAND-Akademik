'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('users', {
id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      name: { type: DataTypes.STRING(255), allowNull: false },
      email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      email_verified_at: { type: DataTypes.DATE, allowNull: true },
      password: { type: DataTypes.STRING(255), allowNull: false },
      role: { type: DataTypes.ENUM('superadmin', 'admin', 'dosen', 'mahasiswa'), defaultValue: 'admin', allowNull: false },
      dosen_id: { type: DataTypes.UUID, allowNull: true },
      mahasiswa_id: { type: DataTypes.UUID, allowNull: true },
      remember_token: { type: DataTypes.STRING(100), allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    
  },
  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};
