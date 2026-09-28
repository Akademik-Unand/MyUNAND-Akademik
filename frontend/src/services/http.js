import { env } from "../config/env";
import { useAuthStore } from "../store/auth.store";

const AUTH_STORAGE_KEY = "myunand_auth";

const readStoredAuth = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const readToken = () => readStoredAuth()?.token || null;

const toQuery = (params = {}) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (key === "filter" && typeof value === "object") {
      for (const [field, fieldValue] of Object.entries(value)) {
        if (fieldValue !== undefined && fieldValue !== "") {
          search.append(`filter[${field}]`, String(fieldValue));
        }
      }
      continue;
    }
    search.append(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
};

const redirectToLogin = () => {
  useAuthStore.getState().logout();
  if (window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
};

const AUTH_SKIP_REFRESH = new Set([
  "/auth/login",
  "/auth/refresh",
  "/auth/logout",
]);

let refreshInFlight = null;

const requestRefresh = async () => {
  const refreshToken =
    useAuthStore.getState().refreshToken || readStoredAuth()?.refreshToken;
  if (!refreshToken) return null;

  const res = await fetch(`${env.apiBaseUrl}/auth/refresh`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.status === "error" || !json.data?.access_token)
    return null;

  const store = useAuthStore.getState();
  store.setTokens(json.data.access_token, json.data.refresh_token);
  if (json.data.user) store.setUser(json.data.user);
  return json.data.access_token;
};

const refreshAccessToken = () => {
  if (!refreshInFlight) {
    refreshInFlight = requestRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
};

export const apiRequest = async (
  path,
  { method = "GET", body, params, responseType = "json" } = {},
  isRetry = false,
) => {
  const token = readToken();
  const res = await fetch(`${env.apiBaseUrl}${path}${toQuery(params)}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body != null ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body != null ? JSON.stringify(body) : undefined,
  });

  const json = responseType === "blob" ? null : await res.json().catch(() => ({}));
  if (res.status === 401 && !AUTH_SKIP_REFRESH.has(path) && !isRetry) {
    const nextToken = await refreshAccessToken();
    if (nextToken) {
      return apiRequest(path, { method, body, params, responseType }, true);
    }
    redirectToLogin();
  }

  if (!res.ok || json?.status === "error") {
    const errorBody = json || await res.clone().json().catch(() => ({}));
    const firstError = Array.isArray(errorBody.error)
      ? errorBody.error[0]?.message
      : null;
    throw new Error(firstError || errorBody.message || "Permintaan gagal");
  }

  if (responseType === "blob") {
    return { blob: await res.blob(), disposition: res.headers.get("content-disposition") };
  }
  if (json.pagination) {
    return { data: json.data, pagination: json.pagination };
  }
  return json.data;
};
