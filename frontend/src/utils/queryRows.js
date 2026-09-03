const normalize = (value) => (value === null || value === undefined ? '' : String(value));

const matchesSearch = (row, search, searchable) => {
  if (!search) return true;
  const needle = search.toLowerCase();
  const fields = searchable?.length ? searchable : Object.keys(row);
  return fields.some((field) => normalize(row[field]).toLowerCase().includes(needle));
};

const matchesFilters = (row, filter) =>
  Object.entries(filter).every(([field, value]) => {
    if (value === '' || value === undefined || value === null) return true;
    return normalize(row[field]).toLowerCase() === normalize(value).toLowerCase();
  });

const compare = (a, b) => {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return normalize(a).localeCompare(normalize(b), 'id', { numeric: true, sensitivity: 'base' });
};

/**
 * Menerapkan search, filter, sort, dan pagination pada sekumpulan baris.
 * Dipakai mock adapter maupun DataTable mode klien supaya perilakunya identik
 * dengan yang nanti dikerjakan backend.
 */
export const applyQuery = (rows, params = {}, searchable = []) => {
  const { page = 1, limit = 10, search = '', sortBy = '', sortOrder = 'asc', filter = {} } = params;

  let result = rows.filter(
    (row) => matchesSearch(row, String(search).trim(), searchable) && matchesFilters(row, filter)
  );

  if (sortBy) {
    const direction = sortOrder === 'desc' ? -1 : 1;
    result = [...result].sort((a, b) => compare(a[sortBy], b[sortBy]) * direction);
  }

  const total = result.length;
  const safeLimit = Math.max(1, Number(limit) || 10);
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));
  const safePage = Math.min(Math.max(1, Number(page) || 1), totalPages);
  const start = (safePage - 1) * safeLimit;

  return {
    data: result.slice(start, start + safeLimit),
    pagination: { page: safePage, limit: safeLimit, total, totalPages },
    meta: { page: safePage, limit: safeLimit, total, totalPages },
  };
};
