"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS master_sumber_penilaian (
        id CHAR(36) NOT NULL PRIMARY KEY,
        kode VARCHAR(30) NOT NULL,
        nama VARCHAR(100) NOT NULL,
        kategori VARCHAR(100) NULL DEFAULT 'Kognitif / Formatif',
        bobot_default DECIMAL(5,2) NULL DEFAULT 0,
        fakultas_id CHAR(36) NULL,
        deskripsi TEXT NULL,
        urutan INT NOT NULL DEFAULT 0,
        is_aktif TINYINT(1) NOT NULL DEFAULT 1,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        deletedAt DATETIME NULL
      )
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("master_sumber_penilaian");
  },
};
