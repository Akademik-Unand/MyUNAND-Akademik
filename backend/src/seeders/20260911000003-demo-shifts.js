"use strict";

const { randomUUID } = require("crypto");

const UNIVERSAL_SHIFTS = [
  // 2 SKS System
  { sistem_sks: "2 SKS", kode: "Shift 1", jam_mulai: "07:30:00", jam_selesai: "09:10:00" },
  { sistem_sks: "2 SKS", kode: "Shift 2", jam_mulai: "09:20:00", jam_selesai: "11:00:00" },
  { sistem_sks: "2 SKS", kode: "Shift 3", jam_mulai: "11:10:00", jam_selesai: "12:50:00" },
  { sistem_sks: "2 SKS", kode: "Shift 4", jam_mulai: "13:30:00", jam_selesai: "15:10:00" },
  { sistem_sks: "2 SKS", kode: "Shift 5", jam_mulai: "16:00:00", jam_selesai: "17:40:00" },
  // 3 SKS System
  { sistem_sks: "3 SKS", kode: "Shift 1", jam_mulai: "07:30:00", jam_selesai: "10:00:00" },
  { sistem_sks: "3 SKS", kode: "Shift 2", jam_mulai: "10:10:00", jam_selesai: "12:40:00" },
  { sistem_sks: "3 SKS", kode: "Shift 3", jam_mulai: "13:30:00", jam_selesai: "16:00:00" },
  { sistem_sks: "3 SKS", kode: "Shift 4", jam_mulai: "16:00:00", jam_selesai: "17:40:00" },
];

module.exports = {
  async up(queryInterface) {
    const [existing] = await queryInterface.sequelize.query(
      "SELECT sistem_sks, kode FROM shift WHERE deletedAt IS NULL",
    );
    const have = new Set(
      existing.map((row) => `${row.sistem_sks}:${row.kode}`),
    );

    const now = new Date();
    const rows = [];
    
    for (const shift of UNIVERSAL_SHIFTS) {
      const key = `${shift.sistem_sks}:${shift.kode}`;
      if (have.has(key)) continue;
      have.add(key);
      rows.push({
        id: randomUUID(),
        ...shift,
        createdAt: now,
        updatedAt: now,
      });
    }

    if (rows.length) {
      await queryInterface.bulkInsert("shift", rows);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("shift", {
      sistem_sks: UNIVERSAL_SHIFTS.map((shift) => shift.sistem_sks),
      kode: UNIVERSAL_SHIFTS.map((shift) => shift.kode),
    });
  },
};
