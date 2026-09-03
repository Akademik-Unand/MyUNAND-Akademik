import { env } from '../config/env';
import * as mock from './mockAdapter';

/**
 * Satu pintu akses data. Selama VITE_USE_MOCK belum dimatikan, semua panggilan
 * diarahkan ke mock adapter yang meniru kontrak REST backend. Saat API asli
 * siap, cukup ganti implementasi di cabang `else` tanpa menyentuh halaman.
 */
const notImplemented = () => {
  throw new Error('Klien API asli belum dipasang. Setel VITE_USE_MOCK=true.');
};

export const listResource = (resource, params) =>
  env.useMock ? mock.listResource(resource, params) : notImplemented();

export const getResourceRows = (resource) =>
  env.useMock ? mock.getResourceRows(resource) : notImplemented();

export const createResourceItem = (resource, payload) =>
  env.useMock ? mock.createResourceItem(resource, payload) : notImplemented();

export const updateResourceItem = (resource, id, payload) =>
  env.useMock ? mock.updateResourceItem(resource, id, payload) : notImplemented();

export const deleteResourceItem = (resource, id) =>
  env.useMock ? mock.deleteResourceItem(resource, id) : notImplemented();

export const replaceResourceRows = (resource, rows) =>
  env.useMock ? mock.replaceResourceRows(resource, rows) : notImplemented();

export const loginWithPassword = (payload) =>
  env.useMock ? mock.loginWithPassword(payload) : notImplemented();

export const loginWithSso = () => (env.useMock ? mock.loginWithSso() : notImplemented());

export const updateProfile = (payload) =>
  env.useMock ? mock.updateProfile(payload) : notImplemented();

export const changePassword = (payload) =>
  env.useMock ? mock.changePassword(payload) : notImplemented();
