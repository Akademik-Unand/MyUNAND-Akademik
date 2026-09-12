"use strict";

/**
 * Normalisasi nilai tanggal dari Joi / klien / DB menjadi `YYYY-MM-DD`.
 *
 * Tujuannya agar semua perbandingan tanggal di service memakai string ISO yang
 * bisa dibandingkan leksikografis. Ini menghindari jebakan koersi `Date` vs
 * string: `new Date("2026-09-01") < "2026-10-10"` bernilai `false` karena sisi
 * string dikonversi ke `NaN`.
 *
 * - `Date` → bagian tanggal UTC-nya (Joi mengubah `YYYY-MM-DD` menjadi pukul
 *   00:00 UTC, jadi hasilnya tidak bergeser oleh zona waktu server)
 * - string berawalan `YYYY-MM-DD` → 10 karakter pertama
 * - kosong / tidak valid → `null`
 */
const pad = (value) => String(value).padStart(2, "0");

const toDateOnly = (value) => {
  if (value === null || value === undefined || value === "") return null;

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return `${value.getUTCFullYear()}-${pad(value.getUTCMonth() + 1)}-${pad(value.getUTCDate())}`;
  }

  const match = /^(\d{4}-\d{2}-\d{2})/.exec(String(value).trim());
  return match ? match[1] : null;
};

module.exports = { toDateOnly };
