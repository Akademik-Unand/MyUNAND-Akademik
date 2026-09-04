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

export const cascadeAcademicOptions = (rows, draft = EMPTY_ACADEMIC_FILTER) => {
  const departemenRows = (rows.departemen || []).filter(
    (row) => !draft.fakultasId || row.fakultas_id === draft.fakultasId
  );
  const prodiRows = (rows.prodi || []).filter((row) => {
    if (draft.departemenId) return row.departemen_id === draft.departemenId;
    if (draft.fakultasId) {
      return row.fakultas_id === draft.fakultasId || row.departemen?.fakultas_id === draft.fakultasId;
    }
    return true;
  });
  const kurikulumRows = (rows.kurikulum || []).filter(
    (row) => !draft.prodiId || row.program_studi_id === draft.prodiId
  );

  return {
    fakultas: toOptions(rows.fakultas, (row) => row.nama_resmi || row.nama_singkat || row.kode_fakultas),
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

export const buildAcademicFilterFields = ({ keys, draft, options, onChange }) =>
  keys.map((key) => {
    const stateKey = KEY_TO_STATE[key];
    const enabled = academicFieldEnabled[key]?.(draft) ?? true;
    return {
      name: stateKey,
      label: PLACEHOLDERS[key]?.replace('Pilih ', '') || key,
      placeholder: enabled ? PLACEHOLDERS[key] : DISABLED_HINT[key],
      options: enabled ? options[key] || [] : [],
      value: draft[stateKey] || '',
      disabled: !enabled,
      onChange: (e) => onChange(stateKey, e.target.value),
    };
  });

export const ACADEMIC_STATE_KEYS = KEY_TO_STATE;
