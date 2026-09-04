'use strict';

const ROLE_NAMES = {
  SUPERADMIN: 'superadmin',
  ADMIN_UNIVERSITAS: 'admin-universitas',
  ADMIN: 'admin',
  DOSEN: 'dosen',
  DOSEN_PA: 'dosen-pa',
  MAHASISWA: 'mahasiswa',
  ORANG_TUA: 'orang-tua',
  ADMIN_PRODI: 'admin-prodi',
  ADMIN_DEPARTEMEN: 'admin-departemen',
  ADMIN_FAKULTAS: 'admin-fakultas',
  PIMPINAN_PRODI: 'pimpinan-prodi',
  PIMPINAN_DEPARTEMEN: 'pimpinan-departemen',
  PIMPINAN_FAKULTAS: 'pimpinan-fakultas',
};

const UNIVERSITY_ADMIN_NAMES = new Set([
  ROLE_NAMES.ADMIN_UNIVERSITAS,
  ROLE_NAMES.SUPERADMIN,
]);

const ROLE_LABELS = {
  superadmin: 'Admin Universitas',
  'admin-universitas': 'Admin Universitas',
  admin: 'Admin',
  dosen: 'Dosen',
  'dosen-pa': 'Dosen PA',
  mahasiswa: 'Mahasiswa',
  'orang-tua': 'Orang tua',
  'admin-prodi': 'Admin Prodi',
  'admin-departemen': 'Admin Departemen',
  'admin-fakultas': 'Admin Fakultas',
  'pimpinan-prodi': 'Pimpinan Prodi',
  'pimpinan-departemen': 'Pimpinan Departemen',
  'pimpinan-fakultas': 'Pimpinan Fakultas',
};

const ORGANIZATIONAL_ROLE_NAMES = [
  ROLE_NAMES.DOSEN_PA,
  ROLE_NAMES.ORANG_TUA,
  ROLE_NAMES.ADMIN_PRODI,
  ROLE_NAMES.ADMIN_DEPARTEMEN,
  ROLE_NAMES.ADMIN_FAKULTAS,
  ROLE_NAMES.PIMPINAN_PRODI,
  ROLE_NAMES.PIMPINAN_DEPARTEMEN,
  ROLE_NAMES.PIMPINAN_FAKULTAS,
];

const isUniversityAdminRole = (name) => UNIVERSITY_ADMIN_NAMES.has(name);
const isSuperadminRole = isUniversityAdminRole;

const roleLabel = (name) => ROLE_LABELS[name] || name;

module.exports = {
  ROLE_NAMES,
  ROLE_LABELS,
  ORGANIZATIONAL_ROLE_NAMES,
  UNIVERSITY_ADMIN_NAMES,
  isUniversityAdminRole,
  isSuperadminRole,
  roleLabel,
};
