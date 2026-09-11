import {
  ADMIN_ROLE_NAMES,
  DOSEN_ROLE_NAMES,
  PIMPINAN_ROLE_NAMES,
} from "../constants/roles";

const label = (value) => (value == null ? "" : String(value).trim());

const prodiName = (prodi) =>
  label(prodi?.nama_singkat) ||
  label(prodi?.nama_resmi) ||
  label(prodi?.nama) ||
  label(prodi?.kode_prodi) ||
  label(prodi?.kode);

const unitName = (unit) => {
  if (!unit) return "";
  if (unit.program_studi_id || unit.program_studi)
    return prodiName(unit.program_studi);
  if (unit.departemen_id || unit.departemen) {
    return (
      label(unit.departemen?.nama) ||
      label(unit.departemen?.nama_singkat) ||
      label(unit.departemen?.nama_resmi) ||
      label(unit.departemen?.kode)
    );
  }
  if (unit.fakultas_id || unit.fakultas) {
    return (
      label(unit.fakultas?.nama) ||
      label(unit.fakultas?.nama_singkat) ||
      label(unit.fakultas?.nama_resmi) ||
      label(unit.fakultas?.kode)
    );
  }
  return "";
};

const findProdi = (rows, prodiId) => {
  const id = label(prodiId);
  if (!id) return null;
  return (rows?.prodi || []).find((row) => label(row.id) === id) || null;
};

const roleNames = (user) => {
  const names = new Set(
    (user?.roles || []).map((role) => role?.name || role).filter(Boolean),
  );
  if (user?.role) names.add(user.role);
  return names;
};

export const isMahasiswaAccount = (user) =>
  Boolean(
    user?.mahasiswa_id || user?.mahasiswa || roleNames(user).has("mahasiswa"),
  );

const SCOPED_LEVELS = new Set(["prodi", "departemen", "fakultas"]);

/**
 * Akun dosen murni: unitnya diambil dari data dosennya sendiri, sama seperti
 * mahasiswa. Akun admin/pimpinan dan akun ber-scope organisasi dikecualikan
 * supaya unit yang tampil tetap unit yang dikelolanya.
 */
export const isDosenAccount = (user) => {
  if (!user || isMahasiswaAccount(user)) return false;
  const names = roleNames(user);
  if (
    [...names].some(
      (name) => ADMIN_ROLE_NAMES.has(name) || PIMPINAN_ROLE_NAMES.has(name),
    )
  ) {
    return false;
  }
  if (SCOPED_LEVELS.has(user.org_scope?.level)) return false;
  return Boolean(
    user.dosen_id || [...names].some((name) => DOSEN_ROLE_NAMES.has(name)),
  );
};

export const accountUnitInfo = (user, rows) => {
  if (!user) return { label: "Unit", value: "Belum login", tone: "muted" };

  if (isMahasiswaAccount(user)) {
    const prodi =
      user.mahasiswa?.programStudi ||
      user.mahasiswa?.program_studi ||
      findProdi(rows, user.mahasiswa?.program_studi_id);
    return {
      label: "Prodi",
      value: prodiName(prodi) || "Prodi belum ditetapkan",
      tone: prodi ? "default" : "warning",
    };
  }

  if (user.org_scope?.level === "universitas") {
    return { label: "Unit", value: "Universitas Andalas", tone: "default" };
  }

  const names = [...new Set((user.units || []).map(unitName).filter(Boolean))];
  if (names.length === 1)
    return { label: "Unit", value: names[0], tone: "default" };
  if (names.length > 1)
    return {
      label: "Unit",
      value: `${names.length} unit: ${names.slice(0, 2).join(", ")}${names.length > 2 ? ", ..." : ""}`,
      tone: "default",
    };

  if (isDosenAccount(user)) {
    const prodi =
      user.dosen?.programStudi || findProdi(rows, user.dosen?.program_studi_id);
    return {
      label: "Prodi",
      value: prodiName(prodi) || "Prodi belum ditetapkan",
      tone: prodi ? "default" : "warning",
    };
  }

  return { label: "Unit", value: "Unit belum ditetapkan", tone: "warning" };
};
