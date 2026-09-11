"use strict";

const CRUD = ["read", "create", "update", "delete"];

const SUBJECTS = {
  universitas: {
    casl: "Universitas",
    group: "institusi",
    master: true,
    label: "Universitas",
  },
  fakultas: {
    casl: "Fakultas",
    group: "institusi",
    master: true,
    label: "Fakultas",
  },
  departemen: {
    casl: "Departemen",
    group: "institusi",
    master: true,
    label: "Departemen",
  },
  "jenjang-akademik": {
    casl: "JenjangAkademik",
    group: "institusi",
    master: true,
    label: "Jenjang Akademik",
  },
  "model-kurikulum": {
    casl: "ModelKurikulum",
    group: "institusi",
    master: true,
    label: "Model Kurikulum",
  },
  "program-studi": {
    casl: "ProgramStudi",
    group: "institusi",
    master: true,
    label: "Program Studi",
  },
  dosen: { casl: "Dosen", group: "institusi", master: true, label: "Dosen" },
  mahasiswa: {
    casl: "Mahasiswa",
    group: "institusi",
    master: true,
    label: "Mahasiswa",
  },
  "bimbingan-akademik": {
    casl: "BimbinganAkademik",
    group: "institusi",
    master: false,
    label: "Bimbingan Akademik",
  },
  "jenis-semester": {
    casl: "JenisSemester",
    group: "semester",
    master: true,
    label: "Jenis Semester",
  },
  semester: {
    casl: "Semester",
    group: "semester",
    master: true,
    label: "Semester",
  },
  "semester-prodi": {
    casl: "SemesterProdi",
    group: "semester",
    master: false,
    label: "Semester Prodi",
  },
  periode: {
    casl: "Periode",
    group: "semester",
    master: true,
    label: "Periode",
  },
  kurikulum: {
    casl: "Kurikulum",
    group: "kurikulum",
    master: true,
    label: "Kurikulum",
  },
  "sifat-matakuliah": {
    casl: "SifatMatakuliah",
    group: "kurikulum",
    master: false,
    label: "Sifat Matakuliah",
  },
  "tipe-matakuliah": {
    casl: "TipeMatakuliah",
    group: "kurikulum",
    master: false,
    label: "Tipe Matakuliah",
  },
  matakuliah: {
    casl: "Matakuliah",
    group: "kurikulum",
    master: true,
    label: "Matakuliah",
  },
  "matakuliah-kurikulum": {
    casl: "MatakuliahKurikulum",
    group: "kurikulum",
    master: false,
    label: "Matakuliah Kurikulum",
  },
  cp: { casl: "Cp", group: "obe", master: true, label: "CP" },
  scp: { casl: "Scp", group: "obe", master: true, label: "SCP" },
  cpmk: { casl: "Cpmk", group: "obe", master: true, label: "CPMK" },
  "sumber-penilaian": {
    casl: "SumberPenilaian",
    group: "obe",
    master: false,
    label: "Sumber Penilaian",
  },
  "cpmk-scp": {
    casl: "CpmkScp",
    group: "obe",
    master: false,
    label: "CPMK SCP",
  },
  gedung: {
    casl: "Gedung",
    group: "perkuliahan",
    master: true,
    label: "Gedung",
  },
  ruang: { casl: "Ruang", group: "perkuliahan", master: true, label: "Ruang" },
  "penawaran-matakuliah": {
    casl: "PenawaranMatakuliah",
    group: "perkuliahan",
    master: true,
    label: "Penawaran Matakuliah",
  },
  shift: {
    casl: "Shift",
    group: "perkuliahan",
    master: true,
    label: "Shift Jadwal",
  },
  "cross-enrollment": {
    casl: "CrossEnrollment",
    group: "krs",
    master: false,
    label: "Lintas Program Studi",
  },
  kelas: { casl: "Kelas", group: "perkuliahan", master: true, label: "Kelas" },
  "dosen-kelas": {
    casl: "DosenKelas",
    group: "perkuliahan",
    master: false,
    label: "Dosen Kelas",
  },
  "jadwal-kelas": {
    casl: "JadwalKelas",
    group: "perkuliahan",
    master: false,
    label: "Jadwal Kelas",
  },
  "dosen-jadwal": {
    casl: "DosenJadwal",
    group: "perkuliahan",
    master: false,
    label: "Dosen Jadwal",
  },
  krs: { casl: "Krs", group: "krs", master: false, label: "KRS" },
  "krs-detil": {
    casl: "KrsDetil",
    group: "krs",
    master: false,
    label: "KRS Detil",
  },
  nilai: {
    casl: "NilaiMahasiswa",
    group: "nilai",
    master: false,
    label: "Nilai Mahasiswa",
  },
  "history-upload-nilai": {
    casl: "HistoryUploadNilai",
    group: "evaluasi",
    master: false,
    label: "History Upload Nilai",
  },
  "evaluasi-cpmk": {
    casl: "EvaluasiCpmk",
    group: "evaluasi",
    master: false,
    label: "Evaluasi CPMK",
  },
  "jenis-dokumen-evaluasi": {
    casl: "JenisDokumenEvaluasi",
    group: "evaluasi",
    master: true,
    label: "Jenis Dokumen Evaluasi",
  },
  "dokumen-evaluasi": {
    casl: "DokumenEvaluasi",
    group: "evaluasi",
    master: false,
    label: "Dokumen Evaluasi",
  },
  "rekap-cp": {
    casl: "RekapCp",
    group: "laporan",
    master: false,
    label: "Rekap CP",
  },
  "laporan-cp": {
    casl: "LaporanCp",
    group: "laporan",
    master: false,
    label: "Laporan CP",
  },
  role: { casl: "Role", group: "iam", master: true, label: "Role" },
  permission: {
    casl: "Permission",
    group: "iam",
    master: true,
    label: "Permission",
  },
  user: { casl: "User", group: "iam", master: true, label: "User" },
  "activity-log": {
    casl: "ActivityLog",
    group: "iam",
    master: false,
    readOnly: true,
    label: "Jejak Aktivitas",
  },
};

