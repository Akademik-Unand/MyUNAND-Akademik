import { todayDateOnly } from "./academicPeriod";

/**
 * Status jendela pengambilan KRS sebuah semester (baris `Periode` jenis `krs`).
 * Satu periode berlaku untuk seluruh universitas dan mengunci semua pengambilan
 * mata kuliah (KRS reguler maupun lintas prodi).
 */
export const krsPeriodStatus = (row, today = todayDateOnly()) => {
  const mulai = row?.tanggal_krs_mulai || row?.tanggal_mulai;
  const selesai = row?.tanggal_krs_selesai || row?.tanggal_selesai;
  if (!mulai || !selesai) {
    return { label: "Belum diatur", variant: "ghost" };
  }
  if (mulai <= today && today <= selesai) {
    return { label: "Dibuka", variant: "success" };
  }
  return { label: "Ditutup", variant: "warning" };
};
