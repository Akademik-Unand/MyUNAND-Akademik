"use strict";

const { randomUUID } = require("crypto");

const STANDARD_SHIFTS = [
  { kode: "Shift 1", jam_mulai: "07:00:00", jam_selesai: "08:40:00" },
  { kode: "Shift 2", jam_mulai: "08:00:00", jam_selesai: "09:40:00" },
  { kode: "Shift 3", jam_mulai: "10:00:00", jam_selesai: "11:40:00" },
  { kode: "Shift 4", jam_mulai: "13:00:00", jam_selesai: "14:40:00" },
  { kode: "Shift 5", jam_mulai: "15:00:00", jam_selesai: "16:40:00" },
  { kode: "Shift 6", jam_mulai: "19:00:00", jam_selesai: "20:40:00" },
];

module.exports = {
  async up(queryInterface) {
    const [fakultas] = await queryInterface.sequelize.query(
      "SELECT id FROM fakultas WHERE deletedAt IS NULL",
    );
    if (!fakultas.length) return;

    const [existing] = await queryInterface.sequelize.query(
      "SELECT fakultas_id, kode FROM shift WHERE deletedAt IS NULL",
    );
    const have = new Set(
      existing.map((row) => `${row.fakultas_id}:${row.kode}`),
    );

    const now = new Date();
    const rows = [];
    for (const fakultasId of fakultas.map((row) => row.id)) {
      for (const shift of STANDARD_SHIFTS) {
        const key = `${fakultasId}:${shift.kode}`;
        if (have.has(key)) continue;
        have.add(key);
        rows.push({
          id: randomUUID(),
          fakultas_id: fakultasId,
          ...shift,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
    if (rows.length) {
      await queryInterface.bulkInsert("shift", rows);
    }
  },

  async down(queryInterface) {
    const [fakultas] = await queryInterface.sequelize.query(
      "SELECT id FROM fakultas WHERE deletedAt IS NULL",
    );
    if (!fakultas.length) return;
    await queryInterface.bulkDelete("shift", {
      fakultas_id: fakultas.map((row) => row.id),
      kode: STANDARD_SHIFTS.map((shift) => shift.kode),
    });
  },
};
