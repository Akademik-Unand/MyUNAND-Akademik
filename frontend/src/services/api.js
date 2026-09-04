import { apiRequest } from './http';

const RESOURCE_PATH = {
  prodi: '/program-studi',
  'setting-semester': '/semester',
  'kurikulum-cp': '/cp',
  'cpmk-kurikulum': '/cpmk',
  'cpmk-detail': '/cpmk',
  'cpmk-semester': '/cpmk',
  'mk-semester': '/matakuliah-kurikulum',
  'mk-transkrip': '/matakuliah-kurikulum',
  'upload-history': '/history-upload-nilai',
  'nilai-kelas': '/nilai',
  'upload-nilai': '/kelas',
  'kurikulum-scp': '/scp',
  'jenis-dokumen': '/jenis-dokumen-evaluasi',
  'dokumen-evaluasi': '/dokumen-evaluasi',
  'kelas-peserta': '/krs-detil',
  'evaluasi-nilai': '/nilai',
};

const resourcePath = (resource) => RESOURCE_PATH[resource] || `/${resource}`;

export const listResource = (resource, params) =>
  apiRequest(resourcePath(resource), { params });

export const getResourceRows = (resource, params = {}) =>
  apiRequest(resourcePath(resource), { params: { page: 1, limit: 200, ...params } }).then((result) =>
    Array.isArray(result) ? result : result?.data || []
  );

export const getResourceItem = (resource, id) =>
  apiRequest(`${resourcePath(resource)}/${id}`);

export const createResourceItem = (resource, payload) =>
  apiRequest(resourcePath(resource), { method: 'POST', body: payload });

export const updateResourceItem = (resource, id, payload) =>
  apiRequest(`${resourcePath(resource)}/${id}`, { method: 'PUT', body: payload });

export const deleteResourceItem = (resource, id) =>
  apiRequest(`${resourcePath(resource)}/${id}`, { method: 'DELETE' });

export const loginWithPassword = ({ email, password }) =>
  apiRequest('/auth/login', { method: 'POST', body: { email, password } });

export const loginWithSso = () =>
  Promise.reject(new Error('SSO Unand belum tersedia.'));

export const updateProfile = (payload) =>
  apiRequest('/auth/profile', { method: 'PUT', body: { name: payload.name } });

export const changePassword = (payload) =>
  apiRequest('/auth/change-password', {
    method: 'PUT',
    body: {
      current_password: payload.current_password || payload.currentPassword,
      new_password: payload.new_password || payload.newPassword,
    },
  });

export const getCurrentUser = () => apiRequest('/auth/me');

export const getDashboardSummary = () => apiRequest('/dashboard/summary');

export const assignUserRoles = (userId, roleIds) =>
  apiRequest(`/users/${userId}/roles`, { method: 'PUT', body: { role_ids: roleIds } });

export const getRolePermissionMatrix = () => apiRequest('/roles/matrix');

export const syncRolePermissions = (roleId, permissionIds) =>
  apiRequest(`/roles/${roleId}/permissions`, { method: 'PUT', body: { permission_ids: permissionIds } });
