export const EMPTY_ACADEMIC_FILTER = {
  fakultasId: '',
  departemenId: '',
  prodiId: '',
  kurikulumId: '',
  semesterId: '',
};

const DEPENDENTS = {
  fakultasId: ['departemenId', 'prodiId', 'kurikulumId', 'semesterId'],
  departemenId: ['prodiId', 'kurikulumId', 'semesterId'],
  prodiId: ['kurikulumId', 'semesterId'],
  kurikulumId: [],
  semesterId: [],
};

const KEY_TO_STATE = {
  fakultas: 'fakultasId',
  departemen: 'departemenId',
  prodi: 'prodiId',
  kurikulum: 'kurikulumId',
  semester: 'semesterId',
};

export const applyAcademicField = (draft, key, value) => {
  const next = { ...draft, [key]: value };
  for (const child of DEPENDENTS[key] || []) {
    next[child] = '';
  }
  return next;
};

export const isAcademicDraftReady = (draft = EMPTY_ACADEMIC_FILTER) =>
  Object.values(draft).some(Boolean);

export const toAcademicExtraFilter = (applied = EMPTY_ACADEMIC_FILTER, keys = []) => {
  const include = new Set(keys);
  const filter = {};
  const allow = (name) => include.size === 0 || include.has(name);

  if (allow('kurikulum') && applied.kurikulumId) filter.kurikulum_id = applied.kurikulumId;
  else if (allow('prodi') && applied.prodiId) filter.program_studi_id = applied.prodiId;
  else if (allow('departemen') && applied.departemenId) filter.departemen_id = applied.departemenId;
  else if (allow('fakultas') && applied.fakultasId) filter.fakultas_id = applied.fakultasId;

  if (allow('semester') && applied.semesterId) filter.semester_id = applied.semesterId;

  return Object.keys(filter).length ? filter : undefined;
};

const toOptions = (rows, getLabel) =>
  (rows || []).map((row) => ({ value: row.id, label: getLabel(row) }));

const idSet = (ids) => new Set(ids || []);

/** Nilai awal field filter yang terkunci oleh scope organisasi user ('' bila multi-unit). */
export const academicScopeLock = (scope = {}) => {
  if (!scope?.level || scope.level === 'universitas') {
    return { fakultasId: '', departemenId: '', prodiId: '' };
  }
  const single = (ids) => (ids?.length === 1 ? ids[0] : '');
  if (scope.level === 'fakultas') {
    return { fakultasId: single(scope.fakultas_ids), departemenId: '', prodiId: '' };
  }
  if (scope.level === 'departemen') {
    return { fakultasId: '', departemenId: single(scope.departemen_ids), prodiId: '' };
  }
  return { fakultasId: '', departemenId: '', prodiId: single(scope.prodi_ids) };
};

export const cascadeAcademicOptions = (rows, draft = EMPTY_ACADEMIC_FILTER, scope = {}) => {
  const fakultasIds = idSet(scope.fakultas_ids);
  const departemenIds = idSet(scope.departemen_ids);
  const prodiIds = idSet(scope.prodi_ids);

  const fakultasRows =
    scope.level === 'fakultas'
      ? (rows.fakultas || []).filter((row) => fakultasIds.has(row.id))
      : rows.fakultas || [];

  const departemenRows = (rows.departemen || []).filter((row) => {
    if (draft.fakultasId && row.fakultas_id !== draft.fakultasId) return false;
    if (scope.level === 'departemen' && !departemenIds.has(row.id)) return false;
    if (scope.level === 'prodi' && departemenIds.size && !departemenIds.has(row.id)) return false;
    return true;
  });

  const prodiRows = (rows.prodi || []).filter((row) => {
    if (draft.departemenId && row.departemen_id !== draft.departemenId) return false;
    if (draft.fakultasId && !draft.departemenId) {
      if (row.fakultas_id !== draft.fakultasId && row.departemen?.fakultas_id !== draft.fakultasId) {
        return false;
      }
    }
    if (scope.level === 'prodi' && !prodiIds.has(row.id)) return false;
    if (scope.level === 'departemen' && !departemenIds.has(row.departemen_id)) return false;
    return true;
  });

  const kurikulumRows = (rows.kurikulum || []).filter((row) => {
    if (draft.prodiId && row.program_studi_id !== draft.prodiId) return false;
    if (!draft.prodiId && scope.level === 'prodi' && !prodiIds.has(row.program_studi_id)) return false;
    return true;
  });

  return {
    fakultas: toOptions(fakultasRows, (row) => row.nama_resmi || row.nama_singkat || row.kode_fakultas),
    departemen: toOptions(departemenRows, (row) => row.nama_resmi || row.nama_singkat || row.kode_departemen),
    prodi: toOptions(prodiRows, (row) => row.nama_resmi || row.kode_prodi),
    kurikulum: toOptions(kurikulumRows, (row) => row.nama || String(row.tahun || row.id)),
    semester: toOptions(
      rows.semester,
      (row) => `${row.jenisSemester?.nama || row.jenisSemester?.alias || 'Semester'} ${row.tahun}`
    ),
  };
};

export const academicFieldEnabled = {
  fakultas: () => true,
  departemen: (draft) => Boolean(draft.fakultasId),
  prodi: (draft) => Boolean(draft.departemenId),
  kurikulum: (draft) => Boolean(draft.prodiId),
  semester: (draft) => Boolean(draft.prodiId),
};

const PLACEHOLDERS = {
  fakultas: 'Pilih Fakultas',
  departemen: 'Pilih Departemen',
  prodi: 'Pilih Prodi',
  kurikulum: 'Pilih Kurikulum',
  semester: 'Pilih Semester',
};

const DISABLED_HINT = {
  departemen: 'Pilih fakultas dulu',
  prodi: 'Pilih departemen dulu',
  kurikulum: 'Pilih prodi dulu',
  semester: 'Pilih prodi dulu',
};

// Field yang dikunci (disabled) penuh oleh scope user.
const SCOPED_DISABLED = {
  fakultas: ['departemen', 'prodi'],
  departemen: ['prodi'],
};

const SCOPED_PLACEHOLDER = 'Sesuai unit Anda';

export const buildAcademicFilterFields = ({ keys, draft, options, onChange, scope }) => {
  const lock = academicScopeLock(scope);
  return keys.map((key) => {
    const stateKey = KEY_TO_STATE[key];
    const cascadeEnabled = academicFieldEnabled[key]?.(draft) ?? true;
    const scopeDisabled = (SCOPED_DISABLED[key] || []).includes(scope?.level);
    // Field pada level scope user sendiri tetap aktif walau belum ada pilihan induk (unit sudah dibatasi).
    const selfScoped = key === scope?.level;
    const enabled = !scopeDisabled && (cascadeEnabled || selfScoped);
    const lockedValue = lock[stateKey] || '';
    return {
      name: stateKey,
      label: PLACEHOLDERS[key]?.replace('Pilih ', '') || key,
      placeholder: !enabled ? (scopeDisabled ? SCOPED_PLACEHOLDER : DISABLED_HINT[key]) : PLACEHOLDERS[key],
      options: enabled ? options[key] || [] : [],
      value: enabled ? (lockedValue || draft[stateKey] || '') : '',
      disabled: !enabled,
      onChange: (e) => onChange(stateKey, e.target.value),
    };
  });
};

export const ACADEMIC_STATE_KEYS = KEY_TO_STATE;
