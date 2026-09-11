"use strict";

const { DataTypes } = require("sequelize");

/**
 * Status `cancelled` tidak lagi dipakai. Mahasiswa mengeluarkan mata kuliah
 * lintas prodi dengan menghapus barisnya dari KRS (`DELETE /krs-detil/:id`)
 * selama KRS belum disetujui — sama seperti baris reguler — sehingga tidak ada
 * lagi aksi "batalkan pengajuan" yang meninggalkan status tersendiri.
 *
 * Migrasi ini:
 *  1. membuang baris `cancelled` (pengajuan yang ditarik, tidak pernah mengikat KRS),
 *  2. mempersempit enum ke `pending_pa` / `approved` / `rejected`,
 *  3. menghapus kolom audit `cancelled_at`.
 *
 * Idempoten dan aman dijalankan ulang.
 */

const STATUS_COLUMN = "cross_enrollment_status";
const ENUM_OLD = ["pending_pa", "approved", "rejected", "cancelled"];
const ENUM_NEW = ["pending_pa", "approved", "rejected"];

module.exports = {
  async up(queryInterface) {
    const columns = await queryInterface.describeTable("krs_detil");
    if (!columns[STATUS_COLUMN]) return;

    // Nilai di luar enum baru harus hilang sebelum enum dipersempit (strict mode).
    await queryInterface.sequelize.query(
      `DELETE FROM krs_detil WHERE \`${STATUS_COLUMN}\` = 'cancelled'`,
    );

    if (columns.cancelled_at) {
      await queryInterface.removeColumn("krs_detil", "cancelled_at");
    }

    await queryInterface.changeColumn("krs_detil", STATUS_COLUMN, {
      type: DataTypes.ENUM(...ENUM_NEW),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    const columns = await queryInterface.describeTable("krs_detil");
    if (!columns[STATUS_COLUMN]) return;

    await queryInterface.changeColumn("krs_detil", STATUS_COLUMN, {
      type: DataTypes.ENUM(...ENUM_OLD),
      allowNull: true,
    });

    if (!columns.cancelled_at) {
      await queryInterface.addColumn("krs_detil", "cancelled_at", {
        type: DataTypes.DATE,
        allowNull: true,
      });
    }
  },
};
