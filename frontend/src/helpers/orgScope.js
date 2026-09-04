export const ROLE_LEVELS = {
  'admin-fakultas': 'fakultas',
  'pimpinan-fakultas': 'fakultas',
  'admin-departemen': 'departemen',
  'pimpinan-departemen': 'departemen',
  'admin-prodi': 'prodi',
  'pimpinan-prodi': 'prodi',
};

const LEVEL_ORDER = { fakultas: 3, departemen: 2, prodi: 1 };

const UNIVERSAL_ROLES = new Set(['admin-universitas', 'superadmin']);

const collectUnitIds = (units = []) => {
  const fakultas = new Set();
  const departemen = new Set();
  const prodi = new Set();
  for (const unit of units) {
    if (unit.fakultas_id) fakultas.add(unit.fakultas_id);
    if (unit.departemen_id) departemen.add(unit.departemen_id);
    if (unit.program_studi_id) prodi.add(unit.program_studi_id);
  }
  return {
    fakultas_ids: [...fakultas],
    departemen_ids: [...departemen],
    prodi_ids: [...prodi],
  };
};

/**
 * Hitung scope organisasi user di sisi klien (mirror backend `orgScope`).
 * - universitas: tanpa batasan.
 * - fakultas/departemen/prodi: level terluas dari role organisasi yang dimiliki.
 * - null: bukan role organisasi.
 */
export const computeOrgScope = (user) => {
  const roleNames = new Set((user?.roles || []).map((role) => role.name));
  if (user?.role) roleNames.add(user.role);

  if ([...roleNames].some((name) => UNIVERSAL_ROLES.has(name))) {
    return { level: 'universitas' };
  }

  let level = null;
  for (const name of roleNames) {
    const candidate = ROLE_LEVELS[name];
    if (candidate && (!level || LEVEL_ORDER[candidate] > LEVEL_ORDER[level])) {
      level = candidate;
    }
  }
  if (!level) return { level: null };
  return { level, ...collectUnitIds(user?.units || []) };
};