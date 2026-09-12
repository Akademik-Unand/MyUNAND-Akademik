"use strict";

const AppError = require("./AppError");

const jamKeMenit = (nilai) => {
  const [jam, menit] = String(nilai || "").split(":");
  const h = Number(jam);
  const m = Number(menit);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

/** Dua jadwal bertabrakan bila harinya sama dan rentang jamnya beririsan. */
const jamBertabrakan = (a, b) => {
  if (!a?.hari || !b?.hari || a.hari !== b.hari) return false;
  const mulaiA = jamKeMenit(a.jam_mulai);
  const selesaiA = jamKeMenit(a.jam_selesai);
  const mulaiB = jamKeMenit(b.jam_mulai);
  const selesaiB = jamKeMenit(b.jam_selesai);
  if ([mulaiA, selesaiA, mulaiB, selesaiB].some((n) => n == null)) return false;
  return mulaiA < selesaiB && selesaiA > mulaiB;
};

/** Label mata kuliah + kelas, mis. "PTN1105 Bahasa Indonesia (kelas A)". */
const labelKelasJadwal = (kelas) => {
  const mk = [kelas?.matakuliah?.kode_matakuliah, kelas?.matakuliah?.nama_resmi]
    .filter(Boolean)
    .join(" ");
  const nama = mk || "mata kuliah lain";
  return kelas?.nama ? `${nama} (kelas ${kelas.nama})` : nama;
};

/** Label hari + jam, mis. "Senin jam 08:00–09:40". */
const labelWaktuJadwal = (jadwal) => {
  const mulai = String(jadwal?.jam_mulai || "").slice(0, 5);
  const selesai = String(jadwal?.jam_selesai || "").slice(0, 5);
  if (mulai && selesai) return `${jadwal.hari} jam ${mulai}–${selesai}`;
  return jadwal?.hari || "waktu tersebut";
};

/**
 * Cari mata kuliah yang jadwalnya bertabrakan dengan jadwal kelas yang baru
 * mau diambil. Satu entri per mata kuliah (yang pertama bentrok), supaya pesan
 * bisa menyebut MK mana — bukan sekadar "jadwal bertabrakan".
 *
 * @param {{ jadwalKelas?: Array }} kelasBaru kelas yang akan diambil
 * @param {Array} existingRows baris krs_detil; tiap baris berisi `kelas`
 *   lengkap dengan `matakuliah` dan `jadwalKelas`
 * @returns {Array<{ kelas, jadwal }>}
 */
const cariBentrokJadwalKrs = (kelasBaru, existingRows = []) => {
  const jadwalBaru = kelasBaru?.jadwalKelas || [];
  if (!jadwalBaru.length) return [];

  const bentrok = [];
  const sudahBentrok = new Set();
  for (const row of existingRows) {
    const kelas = row?.kelas;
    if (!kelas || sudahBentrok.has(kelas.id)) continue;
    const tabrakan = (kelas.jadwalKelas || []).find((lain) =>
      jadwalBaru.some((baru) => jamBertabrakan(baru, lain)),
    );
    if (tabrakan) {
      sudahBentrok.add(kelas.id);
      bentrok.push({ kelas, jadwal: tabrakan });
    }
  }
  return bentrok;
};

/** Pesan bentrok yang menyebut mata kuliah, hari, dan jam pengiringnya. */
const pesanBentrokJadwal = (bentrok = []) => {
  const daftar = bentrok.map(
    ({ kelas, jadwal }) =>
      `${labelKelasJadwal(kelas)} pada ${labelWaktuJadwal(jadwal)}`,
  );
  if (daftar.length === 0) return "Jadwal bertabrakan dengan KRS mahasiswa";
  return `Jadwal bentrok dengan ${daftar.join("; ")}`;
};

/** Tolak pengambilan MK bila jadwalnya bertabrakan dengan isi KRS mahasiswa. */
const assertJadwalKrsTidakBentrok = (kelasBaru, existingRows) => {
  const bentrok = cariBentrokJadwalKrs(kelasBaru, existingRows);
  if (bentrok.length) throw new AppError(pesanBentrokJadwal(bentrok), 409);
  return bentrok;
};

module.exports = {
  jamBertabrakan,
  cariBentrokJadwalKrs,
  pesanBentrokJadwal,
  assertJadwalKrsTidakBentrok,
  labelKelasJadwal,
  labelWaktuJadwal,
};
