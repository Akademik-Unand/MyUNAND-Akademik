'use strict';

const DEFAULT_BANDS = [
  { min: 85, letter: 'A' },
  { min: 80, letter: 'A-' },
  { min: 75, letter: 'B+' },
  { min: 70, letter: 'B' },
  { min: 65, letter: 'B-' },
  { min: 60, letter: 'C+' },
  { min: 55, letter: 'C' },
  { min: 50, letter: 'C-' },
  { min: 40, letter: 'D' },
];

/** Rentang nilai huruf portal lama (80 = A, 75 = A-, 70 = B+, dst). */
const NILAI_HURUF_BANDS_PORTAL = [
  { min: 80, letter: 'A' },
  { min: 75, letter: 'A-' },
  { min: 70, letter: 'B+' },
  { min: 65, letter: 'B' },
  { min: 60, letter: 'B-' },
  { min: 55, letter: 'C+' },
  { min: 50, letter: 'C' },
  { min: 45, letter: 'C-' },
  { min: 40, letter: 'D' },
];

const toNilaiHuruf = (raw, bands = DEFAULT_BANDS) => {
  if (raw === null || raw === undefined || raw === '') return null;
  const value = Number(raw);
  if (Number.isNaN(value)) return null;
  for (const band of bands) {
    if (value >= band.min) return band.letter;
  }
  return 'E';
};

const toNilaiAngka = (cells, sumber) => {
  let weighted = 0;
  let hasValue = false;
  for (const item of sumber) {
    const nilai = cells[item.id];
    if (nilai === null || nilai === undefined || nilai === '') continue;
    const number = Number(nilai);
    if (Number.isNaN(number)) continue;
    hasValue = true;
    weighted += number * (Number(item.bobot) || 0) / 100;
  }
  if (!hasValue) return null;
  return Math.round(weighted * 100) / 100;
};

const scpLabel = (cpmk) => {
  const scp = cpmk?.scp?.[0] || cpmk?.parent?.scp?.[0];
  if (!scp) return '—';
  const cp = scp.cp?.nama_cp;
  return [cp, scp.nama_scp].filter(Boolean).join(' · ');
};

module.exports = { toNilaiHuruf, toNilaiAngka, scpLabel, NILAI_HURUF_BANDS_PORTAL };
