"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // 1. Shift: drop fakultas_id
    await queryInterface.removeConstraint("shift", "shift_fakultas_id_fk");
    await queryInterface.removeIndex("shift", "idx_shift_fakultas");
    await queryInterface.removeColumn("shift", "fakultas_id");

    // 2. Shift: add sistem_sks
    await queryInterface.addColumn("shift", "sistem_sks", {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "2 SKS",
    });

    // 3. JadwalKelas: add frekuensi
    await queryInterface.addColumn("jadwal_kelas", "frekuensi", {
      type: DataTypes.ENUM("Mingguan", "Ganjil", "Genap"),
      allowNull: false,
      defaultValue: "Mingguan",
    });

    // 4. Backfill jam_mulai and jam_selesai for existing jadwal_kelas
    await queryInterface.sequelize.query(`
      UPDATE jadwal_kelas jk
      JOIN shift s ON jk.shift_id = s.id
      SET jk.jam_mulai = s.jam_mulai, jk.jam_selesai = s.jam_selesai
      WHERE jk.jam_mulai IS NULL OR jk.jam_selesai IS NULL;
    `);
  },

  async down(queryInterface) {
    // Revert JadwalKelas
    await queryInterface.removeColumn("jadwal_kelas", "frekuensi");

    // Revert Shift
    await queryInterface.removeColumn("shift", "sistem_sks");
    await queryInterface.addColumn("shift", "fakultas_id", {
      type: DataTypes.UUID,
      allowNull: true,
    });
  },
};
