'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('kurikulum', {
id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      program_studi_id: {
        type: DataTypes.UUID, allowNull: false,
        references: { model: 'program_studi', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      tahun: { type: DataTypes.SMALLINT, allowNull: true },
      nama: { type: DataTypes.STRING(255), allowNull: true },
      masa_studi_ideal: { type: DataTypes.TINYINT, defaultValue: 0 },
      masa_studi_maksimal: { type: DataTypes.TINYINT, defaultValue: 0 },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addIndex('kurikulum', ['program_studi_id', 'tahun', 'nama'], { unique: true, name: 'uk_kurikulum' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('kurikulum');
  },
};
