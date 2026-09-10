const EMPTY_CONTEXT = Object.freeze({ fakultasId: '', departemenId: '', prodiId: '' });

export const emptyOrganizationContext = () => ({ ...EMPTY_CONTEXT });

export const organizationUserKey = (user) => (user?.id == null ? '' : String(user.id));

const id = (value) => (value == null ? '' : String(value));
const has = (rows, value) => !value || rows.some((row) => id(row.id) === id(value));

export const organizationRowLabel = (row, level) => {
  if (!row) return '';
  if (level === 'fakultas') return row.nama_resmi || row.nama_singkat || row.kode_fakultas || id(row.id);
  if (level === 'departemen') return row.nama_resmi || row.nama_singkat || row.kode_departemen || id(row.id);
  return row.nama_singkat || row.nama_resmi || row.nama || row.kode_prodi || id(row.id);
};

export const reconcileOrganizationContext = (context, rows) => {
  const current = { ...EMPTY_CONTEXT, ...(context || {}) };
  const fakultasRows = rows?.fakultas || [];
  const departemenRows = rows?.departemen || [];
  const prodiRows = rows?.prodi || [];

  const fakultasId = has(fakultasRows, current.fakultasId) ? id(current.fakultasId) : '';
  const departemen = departemenRows.find((row) => id(row.id) === id(current.departemenId));
  const departemenId = departemen && (!fakultasId || id(departemen.fakultas_id) === fakultasId) ? id(departemen.id) : '';
  const prodi = prodiRows.find((row) => id(row.id) === id(current.prodiId));
  const prodiMatches = prodi &&
    (!fakultasId || id(prodi.fakultas_id || prodi.departemen?.fakultas_id) === fakultasId) &&
    (!departemenId || id(prodi.departemen_id) === departemenId);

  return { fakultasId, departemenId, prodiId: prodiMatches ? id(prodi.id) : '' };
};

export const updateOrganizationDraft = (context, field, value) => {
  const next = { ...EMPTY_CONTEXT, ...(context || {}), [field]: id(value) };
  if (field === 'fakultasId') return { ...next, departemenId: '', prodiId: '' };
  if (field === 'departemenId') return { ...next, prodiId: '' };
  return next;
};

export const organizationContextLabel = (context, rows) => {
  const levels = [
    ['prodi', context?.prodiId, rows?.prodi],
    ['departemen', context?.departemenId, rows?.departemen],
    ['fakultas', context?.fakultasId, rows?.fakultas],
  ];
  for (const [level, selectedId, candidates = []] of levels) {
    const row = candidates.find((item) => id(item.id) === id(selectedId));
    if (row) return organizationRowLabel(row, level);
  }
  return 'Pilih unit';
};
