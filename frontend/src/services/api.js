import { env } from '../config/env';
import * as mock from './mockAdapter';
import { apiRequest } from './http';

/**
 * Satu pintu akses data. Selama VITE_USE_MOCK belum dimatikan, semua panggilan
 * diarahkan ke mock adapter yang meniru kontrak REST backend. Saat API asli
 * siap, cabang non-mock memakai /api/v1 tanpa mengubah halaman.
 */

export const listResource = (resource, params) =>
  env.useMock ? mock.listResource(resource, params) : apiRequest(`/${resource}`, { params });

export const getResourceRows = (resource) =>
  env.useMock
    ? mock.getResourceRows(resource)
    : apiRequest(`/${resource}`, { params: { page: 1, limit: 200 } }).then((result) =>
      Array.isArray(result) ? result : result?.data || []
    );

export const createResourceItem = (resource, payload) =>
  env.useMock ? mock.createResourceItem(resource, payload) : apiRequest(`/${resource}`, { method: 'POST', body: payload });

export const updateResourceItem = (resource, id, payload) =>
  env.useMock
    ? mock.updateResourceItem(resource, id, payload)
    : apiRequest(`/${resource}/${id}`, { method: 'PUT', body: payload });

export const deleteResourceItem = (resource, id) =>
  env.useMock ? mock.deleteResourceItem(resource, id) : apiRequest(`/${resource}/${id}`, { method: 'DELETE' });

export const replaceResourceRows = (resource, rows) =>
  env.useMock ? mock.replaceResourceRows(resource, rows) : Promise.reject(new Error('Replace massal hanya tersedia di mode mock.'));

export const loginWithPassword = (payload) =>
  env.useMock
    ? mock.loginWithPassword(payload)
    : apiRequest('/auth/login', {
      method: 'POST',
      body: { email: payload.email || payload.username, password: payload.password },
    });

export const loginWithSso = () => (env.useMock ? mock.loginWithSso() : Promise.reject(new Error('SSO belum tersedia di API.')));

export const updateProfile = (payload) =>
  env.useMock ? mock.updateProfile(payload) : apiRequest('/auth/profile', { method: 'PUT', body: payload });

export const changePassword = (payload) =>
  env.useMock ? mock.changePassword(payload) : apiRequest('/auth/change-password', { method: 'PUT', body: payload });

export const getCurrentUser = () =>
  env.useMock ? mock.getCurrentUser() : apiRequest('/auth/me');

export const assignUserRoles = (userId, roleIds) =>
  env.useMock
    ? mock.assignUserRoles(userId, roleIds)
    : apiRequest(`/users/${userId}/roles`, { method: 'PUT', body: { role_ids: roleIds } });

export const getRolePermissionMatrix = () =>
  env.useMock ? mock.getRolePermissionMatrix() : apiRequest('/roles/matrix');

export const syncRolePermissions = (roleId, permissionIds) =>
  env.useMock
    ? mock.syncRolePermissions(roleId, permissionIds)
    : apiRequest(`/roles/${roleId}/permissions`, { method: 'PUT', body: { permission_ids: permissionIds } });
