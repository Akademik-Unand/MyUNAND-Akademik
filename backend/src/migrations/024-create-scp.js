'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('scp', {
id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      cp_id: {
        type: DataTypes.UUID, allowNull: false,
        references: { model: 'cp', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      nama_scp: { type: DataTypes.STRING(255), allowNull: false },
      deskripsi: { type: DataTypes.TEXT, allowNull: true },
      persen_capai_nilai_min: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
      nilai_min: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    
  },
  async down(queryInterface) {
    await queryInterface.dropTable('scp');
  },
};
