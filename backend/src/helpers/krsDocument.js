"use strict";

const AppError = require("./AppError");

const text = (value) => value == null ? "" : String(value).replace(/\s+/g, " ").trim();

const rowStatus = (row) => row.is_cross_enrollment
  ? row.cross_enrollment_status || "pending_pa"
  : ({ "0": "pending_pa", "1": "approved", "2": "rejected" })[String(row.approved)] || "pending_pa";

/** Satu dokumen utuh: baris ditolak tidak masuk, baris menunggu menahan unduhan. */
const approvedDocumentRows = (krs) => {
  if (!(Number(krs.approval_ke) > 0)) {
    throw new AppError("KRS belum disetujui. Unduh tersedia setelah persetujuan dosen PA.", 409);
  }
  const rows = (Array.isArray(krs.krsDetil) ? krs.krsDetil : []).filter((row) => rowStatus(row) !== "rejected");
  if (!rows.length) throw new AppError("Tidak ada mata kuliah yang dapat dimuat dalam dokumen KRS.", 409);
  if (rows.some((row) => rowStatus(row) !== "approved")) {
    throw new AppError("Masih ada mata kuliah yang belum disetujui. Dokumen KRS belum dapat diunduh.", 409);
  }
  return rows;
};

const buildKrsDocumentData = (krs, generatedAt = new Date()) => {
  const approvedRows = approvedDocumentRows(krs);
  const missing = new Set();
  const field = (value, label) => {
    const result = text(value);
    if (!result) missing.add(label);
    return result;
  };
  const mahasiswa = krs.mahasiswa || {};
  const prodi = mahasiswa.programStudi || {};
  const semester = krs.semester || {};
  const university = prodi.universitas || prodi.fakultas?.universitas;
  const tahun = Number(semester.tahun);
  const academicYear = Number.isInteger(tahun) && tahun > 0 ? tahun + "/" + (tahun + 1) : "";
  const student = {
    name: field(mahasiswa.nama, "nama mahasiswa"),
    nim: field(mahasiswa.niu, "NIM"),
    cohort: field(mahasiswa.angkatan > 0 ? mahasiswa.angkatan : "", "angkatan"),
    university: field(university?.nama_resmi || university?.nama_singkat, "universitas"),
    faculty: field(prodi.fakultas?.nama_resmi || prodi.fakultas?.nama_singkat, "fakultas"),
    program: field(prodi.nama_resmi || prodi.nama_singkat, "program studi"),
  };
  const term = {
    name: field(semester.jenisSemester?.nama || semester.jenisSemester?.alias, "jenis semester"),
    year: field(academicYear, "tahun akademik"),
  };
  const weekdays = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
  const dayOrder = new Map(weekdays.map((day, index) => [day, index]));
  const rows = approvedRows.map((row) => {
    const kelas = row.kelas || {};
    const mk = kelas.matakuliah || {};
    const rawSks = mk.jumlah_sks_kurikulum;
    const sks = rawSks != null && text(rawSks) !== "" && Number.isFinite(Number(rawSks)) && Number(rawSks) >= 0
      ? Number(rawSks) : null;
    if (sks == null) missing.add("SKS mata kuliah dan total SKS");

    const schedule = (Array.isArray(kelas.jadwalKelas) ? kelas.jadwalKelas : [])
      .map((item) => ({
        day: text(item.hari),
        start: text(item.jam_mulai).slice(0, 5),
        end: text(item.jam_selesai).slice(0, 5),
        room: text(item.ruang?.kode || item.ruang?.nama),
      }))
      .sort((a, b) =>
        (dayOrder.get(a.day) ?? 99) - (dayOrder.get(b.day) ?? 99) ||
        a.start.localeCompare(b.start),
      );
    if (!schedule.length) missing.add("jadwal mata kuliah");
    if (schedule.some((item) => !item.day)) missing.add("hari jadwal mata kuliah");
    if (schedule.some((item) => !item.start || !item.end)) missing.add("jam jadwal mata kuliah");
    if (schedule.some((item) => !item.room)) missing.add("ruang kuliah");

    const lecturers = (Array.isArray(kelas.dosenKelas) ? kelas.dosenKelas : [])
      .slice()
      .sort((a, b) => (Number(a.dosen_ke) || 99) - (Number(b.dosen_ke) || 99))
      .map((item) => text(item.dosen?.nama))
      .filter(Boolean);
    if (!lecturers.length) missing.add("dosen pengampu");

    return {
      code: field(mk.kode_matakuliah, "kode mata kuliah"),
      name: field(mk.nama_resmi, "nama mata kuliah"),
      className: field(kelas.nama, "kelas"),
      sks,
      schedule,
      lecturers,
      status: "Disetujui",
    };
  }).sort((a, b) => a.code.localeCompare(b.code, "id", { numeric: true }) || a.className.localeCompare(b.className, "id"));
  return {
    id: krs.id,
    student,
    term,
    rows,
    totalSks: rows.some((row) => row.sks == null) ? null : rows.reduce((sum, row) => sum + row.sks, 0),
    // Bukan dosen PA aktif maupun approver per baris lintas: metadata keputusan
    // pada header belum tersedia. Jangan menganggap jam_selesai sebagai audit.
    approval: { name: "", date: "", signature: "" },
    generatedAt,
    notes: [
      "Nama pemberi persetujuan, tanggal persetujuan terverifikasi, dan tanda tangan dikosongkan karena data tersebut belum tersedia untuk persetujuan KRS ini.",
      ...(missing.size ? ["Data yang belum tersedia dan dikosongkan: " + [...missing].join(", ") + "."] : []),
      "Dokumen dibuat dari data yang tersedia saat diunduh. Perubahan data setelahnya dapat menghasilkan isi unduhan yang berbeda.",
    ],
  };
};

const krsDocumentFilename = (data) => {
  const safe = (value) => text(value).replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
  return ["KRS", safe(data.student.nim) || "mahasiswa", safe(data.term.name), safe(data.term.year)]
    .filter(Boolean).join("_") + ".pdf";
};

module.exports = { approvedDocumentRows, buildKrsDocumentData, krsDocumentFilename };