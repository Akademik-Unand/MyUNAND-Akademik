export const ROLE_NAMES = {
  SUPERADMIN: "superadmin",
  ADMIN_UNIVERSITAS: "admin-universitas",
};

export const ROLE_LABELS = {
  superadmin: "Admin Universitas",
  "admin-universitas": "Admin Universitas",
  admin: "Admin",
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
  "admin-universitas",
  "superadmin",
  "admin",
  "admin-fakultas",
  "admin-departemen",
  "admin-prodi",
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
