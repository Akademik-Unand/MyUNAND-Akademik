'use strict';

const toNilaiHuruf = (raw) => {
  if (raw === null || raw === undefined || raw === '') return null;
  const value = Number(raw);
  if (Number.isNaN(value)) return null;
  if (value >= 85) return 'A';
  if (value >= 80) return 'A-';
  if (value >= 75) return 'B+';
  if (value >= 70) return 'B';
  if (value >= 65) return 'B-';
  if (value >= 60) return 'C+';
  if (value >= 55) return 'C';
  if (value >= 50) return 'C-';
  if (value >= 40) return 'D';
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

module.exports = { toNilaiHuruf, toNilaiAngka, scpLabel };
