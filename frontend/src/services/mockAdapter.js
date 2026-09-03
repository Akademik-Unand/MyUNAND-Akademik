import {
  CPMK_DETAIL,
  CPMK_KURIKULUM,
  DEPARTEMEN,
  FAKULTAS,
  DOKUMEN_EVALUASI,
  EVALUASI_CPMK,
  EVALUASI_NILAI_PESERTA,
  JENIS_DOKUMEN_EVALUASI,
  JENIS_SEMESTER,
  JENJANG_AKADEMIK,
  KELAS,
  KELAS_PESERTA,
  KURIKULUM_CP,
  KURIKULUM_LIST,
  LAPORAN_CP,
  MK_SEMESTER,
  MK_SEMESTER_DETAIL_CPMK,
  MK_TRANSKRIP,
  NILAI_KELAS,
  PRODI,
  REKAP_CP_ROWS,
  SETTING_SEMESTER,
  UPLOAD_HISTORY,
  UPLOAD_NILAI,
} from '../constants/mockData';
import { applyQuery } from '../utils/queryRows';

const LATENCY_MS = 400;

/**
 * Setiap resource punya salinan data yang bisa dimutasi, daftar kolom yang
 * boleh dicari, dan kunci primernya. Bentuknya sengaja dibuat seperti tabel
 * di backend supaya perpindahan ke API asli tinggal mengganti adapter.
 */
const buildResource = (rows, { idKey, searchable }) => ({
  idKey,
  searchable,
  rows: rows.map((row) => ({ ...row })),
});

const resources = {
  fakultas: buildResource(FAKULTAS, {
    idKey: 'kode',
    searchable: ['kode', 'nama', 'singkat', 'universitas'],
  }),
  departemen: buildResource(DEPARTEMEN, { idKey: 'kode', searchable: ['kode', 'nama'] }),
  prodi: buildResource(PRODI, {
    idKey: 'kode',
    searchable: ['kode', 'nama', 'singkat', 'jenjang', 'fakultas', 'departemen'],
  }),
  'jenjang-akademik': buildResource(JENJANG_AKADEMIK, {
    idKey: 'kode',
    searchable: ['kode', 'nama'],
  }),
  'jenis-semester': buildResource(JENIS_SEMESTER, {
    idKey: 'no',
    searchable: ['kategori', 'periode', 'label', 'singkat'],
  }),
  'setting-semester': buildResource(SETTING_SEMESTER, {
    idKey: 'id',
    searchable: ['tahun', 'semester', 'status'],
  }),
  kurikulum: buildResource(KURIKULUM_LIST, {
    idKey: 'id',
    searchable: ['nama', 'prodi', 'tahun', 'skRektor'],
  }),
  'cpmk-kurikulum': buildResource(CPMK_KURIKULUM, {
    idKey: 'kode',
    searchable: ['kode', 'nama'],
  }),
  'mk-semester': buildResource(MK_SEMESTER, { idKey: 'kode', searchable: ['kode', 'nama'] }),
  'mk-transkrip': buildResource(MK_TRANSKRIP, { idKey: 'kode', searchable: ['kode', 'nama'] }),
  kelas: buildResource(KELAS, {
    idKey: 'kode',
    searchable: ['kode', 'mataKuliah', 'prodi', 'semester'],
  }),
  'kelas-peserta': buildResource(KELAS_PESERTA, { idKey: 'bp', searchable: ['bp', 'nama'] }),
  'upload-nilai': buildResource(UPLOAD_NILAI, {
    idKey: 'kelas',
    searchable: ['kelas', 'mataKuliah', 'prodi', 'semester'],
  }),
  'upload-history': buildResource(UPLOAD_HISTORY, {
    idKey: 'id',
    searchable: ['kelas', 'mataKuliah', 'pengunggah', 'status'],
  }),
  'nilai-kelas': buildResource(NILAI_KELAS, { idKey: 'bp', searchable: ['bp', 'nama'] }),
  'rekap-cp': buildResource(REKAP_CP_ROWS, {
    idKey: 'id',
    searchable: ['mahasiswa', 'bp', 'mk', 'kelas', 'cp', 'cpmk'],
  }),
  'laporan-cp': buildResource(LAPORAN_CP, {
    idKey: 'id',
    searchable: ['nama', 'keterangan', 'dibuatOleh'],
  }),
  'kurikulum-cp': buildResource(KURIKULUM_CP, { idKey: 'kode', searchable: ['kode', 'deskripsi'] }),
  'cpmk-detail': buildResource(CPMK_DETAIL, { idKey: 'nama', searchable: ['nama', 'deskripsi'] }),
  'cpmk-semester': buildResource(MK_SEMESTER_DETAIL_CPMK, {
    idKey: 'nama',
    searchable: ['nama', 'deskripsi'],
  }),
  'evaluasi-cpmk': buildResource(EVALUASI_CPMK, { idKey: 'id', searchable: ['cpmk', 'cpl', 'evaluasi'] }),
  'evaluasi-nilai': buildResource(EVALUASI_NILAI_PESERTA, { idKey: 'bp', searchable: ['bp', 'nama'] }),
  'dokumen-evaluasi': buildResource(DOKUMEN_EVALUASI, {
    idKey: 'id',
    searchable: ['nama', 'keterangan', 'berkas', 'uploader'],
  }),
  'jenis-dokumen': buildResource(JENIS_DOKUMEN_EVALUASI, {
    idKey: 'no',
    searchable: ['nama', 'tipe', 'keterangan', 'status'],
  }),
};

