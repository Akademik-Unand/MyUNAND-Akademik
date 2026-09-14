import { programStudiLabel } from "../helpers/academicLabel";

export const formatDateTime = (value) =>
  value
    ? new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "—";

export const participantName = (row) =>
  row?.krs?.mahasiswa?.nama ||
  row?.mahasiswa?.nama ||
  row?.nama_mahasiswa ||
  "Peserta";

export const participantNiu = (row) =>
  row?.krs?.mahasiswa?.niu || row?.niu || "—";

export const participantProgram = (row) =>
  programStudiLabel(
    row?.krs?.mahasiswa?.programStudi || row?.mahasiswa?.programStudi,
    "Program studi tidak tersedia",
  );

export const hostProgram = (row) =>
  programStudiLabel(
    row?.kelas?.penawaranMatakuliah?.penawaran?.programStudi,
  );

export const approvalStatusLabel = (status) =>
  ({
    pending_pa: "Menunggu Dosen PA",
    approved: "Disetujui",
    rejected: "Ditolak",
  })[status] ||
  status ||
  "Menunggu";

export const approvalStatusTone = (status) =>
  ({
    pending_pa: "badge-warning",
    approved: "badge-success",
    rejected: "badge-error",
  })[status] || "badge-ghost";

/**
 * Status seragam untuk setiap baris KRS. KRS reguler mengikuti keputusan PA
 * atas KRS (`approved`), sedangkan lintas prodi mengikuti status pengajuannya
 * sendiri (`cross_enrollment_status`). Keduanya sama-sama butuh persetujuan PA.
 */
export const krsRowStatus = (row) => {
  if (row?.is_cross_enrollment)
    return row.cross_enrollment_status || "pending_pa";
  if (row?.approved === "1") return "approved";
  if (row?.approved === "2") return "rejected";
  return "pending_pa";
};

const ACTIVE_STATUSES = new Set(["pending_pa", "approved"]);

/**
 * Baris KRS yang perlu ditampilkan: seluruh KRS reguler ditambah semua
 * pengajuan lintas prodi (termasuk yang ditolak agar riwayatnya tidak hilang).
 * `aktif` menandai baris yang benar-benar mengikat KRS — pengajuan non-aktif
 * tidak dihitung sehingga kelasnya bisa diambil ulang.
 */
export const registeredKrsRows = (krsDetil) =>
  (krsDetil || []).map((row) => {
    const status = krsRowStatus(row);
    return {
      ...row,
      lintas: Boolean(row.is_cross_enrollment),
      status,
      aktif: ACTIVE_STATUSES.has(status),
      nama: row.kelas?.matakuliah?.nama_resmi || "—",
      kode: row.kelas?.matakuliah?.kode_matakuliah || "—",
    };
  });
