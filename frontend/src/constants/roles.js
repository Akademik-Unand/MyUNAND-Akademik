export const ROLE_NAMES = {
  SUPERADMIN: "superadmin",
  ADMIN_UNIVERSITAS: "admin-universitas",
  ADMIN_FAKULTAS: "admin-fakultas",
  ADMIN_DEPARTEMEN: "admin-departemen",
  ADMIN_PRODI: "admin-prodi",
};

export const ROLE_LABELS = {
  superadmin: "Admin Universitas",
  "admin-universitas": "Admin Universitas",
  dosen: "Dosen",
  "dosen-pa": "Dosen PA",
  mahasiswa: "Mahasiswa",
  "orang-tua": "Orang tua",
  "admin-prodi": "Admin Prodi",
  "admin-departemen": "Admin Departemen",
  "admin-fakultas": "Admin Fakultas",
  "pimpinan-prodi": "Pimpinan Prodi",
  "pimpinan-departemen": "Pimpinan Departemen",
  "pimpinan-fakultas": "Pimpinan Fakultas",
};

const UNIVERSITY_ADMIN_NAMES = new Set([
  ROLE_NAMES.ADMIN_UNIVERSITAS,
  ROLE_NAMES.SUPERADMIN,
]);

export const isUniversityAdminRole = (name) => UNIVERSITY_ADMIN_NAMES.has(name);

/** Role pengelola data (admin) — unitnya dari scope organisasi, bukan dari data akunnya. */
export const ADMIN_ROLE_NAMES = new Set([
  ROLE_NAMES.ADMIN_UNIVERSITAS,
  ROLE_NAMES.SUPERADMIN,
  ROLE_NAMES.ADMIN_FAKULTAS,
  ROLE_NAMES.ADMIN_DEPARTEMEN,
  ROLE_NAMES.ADMIN_PRODI,
]);

/** Role pimpinan — bersifat monitoring, bukan pengampu/pembimbing. */
export const PIMPINAN_ROLE_NAMES = new Set([
  "pimpinan-fakultas",
  "pimpinan-departemen",
  "pimpinan-prodi",
]);

/** Role pengajar & pembimbing akademik. */
export const DOSEN_ROLE_NAMES = new Set(["dosen", "dosen-pa"]);

export const roleLabel = (name) => ROLE_LABELS[name] || name;
