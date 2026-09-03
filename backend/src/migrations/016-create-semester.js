'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('semester', {
id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      jenis_semester_id: {
        type: DataTypes.UUID, allowNull: false,
        references: { model: 'jenis_semester', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      tahun: { type: DataTypes.SMALLINT, allowNull: false },
      tanggal_mulai: { type: DataTypes.DATEONLY, allowNull: true },
      tanggal_selesai: { type: DataTypes.DATEONLY, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addIndex('semester', ['tahun', 'jenis_semester_id'], { unique: true, name: 'uk_semester_tahun_jenis' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('semester');
  },
};
