'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('program_studi', {
id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      kode_prodi: { type: DataTypes.STRING(15), allowNull: false, unique: true },
      jenjang_akademik_id: {
        type: DataTypes.UUID, allowNull: true,
        references: { model: 'jenjang_akademik', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'SET NULL',
      },
      model_kurikulum_id: {
        type: DataTypes.UUID, allowNull: true,
        references: { model: 'model_kurikulum', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'SET NULL',
      },
      universitas_id: {
        type: DataTypes.UUID, allowNull: true,
        references: { model: 'universitas', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'SET NULL',
      },
      fakultas_id: {
        type: DataTypes.UUID, allowNull: false,
        references: { model: 'fakultas', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      departemen_id: {
        type: DataTypes.UUID, allowNull: true,
        references: { model: 'departemen', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'SET NULL',
      },
      nama_resmi: { type: DataTypes.STRING(255), allowNull: false },
      nama_singkat: { type: DataTypes.STRING(255), allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addIndex('program_studi', ['kode_prodi', 'jenjang_akademik_id', 'model_kurikulum_id'], { unique: true, name: 'uk_prodi_jenjang_model' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('program_studi');
  },
};
