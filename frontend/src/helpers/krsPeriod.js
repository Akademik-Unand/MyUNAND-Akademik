import { todayDateOnly } from "./academicPeriod";
import { formatTanggalId } from "../utils/formatTanggal";

/**
 * Status sebuah periode akademik (baris `Periode`, mis. jenis `krs`).
 * Jendela waktu adalah milik `periode` global per semester — dahulu tanggal
 * per prodi, sekarang satu aturan untuk seluruh universitas.
 * @param {Object|null} periode — `{ tanggal_mulai, tanggal_selesai }`
 * @param {string} [today] — tanggal pembanding (`YYYY-MM-DD`)
 * @returns {{ label: string, variant: 'ghost'|'warning'|'success'|'error' }}
 */
export const krsPeriodStatus = (periode, today = todayDateOnly()) => {
  const mulai = periode?.tanggal_mulai;
  const selesai = periode?.tanggal_selesai;
  if (!mulai || !selesai) {
    return { label: "Belum diatur", variant: "ghost" };
  }
  if (today < mulai) {
    return { label: "Belum dibuka", variant: "warning" };
  }
  if (today > selesai) {
    return { label: "Ditutup", variant: "error" };
  }
  return { label: "Dibuka", variant: "success" };
};

/** true hanya saat jendela KRS sedang terbuka (tanggal inklusif). */
export const isKrsPeriodOpen = (periode, today = todayDateOnly()) =>
  krsPeriodStatus(periode, today).label === "Dibuka";

/**
 * Penjelasan untuk mahasiswa saat jendela KRS belum bisa dipakai — `null` bila
 * sedang dibuka, supaya halaman tidak menampilkan peringatan yang tidak perlu.
 * Dipakai halaman Pengambilan KRS agar mahasiswa tahu *kenapa* mata kuliah tidak
 * bisa diambil (belum diatur / belum dibuka / sudah ditutup), bukan sekadar
 * gagal saat menekan Ambil.
 * @param {Object|null} periode — `{ tanggal_mulai, tanggal_selesai }`
 * @param {string} [today] — tanggal pembanding (`YYYY-MM-DD`)
 * @returns {{ variant: 'info'|'warning'|'error', title: string, message: string }|null}
 */
export const krsPeriodNotice = (periode, today = todayDateOnly()) => {
  const { label } = krsPeriodStatus(periode, today);
  if (label === "Dibuka") return null;

  const mulai = formatTanggalId(periode?.tanggal_mulai);
  const selesai = formatTanggalId(periode?.tanggal_selesai);

  if (label === "Belum diatur") {
    return {
      variant: "warning",
      title: "Jendela pengambilan KRS belum diatur",
      message:
        "Admin belum menetapkan tanggal mulai dan selesai periode KRS semester ini, jadi mata kuliah belum dapat diambil. Hubungi admin akademik bila jadwalnya seharusnya sudah dibuka.",
    };
  }

  if (label === "Belum dibuka") {
    return {
      variant: "info",
      title: "Pengambilan KRS belum dibuka",
      message: mulai
        ? `Jendela pengambilan KRS semester ini dibuka ${mulai} sampai ${selesai}. Mata kuliah baru dapat diambil setelah tanggal mulai.`
        : "Jendela pengambilan KRS semester ini belum dibuka. Mata kuliah baru dapat diambil setelah tanggal mulai.",
    };
  }

  return {
    variant: "error",
    title: "Pengambilan KRS sudah ditutup",
    message: selesai
      ? `Jendela pengambilan KRS semester ini berakhir pada ${selesai}, jadi mata kuliah tidak dapat ditambah lagi. Hubungi admin akademik bila Anda masih perlu mengubah KRS.`
      : "Jendela pengambilan KRS semester ini sudah ditutup, jadi mata kuliah tidak dapat ditambah lagi. Hubungi admin akademik bila Anda masih perlu mengubah KRS.",
  };
};
