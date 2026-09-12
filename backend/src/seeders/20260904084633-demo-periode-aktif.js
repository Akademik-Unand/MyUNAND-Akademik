"use strict";

const { randomUUID } = require("crypto");

const pad = (n) => String(n).padStart(2, "0");
const isoDate = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** DATEONLY dari driver bisa berupa string maupun `Date` — normalkan ke `YYYY-MM-DD`. */
const tanggalOnly = (value) => {
  if (!value) return null;
  return typeof value === "string" ? value.slice(0, 10) : isoDate(new Date(value));
};

/** Jendela cadangan: bulan berjalan, dipakai bila semester belum punya tanggal. */
const bulanBerjalan = (now = new Date()) => ({
  tanggalMulai: isoDate(new Date(now.getFullYear(), now.getMonth(), 1)),
  tanggalSelesai: isoDate(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
});

/**
 * Seeder demo periode (jenis `cpmk` + `nilai`) untuk semester yang sedang aktif.
 * Jendela tanggalnya mengikuti `semester.tanggal_mulai/selesai` supaya periode
 * demo tidak pernah bertanggal di luar semester pemiliknya; kalau semester
 * belum punya tanggal, dipakai bulan berjalan sebagai cadangan.
 */
module.exports = {
  async up(queryInterface) {
    const [semesters] = await queryInterface.sequelize.query(
      "SELECT id, tanggal_mulai, tanggal_selesai FROM semester WHERE is_aktif = 1 AND deletedAt IS NULL LIMIT 1",
    );
    const semester = semesters[0];
    if (!semester) return;

    const [existing] = await queryInterface.sequelize.query(
      "SELECT jenis FROM periode WHERE semester_id = ? AND deletedAt IS NULL",
      { replacements: [semester.id] },
    );
    const have = new Set(existing.map((row) => row.jenis));

    const mulai = tanggalOnly(semester.tanggal_mulai);
    const selesai = tanggalOnly(semester.tanggal_selesai);
    const { tanggalMulai, tanggalSelesai } = mulai && selesai
      ? { tanggalMulai: mulai, tanggalSelesai: selesai }
      : bulanBerjalan();

    const stamp = new Date();
    const rows = ["cpmk", "nilai"]
      .filter((jenis) => !have.has(jenis))
      .map((jenis) => ({
        id: randomUUID(),
        semester_id: semester.id,
        jenis,
        tanggal_mulai: tanggalMulai,
        tanggal_selesai: tanggalSelesai,
        createdAt: stamp,
        updatedAt: stamp,
      }));

    if (rows.length) {
      await queryInterface.bulkInsert("periode", rows);
    }
  },

  async down(queryInterface) {
    const [semesters] = await queryInterface.sequelize.query(
      "SELECT id FROM semester WHERE is_aktif = 1 AND deletedAt IS NULL LIMIT 1",
    );
    const semesterId = semesters[0]?.id;
    if (!semesterId) return;
    await queryInterface.bulkDelete("periode", {
      semester_id: semesterId,
      jenis: ["cpmk", "nilai"],
    });
  },
};
