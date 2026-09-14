import { loadBackendEnv } from "./env.mjs";

loadBackendEnv();

export const PRODI = { kode: "54231", nama: "Peternakan" };

/** MK yang dibuka lewat UI penawaran lalu diambil oleh mahasiswa uji. */
export const PROBE_MK_KODE = "PTN1201";
export const PROBE_MK_NAMA = "Statistik Dasar";

export const SUPERADMIN = {
  name: "Admin Universitas",
  email: "superadmin@email.com",
  password: "12345678",
};

export const ADMIN_PRODI_PETNAK = {
  name: "Admin Prodi Peternakan",
  email: "admin-prodi.54231@seed.myunand.local",
  password: process.env.ORG_ACCOUNT_SEED_PASSWORD || "password123",
  saudaraNama: "Peternakan",
};

export const E2E_MAHASISWA = {
  email: "e2e.mahasiswa.54231@seed.myunand.local",
  password: "password123",
  name: "E2E Mahasiswa Peternakan",
  niu: "E2E-PTN-2024",
  angkatan: 2024,
};

/** Dosen Peternakan yang dipakai untuk PA mahasiswa uji (ada di seeder kelas). */
export const DOSEN_PTN_NIP = "197801011990031010";

export const URLS = {
  login: "/login",
  penawaran: "/perkuliahan/penawaran-mk",
  krs: "/krs/pengambilan",
};