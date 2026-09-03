'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('mahasiswa', {
id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      niu: { type: DataTypes.STRING(20), allowNull: false, unique: true },
      nama: { type: DataTypes.STRING(255), allowNull: false },
      angkatan: { type: DataTypes.SMALLINT, defaultValue: 0 },
      program_studi_id: {
        type: DataTypes.UUID, allowNull: true,
        references: { model: 'program_studi', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'SET NULL',
      },
      jenis_kelamin: { type: DataTypes.ENUM('L', 'P'), allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    
  },
  async down(queryInterface) {
    await queryInterface.dropTable('mahasiswa');
  },
};
