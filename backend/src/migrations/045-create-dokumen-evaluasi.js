'use strict';

const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('dokumen_evaluasi', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      nama: { type: DataTypes.STRING(255), allowNull: false },
      jenis_dokumen_evaluasi_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'jenis_dokumen_evaluasi', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      kelas_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'kelas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      matakuliah_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'matakuliah', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      semester_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'semester', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      file_path: { type: DataTypes.STRING(255), allowNull: true },
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      keterangan: { type: DataTypes.TEXT, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('dokumen_evaluasi');
  },
};
