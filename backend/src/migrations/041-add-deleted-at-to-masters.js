'use strict';

const { MASTER_TABLES } = require('../constants/permissions');

module.exports = {
  // Idempotent: lewati tabel yang belum ada (mis. jenis_dokumen_evaluasi dibuat
  // belakangan beserta kolom deletedAt) dan tabel yang kolomnya sudah terpasang,
  // supaya migrasi aman dijalankan ulang bila sempat gagal sebagian.
  async up(queryInterface, Sequelize) {
    for (const table of MASTER_TABLES) {
      const exists = await queryInterface.tableExists(table);
      if (!exists) continue;
      const attrs = await queryInterface.describeTable(table);
      if (attrs.deletedAt) continue;
      await queryInterface.addColumn(table, 'deletedAt', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    for (const table of MASTER_TABLES) {
      const exists = await queryInterface.tableExists(table);
      if (!exists) continue;
      const attrs = await queryInterface.describeTable(table);
      if (!attrs.deletedAt) continue;
      await queryInterface.removeColumn(table, 'deletedAt');
    }
  },
};
