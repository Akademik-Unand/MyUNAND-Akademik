import { isDosenAccount, isMahasiswaAccount } from "./accountUnit";

const EMPTY_CONTEXT = Object.freeze({
  fakultasId: "",
  departemenId: "",
  prodiId: "",
});

export const emptyOrganizationContext = () => ({ ...EMPTY_CONTEXT });

export const organizationUserKey = (user) =>
  user?.id == null ? "" : String(user.id);

const id = (value) => (value == null ? "" : String(value));
const has = (rows, value) =>
  !value || rows.some((row) => id(row.id) === id(value));

export const organizationRowLabel = (row, level) => {
  if (!row) return "";
  if (level === "fakultas")
    return (
      row.nama_resmi || row.nama_singkat || row.kode_fakultas || id(row.id)
    );
  if (level === "departemen")
    return (
      row.nama_resmi || row.nama_singkat || row.kode_departemen || id(row.id)
    );
  return (
    row.nama_singkat ||
    row.nama_resmi ||
    row.nama ||
    row.kode_prodi ||
    id(row.id)
  );
};

export const reconcileOrganizationContext = (context, rows) => {
  const current = { ...EMPTY_CONTEXT, ...(context || {}) };
  const fakultasRows = rows?.fakultas || [];
  const departemenRows = rows?.departemen || [];
  const prodiRows = rows?.prodi || [];

  const fakultasId = has(fakultasRows, current.fakultasId)
    ? id(current.fakultasId)
    : "";
  const departemen = departemenRows.find(
    (row) => id(row.id) === id(current.departemenId),
  );
  const departemenId =
    departemen && (!fakultasId || id(departemen.fakultas_id) === fakultasId)
      ? id(departemen.id)
      : "";
  const prodi = prodiRows.find((row) => id(row.id) === id(current.prodiId));
  const prodiMatches =
    prodi &&
    (!fakultasId ||
      id(prodi.fakultas_id || prodi.departemen?.fakultas_id) === fakultasId) &&
    (!departemenId || id(prodi.departemen_id) === departemenId);

  return {
    fakultasId,
    departemenId,
    prodiId: prodiMatches ? id(prodi.id) : "",
  };
};

/**
 * Batasi baris prodi sesuai filter unit yang sedang aktif.
 * Role ber-scope prodi hanya melihat prodinya sendiri; scope fakultas/departemen
 * melihat seluruh prodi di bawahnya.
 */
export const filterProdiByScope = (
  prodiRows = [],
  { fakultasId = "", departemenId = "", prodiId = "", scoped = false } = {},
) =>
  prodiRows.filter((row) => {
    if (scoped && prodiId) return id(row.id) === id(prodiId);
    if (departemenId) return id(row.departemen_id) === id(departemenId);
    const parentFakultasId = row.fakultas_id || row.departemen?.fakultas_id;
    if (fakultasId) return id(parentFakultasId) === id(fakultasId);
    return true;
  });

/**
 * Unit mahasiswa ditentukan oleh datanya sendiri (kolom prodi di tabel
 * `mahasiswa`), bukan dari master fakultas/departemen/prodi — akun mahasiswa
 * memang tidak diberi izin membaca master tersebut. Konteks ini terkunci.
 */
export const contextFromStudent = (user) => {
  if (!isMahasiswaAccount(user)) return null;
  const prodi = user?.mahasiswa?.programStudi || {};
  return {
    fakultasId: id(prodi.fakultas_id),
    departemenId: id(prodi.departemen_id),
    prodiId: id(user?.mahasiswa?.program_studi_id || prodi.id),
  };
};

/** Label prodi untuk keterangan unit akun mahasiswa. */
export const studentUnitLabel = (user) =>
  organizationRowLabel(user?.mahasiswa?.programStudi, "prodi") ||
  "Prodi belum ditetapkan";

/**
 * Unit dosen juga ditentukan oleh datanya sendiri (prodi pada tabel `dosen`),
 * bukan dari master unit — role dosen tidak diberi izin membacanya.
 */
export const contextFromDosen = (user) => {
  if (!isDosenAccount(user)) return null;
  const prodi = user?.dosen?.programStudi || {};
  return {
    fakultasId: id(prodi.fakultas_id),
    departemenId: id(prodi.departemen_id),
    prodiId: id(user?.dosen?.program_studi_id || prodi.id),
  };
};

/** Label prodi untuk keterangan unit akun dosen. */
export const dosenUnitLabel = (user) =>
  organizationRowLabel(user?.dosen?.programStudi, "prodi") ||
  "Prodi belum ditetapkan";

export const updateOrganizationDraft = (context, field, value) => {
  const next = { ...EMPTY_CONTEXT, ...(context || {}), [field]: id(value) };
  if (field === "fakultasId") return { ...next, departemenId: "", prodiId: "" };
  if (field === "departemenId") return { ...next, prodiId: "" };
  return next;
};

export const organizationContextLabel = (context, rows) => {
  const levels = [
    ["prodi", context?.prodiId, rows?.prodi],
    ["departemen", context?.departemenId, rows?.departemen],
    ["fakultas", context?.fakultasId, rows?.fakultas],
  ];
  for (const [level, selectedId, candidates = []] of levels) {
    const row = candidates.find((item) => id(item.id) === id(selectedId));
    if (row) return organizationRowLabel(row, level);
  }
  return "Pilih unit";
};
