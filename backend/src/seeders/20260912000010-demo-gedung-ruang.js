"use strict";

const { randomUUID } = require("crypto");

/**
 * Data demo gedung & ruang: gedung A–J kampus Limau Manis, masing-masing tiga
 * lantai berisi enam ruang (kode `R.<gedung>-<lantai><nomor>`, mis. `R.A-101`).
 *
 * Idempotent: baris dicek per `kode` (tanpa memandang `deletedAt`, karena
 * `gedung.kode` unik di DB — membuat ulang kode yang sudah di-soft-delete akan
 * menabrak indeks unik). Ruang demo lama yang belum punya `gedung_id` (mis.
 * `R.H-102` buatan seeder mapping) cukup ditautkan ke gedungnya, bukan digandakan.
 */

const KODE_GEDUNG = "ABCDEFGHIJ".split("");

const gedungRow = (kode) => ({
  kode,
  nama: `Gedung ${kode}`,
  alamat: `Kampus Limau Manis, Blok ${kode}, Padang`,
});

/** Denah standar tiap gedung: enam ruang per lantai, tiga lantai. */
const DENAH = {
  1: [
    { nomor: "01", jenis: "Aula", kapasitas: 120 },
    { nomor: "02", jenis: "Ruang Kuliah", kapasitas: 60 },
    { nomor: "03", jenis: "Ruang Kuliah", kapasitas: 60 },
    { nomor: "04", jenis: "Ruang Kuliah", kapasitas: 50 },
    { nomor: "05", jenis: "Ruang Kuliah", kapasitas: 50 },
    { nomor: "06", jenis: "Ruang Rapat", kapasitas: 30 },
  ],
  2: [
    { nomor: "01", jenis: "Laboratorium Komputer", kapasitas: 40 },
    { nomor: "02", jenis: "Laboratorium Komputer", kapasitas: 40 },
    { nomor: "03", jenis: "Ruang Kuliah", kapasitas: 50 },
    { nomor: "04", jenis: "Ruang Kuliah", kapasitas: 50 },
    { nomor: "05", jenis: "Ruang Kuliah", kapasitas: 40 },
    { nomor: "06", jenis: "Ruang Kuliah", kapasitas: 40 },
  ],
  3: [
    { nomor: "01", jenis: "Ruang Kuliah", kapasitas: 40 },
    { nomor: "02", jenis: "Ruang Kuliah", kapasitas: 40 },
    { nomor: "03", jenis: "Ruang Kuliah", kapasitas: 40 },
    { nomor: "04", jenis: "Ruang Kuliah", kapasitas: 40 },
    { nomor: "05", jenis: "Ruang Kuliah", kapasitas: 40 },
    { nomor: "06", jenis: "Ruang Dosen", kapasitas: 25 },
  ],
};

/** Semua kode ruang yang menjadi tanggung jawab seeder ini. */
const kodeRuangSeeded = () => {
  const daftar = [];
  for (const gedung of KODE_GEDUNG) {
    for (const [lantai, ruang] of Object.entries(DENAH)) {
      for (const { nomor } of ruang) {
        daftar.push(`R.${gedung}-${lantai}${nomor}`);
      }
    }
  }
  return daftar;
};

const gedungDariKodeRuang = (kode) => /^R\.([A-J])-/.exec(kode)?.[1] || null;

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // 1. Gedung A–J (tanpa filter deletedAt: kode unik tetap terpakai).
    const [gedungRows] = await queryInterface.sequelize.query(
      "SELECT id, kode FROM gedung",
    );
    const gedungByKode = new Map(gedungRows.map((row) => [row.kode, row.id]));

    const gedungBaru = KODE_GEDUNG.filter((kode) => !gedungByKode.has(kode)).map(
      (kode) => {
        const id = randomUUID();
        gedungByKode.set(kode, id);
        return { id, ...gedungRow(kode), createdAt: now, updatedAt: now };
      },
    );
    if (gedungBaru.length) {
      await queryInterface.bulkInsert("gedung", gedungBaru);
    }

    // 2. Ruang: penuhi yang belum ada, lalu tautkan gedung_id yang masih kosong.
    const [ruangRows] = await queryInterface.sequelize.query(
      "SELECT id, kode, gedung_id FROM ruang",
    );
    const kodeRuangAda = new Set(ruangRows.map((row) => row.kode));

    const ruangBaru = [];
    for (const gedung of KODE_GEDUNG) {
      for (const [lantai, daftar] of Object.entries(DENAH)) {
        for (const { nomor, jenis, kapasitas } of daftar) {
          const kode = `R.${gedung}-${lantai}${nomor}`;
          if (kodeRuangAda.has(kode)) continue;
          kodeRuangAda.add(kode);
          ruangBaru.push({
            id: randomUUID(),
            gedung_id: gedungByKode.get(gedung),
            kode,
            nama: `${jenis} Gedung ${gedung} ${lantai}${nomor}`,
            kapasitas,
            createdAt: now,
            updatedAt: now,
          });
        }
      }
    }
    if (ruangBaru.length) {
      await queryInterface.bulkInsert("ruang", ruangBaru);
    }

    for (const row of ruangRows) {
      if (row.gedung_id) continue;
      const gedung = gedungDariKodeRuang(row.kode);
      if (!gedung || !gedungByKode.has(gedung)) continue;
      await queryInterface.bulkUpdate(
        "ruang",
        { gedung_id: gedungByKode.get(gedung), updatedAt: now },
        { id: row.id },
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("ruang", { kode: kodeRuangSeeded() });
    await queryInterface.bulkDelete("gedung", { kode: KODE_GEDUNG });
  },
};
