export const formatCapaian = (value) => {
  if (value === null || value === undefined || value === '') return '%';
  return `${value}%`;
};

export const formatPercent = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  return `${value}%`;
};

export const mkSemesterLabel = (row) => {
  const mk = row.matakuliah_nama || '—';
  const sem = row.semester_label?.trim();
  return sem ? `${mk} — ${sem}` : mk;
};

export const buildCheckActions = (rows = []) => {
  const semesters = [];
  const seen = new Set();
  for (const row of rows) {
    if (!row.semester_id || seen.has(row.semester_id)) continue;
    seen.add(row.semester_id);
    semesters.push({ id: row.semester_id, label: row.semester_label?.trim() || 'Semester' });
  }
  const actions = [
    { key: 'all', label: 'Check All', match: () => true },
    ...semesters.map((item) => ({
      key: `semester:${item.id}`,
      label: `Check All Semester ${item.label}`,
      match: (row) => row.semester_id === item.id,
    })),
    { key: 'transkrip', label: 'Check All MK Transkrip', match: (row) => row.is_transkrip },
    ...semesters.map((item) => ({
      key: `transkrip:${item.id}`,
      label: `Check All MK Transkrip Semester ${item.label}`,
      match: (row) => row.is_transkrip && row.semester_id === item.id,
    })),
  ];
  return actions.filter((action) => action.key === 'all' || rows.some(action.match));
};

export const applyMatchingInGroup = (selected, groupRows, match) => {
  const next = new Set(selected);
  for (const row of groupRows) {
    if (match(row)) next.add(row.id);
    else next.delete(row.id);
  }
  return next;
};

export const activeCheckActionKey = (selected, groupRows, actions) => {
  const selectedIds = new Set(groupRows.filter((row) => selected.has(row.id)).map((row) => row.id));
  if (!selectedIds.size) return null;
  for (let i = actions.length - 1; i >= 0; i -= 1) {
    const matchIds = groupRows.filter(actions[i].match).map((row) => row.id);
    if (!matchIds.length || matchIds.length !== selectedIds.size) continue;
    if (matchIds.every((id) => selectedIds.has(id))) return actions[i].key;
  }
  return null;
};

export const toggleMatching = (selected, rows, match) => {
  const ids = rows.filter(match).map((row) => row.id);
  const allOn = ids.length > 0 && ids.every((id) => selected.has(id));
  const next = new Set(selected);
  for (const id of ids) {
    if (allOn) next.delete(id);
    else next.add(id);
  }
  return next;
};

export const itemsFromSelected = (rows, selected) =>
  rows
    .filter((row) => selected.has(row.id))
    .map((row) => ({
      cpmk_id: row.cpmk_id,
      matakuliah_id: row.matakuliah_id,
      semester_id: row.semester_id || null,
    }));

export const selectedFromItems = (items = []) =>
  new Set(
    items.map((item) => `${item.cpmk_id}:${item.matakuliah_id}:${item.semester_id || 'none'}`)
  );

export const averageCapaian = (rows = []) => {
  const values = rows.map((row) => row.capaian).filter((value) => value != null && value !== '');
  if (!values.length) return null;
  const sum = values.reduce((total, value) => total + Number(value), 0);
  return Math.round((sum / values.length) * 100) / 100;
};

export const withGroupedCapaian = (rows = []) => {
  const byScp = new Map();
  const byCp = new Map();
  for (const row of rows) {
    const scp = `${row.cp_id}\u001f${row.scp_id}`;
    if (!byScp.has(scp)) byScp.set(scp, []);
    byScp.get(scp).push(row);
    if (!byCp.has(row.cp_id)) byCp.set(row.cp_id, []);
    byCp.get(row.cp_id).push(row);
  }
  const scpAvg = new Map([...byScp.entries()].map(([key, list]) => [key, averageCapaian(list)]));
  const cpAvg = new Map([...byCp.entries()].map(([key, list]) => [key, averageCapaian(list)]));
  return rows.map((row) => ({
    ...row,
    capaian_scp: scpAvg.get(`${row.cp_id}\u001f${row.scp_id}`) ?? null,
    capaian_cp: cpAvg.get(row.cp_id) ?? null,
  }));
};

export const TINDAK_LANJUT_UNIT = [
  { key: 'team_teaching', label: 'Team Teaching' },
  { key: 'prodi', label: 'Prodi' },
  { key: 'jurusan', label: 'Jurusan' },
  { key: 'fakultas', label: 'Fakultas' },
];