const SPECIAL = [
  { key: "krs", action: "approve", description: "Menyetujui KRS" },
  {
    key: "penawaran-matakuliah",
    action: "publish",
    description: "Publikasikan penawaran matakuliah",
  },
  {
    key: "penawaran-matakuliah",
    action: "close",
    description: "Tutup penawaran matakuliah",
  },
  {
    key: "penawaran-matakuliah",
    action: "catalog",
    description: "Lihat katalog lintas prodi",
  },
  {
    key: "penawaran-matakuliah",
    action: "schedule",
    description: "Kelola jadwal penawaran",
  },
  {
    key: "penawaran-matakuliah",
    action: "sync",
    description: "Sinkronkan pilihan matakuliah semester",
  },
  {
    key: "cross-enrollment",
    action: "enroll",
    description: "Ajukan lintas prodi",
  },
  {
    key: "cross-enrollment",
    action: "approve-pa",
    description: "Setujui pengajuan lintas prodi sebagai dosen PA",
  },
  { key: "nilai", action: "upload", description: "Unggah nilai massal" },
  {
    key: "user",
    action: "assign-roles",
    description: "Menetapkan role ke user",
  },
  {
    key: "user",
    action: "assign-units",
    description: "Menetapkan unit organisasi ke user",
  },
  {
    key: "role",
    action: "sync-permissions",
    description: "Menyimpan matriks permission role",
  },
];

const toPermission = (key, action, extra = {}) => {
  const meta = SUBJECTS[key];
  return {
    name: `${key}.${action}`,
    action,
    subject: meta.casl,
    group: meta.group,
    description: extra.description || `${action} ${meta.label}`,
    key,
    master: meta.master,
  };
};

const buildCatalog = () => {
  const items = [];
  for (const [key, meta] of Object.entries(SUBJECTS)) {
    if (meta.readOnly) {
      items.push(
        toPermission(key, "read", { description: `Lihat ${meta.label}` }),
      );
      continue;
    }
    for (const action of CRUD) {
      items.push(toPermission(key, action));
    }
    if (meta.master) {
      items.push(
        toPermission(key, "restore", { description: `Pulihkan ${meta.label}` }),
      );
    }
  }
  for (const item of SPECIAL) {
    items.push(
      toPermission(item.key, item.action, { description: item.description }),
    );
  }
  return items;
};

const SUBJECT_BY_KEY = Object.fromEntries(
  Object.entries(SUBJECTS).map(([key, meta]) => [key, meta.casl]),
);

