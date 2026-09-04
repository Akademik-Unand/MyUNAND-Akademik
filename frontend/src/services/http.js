import { env } from '../config/env';

const AUTH_STORAGE_KEY = 'myunand_auth';

const readToken = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw).token : null;
  } catch {
    return null;
  }
};

const toQuery = (params = {}) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    if (key === 'filter' && typeof value === 'object') {
      for (const [field, fieldValue] of Object.entries(value)) {
        if (fieldValue !== undefined && fieldValue !== '') {
          search.append(`filter[${field}]`, String(fieldValue));
        }
      }
      continue;
    }
    search.append(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
};

export const apiRequest = async (path, { method = 'GET', body, params } = {}) => {
  const token = readToken();
  const res = await fetch(`${env.apiBaseUrl}${path}${toQuery(params)}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body != null ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body != null ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.status === 'error') {
    const firstError = Array.isArray(json.error) ? json.error[0]?.message : null;
    throw new Error(firstError || json.message || 'Permintaan gagal');
  }

  if (json.pagination) {
    return { data: json.data, pagination: json.pagination };
  }
  return json.data;
};
