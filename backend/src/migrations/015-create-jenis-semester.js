'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('jenis_semester', {
id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      nama: { type: DataTypes.STRING(50), allowNull: false, unique: true },
      alias: { type: DataTypes.STRING(10), allowNull: true },
      urut: { type: DataTypes.SMALLINT, allowNull: false, defaultValue: 0 },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    
  },
  async down(queryInterface) {
    await queryInterface.dropTable('jenis_semester');
  },
};