const MASTER_TABLES = [
  "universitas",
  "fakultas",
  "departemen",
  "jenjang_akademik",
  "model_kurikulum",
  "program_studi",
  "dosen",
  "mahasiswa",
  "jenis_semester",
  "semester",
  "periode",
  "kurikulum",
  "matakuliah",
  "cp",
  "scp",
  "cpmk",
  "gedung",
  "ruang",
  "penawaran_matakuliah",
  "kelas",
  "jenis_dokumen_evaluasi",
  "roles",
  "permissions",
  "users",
];

const IAM_DANGER = new Set(["role.delete", "permission.delete"]);

const isAdminAllowed = (item) => {
  if (IAM_DANGER.has(item.name)) return false;
  return true;
};

const isDosenAllowed = (item) => {
  if (item.key === "periode" && item.action === "read") return true;
  if (item.group === "krs" && ["read", "approve"].includes(item.action))
    return true;
  // Dosen adalah pembimbing akademik mahasiswanya, jadi ia boleh menyetujui
  // pengajuan lintas prodi bimbingannya (endpoint memverifikasi kepemilikan PA)
  // dan melihat daftar bimbingannya sendiri (otomatis dibatasi ke dirinya).
  if (item.key === "cross-enrollment" && item.action === "approve-pa")
    return true;
  if (item.key === "bimbingan-akademik" && item.action === "read") return true;
  if (item.group === "nilai") return true;
  if (item.group === "evaluasi") return true;
  if (item.group === "laporan" && item.action === "read") return true;
  return false;
};

const isMahasiswaAllowed = (item) => {
  if (item.key === "krs" && ["read", "create", "update"].includes(item.action))
    return true;
  // Mahasiswa mengelola baris KRS miliknya sendiri: tambah dan keluarkan mata
  // kuliah. Sengaja tanpa `read` karena `GET /krs-detil` belum dibatasi per
  // pemilik (akan membocorkan KRS mahasiswa lain). Sengaja tanpa `update`
  // karena penggantian kelas dilakukan lewat hapus + tambah.
  if (item.key === "krs-detil" && ["create", "delete"].includes(item.action))
    return true;
  if (item.key === "penawaran-matakuliah" && item.action === "catalog")
    return true;
  if (
    item.key === "cross-enrollment" &&
    ["read", "enroll"].includes(item.action)
  )
    return true;
  if (item.group === "laporan" && item.action === "read") return true;
  return false;
};

const isDosenPaAllowed = (item) => {
  if (isDosenAllowed(item)) return true;
  if (item.key === "mahasiswa" && item.action === "read") return true;
  return false;
};

const isOrangTuaAllowed = (item) =>
  item.group === "laporan" && item.action === "read";

const isPimpinanAllowed = (item) => {
  if (item.group === "iam") return false;
  return item.action === "read";
};

const isAdminFakultasAllowed = (item) => {
  if (IAM_DANGER.has(item.name) || item.name === "role.sync-permissions")
    return false;
  if (item.key === "universitas" && item.action !== "read") return false;
  return true;
};

const isAdminDepartemenAllowed = (item) => {
  if (!isAdminFakultasAllowed(item)) return false;
  if (item.key === "fakultas" && item.action !== "read") return false;
  return true;
};

const isAdminProdiAllowed = (item) => {
  if (!isAdminDepartemenAllowed(item)) return false;
  if (item.key === "departemen" && item.action !== "read") return false;
  return true;
};

const ROLE_GRANT_PREDICATES = {
  "admin-universitas": () => true,
  admin: isAdminAllowed,
  dosen: isDosenAllowed,
  mahasiswa: isMahasiswaAllowed,
  "dosen-pa": isDosenPaAllowed,
  "orang-tua": isOrangTuaAllowed,
  "admin-prodi": isAdminProdiAllowed,
  "admin-departemen": isAdminDepartemenAllowed,
  "admin-fakultas": isAdminFakultasAllowed,
  "pimpinan-prodi": isPimpinanAllowed,
  "pimpinan-departemen": isPimpinanAllowed,
  "pimpinan-fakultas": isPimpinanAllowed,
};

module.exports = {
  CRUD,
  SUBJECTS,
  SPECIAL,
  SUBJECT_BY_KEY,
  MASTER_TABLES,
  buildCatalog,
  isAdminAllowed,
  isDosenAllowed,
  isMahasiswaAllowed,
  isDosenPaAllowed,
  isOrangTuaAllowed,
  isPimpinanAllowed,
  isAdminProdiAllowed,
  isAdminDepartemenAllowed,
  isAdminFakultasAllowed,
  ROLE_GRANT_PREDICATES,
};
