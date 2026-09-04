'use strict';

const { isUniversityAdminRole } = require('../constants/roles');

const ROLE_LEVELS = {
  'admin-fakultas': 'fakultas',
  'pimpinan-fakultas': 'fakultas',
  'admin-departemen': 'departemen',
  'pimpinan-departemen': 'departemen',
  'admin-prodi': 'prodi',
  'pimpinan-prodi': 'prodi',
};

const LEVEL_ORDER = { fakultas: 3, departemen: 2, prodi: 1 };

/** Kumpulkan id unit efektif dari daftar user_units (termasuk induk dari unit yang lebih rendah). */
const collectUnitIds = (units = []) => {
  const fakultas = new Set();
  const departemen = new Set();
  const prodi = new Set();
  for (const unit of units) {
    const f = unit.fakultas_id || unit.departemen?.fakultas_id || unit.programStudi?.fakultas_id;
    const d = unit.departemen_id || unit.programStudi?.departemen_id;
    const p = unit.program_studi_id;
    if (f) fakultas.add(f);
    if (d) departemen.add(d);
    if (p) prodi.add(p);
  }
  return {
    fakultas_ids: [...fakultas],
    departemen_ids: [...departemen],
    prodi_ids: [...prodi],
  };
};

/**
 * Hitung scope organisasi seorang user berdasarkan role-nya.
 * - universitas: admin universitas/superadmin → tidak dibatasi.
 * - fakultas/departemen/prodi: level terluas dari role organisasi yang dimiliki.
 * - null: bukan role organisasi → tidak ada pembatasan otomatis.
 */
const computeOrgScope = (user = {}) => {
  const roleNames = new Set((user.roles || []).map((role) => role.name));
  if (user.role) roleNames.add(user.role);

  if ([...roleNames].some(isUniversityAdminRole)) {
    return { level: 'universitas' };
  }

  let level = null;
  for (const name of roleNames) {
    const candidate = ROLE_LEVELS[name];
    if (candidate && (!level || LEVEL_ORDER[candidate] > LEVEL_ORDER[level])) {
      level = candidate;
    }
  }
  if (!level) {
    return { level: null };
  }
  return { level, ...collectUnitIds(user.units || []) };
};

// Resource master: kunci filter & daftar id efektif yang dipakai per level scope.
const MASTER_SCOPE = {
  fakultas: {
    fakultas: { key: 'fakultas_id', ids: (s) => s.fakultas_ids },
    departemen: { key: 'fakultas_id', ids: (s) => s.fakultas_ids },
    prodi: { key: 'fakultas_id', ids: (s) => s.fakultas_ids },
  },
  departemen: {
    fakultas: { key: 'fakultas_id', ids: (s) => s.fakultas_ids },
    departemen: { key: 'id', ids: (s) => s.departemen_ids },
    prodi: { key: 'id', ids: (s) => s.departemen_ids },
  },
  'program-studi': {
    fakultas: { key: 'fakultas_id', ids: (s) => s.fakultas_ids },
    departemen: { key: 'departemen_id', ids: (s) => s.departemen_ids },
    prodi: { key: 'id', ids: (s) => s.prodi_ids },
  },
};

// Resource lain: kunci & daftar id sesuai level scope (via kolom/virtual org filter).
const DEFAULT_SCOPE = {
  fakultas: { key: 'fakultas_id', ids: (s) => s.fakultas_ids },
  departemen: { key: 'departemen_id', ids: (s) => s.departemen_ids },
  prodi: { key: 'program_studi_id', ids: (s) => s.prodi_ids },
};

/**
 * Filter organisasi (bentuk `filter` list) yang wajib disuntikkan untuk sebuah resource.
 * Mengembalikan null bila user tidak perlu dibatasi.
 */
const orgFilterForResource = (resource, scope) => {
  if (!scope || !scope.level || scope.level === 'universitas') return null;
  const mapping = MASTER_SCOPE[resource]?.[scope.level] || DEFAULT_SCOPE[scope.level];
  if (!mapping) return null;
  return { [mapping.key]: mapping.ids(scope) };
};

module.exports = {
  ROLE_LEVELS,
  LEVEL_ORDER,
  collectUnitIds,
  computeOrgScope,
  orgFilterForResource,
};