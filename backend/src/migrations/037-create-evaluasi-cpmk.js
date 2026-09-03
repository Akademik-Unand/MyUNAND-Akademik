'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('evaluasi_cpmk', {
id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      kelas_id: {
        type: DataTypes.UUID, allowNull: false,
        references: { model: 'kelas', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      cpmk_id: {
        type: DataTypes.UUID, allowNull: false,
        references: { model: 'cpmk', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      target_nilai_min: { type: DataTypes.FLOAT, defaultValue: 0 },
      target_persen_lulus: { type: DataTypes.FLOAT, defaultValue: 0 },
      capaian_persen: { type: DataTypes.FLOAT, defaultValue: 0 },
      rata_rata: { type: DataTypes.FLOAT, defaultValue: 0 },
      jumlah_lulus: { type: DataTypes.INTEGER, defaultValue: 0 },
      analisis: { type: DataTypes.TEXT, allowNull: true },
      tindak_lanjut: { type: DataTypes.TEXT, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addIndex('evaluasi_cpmk', ['kelas_id', 'cpmk_id'], { unique: true, name: 'uk_evaluasi_cpmk' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('evaluasi_cpmk');
  },
};