/** Mendaftarkan resource tambahan dari luar file ini (dipakai modul MK Semester). */
export const registerResource = (name, rows, options) => {
  resources[name] = buildResource(rows, options);
};

const getResource = (name) => {
  const resource = resources[name];
  if (!resource) throw new Error(`Resource "${name}" belum terdaftar di mock adapter.`);
  return resource;
};

const delay = (ms = LATENCY_MS) => new Promise((resolve) => setTimeout(resolve, ms));

const normalize = (value) => (value === null || value === undefined ? '' : String(value));

/**
 * Kontrak yang sama dengan backend: page, limit, search, sortBy, sortOrder,
 * dan filter[field]. Balasannya selalu { data, meta }.
 */
export const listResource = async (resource, params = {}) => {
  const { rows, searchable } = getResource(resource);
  await delay();
  return applyQuery(rows, params, searchable);
};

export const getResourceRows = async (resource) => {
  await delay();
  return getResource(resource).rows.map((row) => ({ ...row }));
};

export const createResourceItem = async (resource, payload) => {
  const target = getResource(resource);
  await delay(250);
  const item = { ...payload };
  if (!item[target.idKey]) item[target.idKey] = `${Date.now()}`;
  target.rows = [item, ...target.rows];
  return item;
};

export const updateResourceItem = async (resource, id, payload) => {
  const target = getResource(resource);
  await delay(250);
  target.rows = target.rows.map((row) =>
    normalize(row[target.idKey]) === normalize(id) ? { ...row, ...payload } : row
  );
  return target.rows.find((row) => normalize(row[target.idKey]) === normalize(id));
};

export const deleteResourceItem = async (resource, id) => {
  const target = getResource(resource);
  await delay(250);
  target.rows = target.rows.filter((row) => normalize(row[target.idKey]) !== normalize(id));
  return { id };
};

/** Mengganti seluruh isi resource, dipakai aksi massal seperti "aktifkan semester". */
export const replaceResourceRows = async (resource, rows) => {
  const target = getResource(resource);
  await delay(250);
  target.rows = rows.map((row) => ({ ...row }));
  return target.rows;
};

const MOCK_USER = {
  id: 1,
  name: 'Jonas S.',
  email: 'admin@unand.ac.id',
  role: 'Administrator',
  faculty: 'Fakultas Teknik',
  university: 'Universitas Andalas',
};

const authResult = (user) => ({
  access_token: 'mock-token',
  token_type: 'Bearer',
  user,
});

export const loginWithPassword = async ({ username, password }) => {
  await delay(400);
  if (!String(username || '').trim() || !password) {
    const err = new Error('Username dan kata sandi wajib diisi.');
    throw err;
  }
  const name = String(username).trim();
  return authResult({
    ...MOCK_USER,
    name: name.includes('@') ? MOCK_USER.name : name,
    email: name.includes('@') ? name : MOCK_USER.email,
  });
};

export const loginWithSso = async () => {
  await delay(500);
  return authResult({
    ...MOCK_USER,
    name: 'Pengguna SSO',
    email: 'sso@unand.ac.id',
    role: 'Dosen',
  });
};

export const updateProfile = async (payload) => {
  await delay(300);
  return { ...payload };
};

export const changePassword = async ({ currentPassword, newPassword, confirmPassword }) => {
  await delay(300);
  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new Error('Semua kolom kata sandi wajib diisi.');
  }
  if (newPassword.length < 6) {
    throw new Error('Kata sandi baru minimal 6 karakter.');
  }
  if (newPassword !== confirmPassword) {
    throw new Error('Konfirmasi kata sandi tidak sama.');
  }
  return { ok: true };
};

