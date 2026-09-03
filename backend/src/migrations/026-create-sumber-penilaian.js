'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('sumber_penilaian', {
id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      cpmk_id: {
        type: DataTypes.UUID, allowNull: false,
        references: { model: 'cpmk', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      nama_sumber_penilaian: { type: DataTypes.STRING(255), allowNull: false },
      bobot: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    
  },
  async down(queryInterface) {
    await queryInterface.dropTable('sumber_penilaian');
  },
};
