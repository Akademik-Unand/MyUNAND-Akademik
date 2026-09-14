import { createContext, useContext, useEffect, useMemo } from "react";
import { useAuthStore } from "../store/auth.store";
import { useOrganizationContextStore } from "../store/organizationContext.store";
import { useOrganizationOptions } from "../hooks/useOrganizationOptions";
import {
  contextFromDosen,
  contextFromStudent,
  dosenUnitLabel,
  emptyOrganizationContext,
  organizationContextLabel,
  organizationUserKey,
  reconcileOrganizationContext,
  studentUnitLabel,
} from "../helpers/organizationContext";

const SCOPED_LEVELS = new Set(["prodi", "departemen", "fakultas"]);

const OrganizationContext = createContext(null);
const sameContext = (a, b) =>
  a.fakultasId === b.fakultasId &&
  a.departemenId === b.departemenId &&
  a.prodiId === b.prodiId;

/**
 * Bangun context dari org_scope backend untuk role terbatas (admin-prodi, admin-departemen, dst.).
 * Context ini tidak bisa diubah user karena scope-nya sudah ditetapkan role-nya.
 */
const contextFromOrgScope = (user) => {
  const scope = user?.org_scope;
  if (!scope?.level || !SCOPED_LEVELS.has(scope.level)) return null;
  if (scope.level === "prodi") {
    const prodiId = scope.prodi_ids?.[0] || "";
    const departemenId = scope.departemen_ids?.[0] || "";
    const fakultasId = scope.fakultas_ids?.[0] || "";
    return { fakultasId, departemenId, prodiId };
  }
  if (scope.level === "departemen") {
    const departemenId = scope.departemen_ids?.[0] || "";
    const fakultasId = scope.fakultas_ids?.[0] || "";
    return { fakultasId, departemenId, prodiId: "" };
  }
  if (scope.level === "fakultas") {
    const fakultasId = scope.fakultas_ids?.[0] || "";
    return { fakultasId, departemenId: "", prodiId: "" };
  }
  return null;
};

/** Apakah role user memiliki scope organisasi yang sudah ditetapkan (tidak bisa dipilih manual). */
// eslint-disable-next-line react-refresh/only-export-components -- helper dibutuhkan bareng provider
export const isScopedRole = (user) => {
  const scope = user?.org_scope;
  return Boolean(scope?.level && SCOPED_LEVELS.has(scope.level));
};

export const OrganizationProvider = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const userKey = organizationUserKey(user);
  const stored = useOrganizationContextStore(
    (state) => state.contextsByUser[userKey],
  );
  const setContext = useOrganizationContextStore((state) => state.setContext);
  // Mahasiswa & dosen unitnya dari tabelnya sendiri, bukan master unit — jangan
  // dimuat (role-nya pun tidak punya izin membaca master itu, sehingga dulu
  // navbar menampilkan "Muat unit"). Sebelum login juga tidak ada gunanya.
  const studentContext = contextFromStudent(user);
  const dosenContext = contextFromDosen(user);
  const accountContext = studentContext || dosenContext;
  const organizationOptions = useOrganizationOptions(
    Boolean(user) && !accountContext,
  );
  const context = stored || emptyOrganizationContext();

  // Role terbatas (admin-prodi, admin-departemen, dst.) dari org_scope; akun
  // mahasiswa/dosen dari data akunnya sendiri. Keduanya terkunci.
  const scopedContext = contextFromOrgScope(user);
  const lockedContext = scopedContext || accountContext;

  useEffect(() => {
    if (
      !lockedContext ||
      !userKey ||
      organizationOptions.isLoading ||
      organizationOptions.isError
    )
      return;
    // Konteks mahasiswa/dosen datang dari data akun, bukan hasil reconcile master unit.
    const next =
      accountContext ||
      reconcileOrganizationContext(scopedContext, organizationOptions.rows);
    if (!sameContext(context, next)) setContext(userKey, next);
  }, [
    accountContext,
    context,
    lockedContext,
    organizationOptions.isError,
    organizationOptions.isLoading,
    organizationOptions.rows,
    scopedContext,
    setContext,
    userKey,
  ]);

  // Untuk role biasa, reconcile context yang tersimpan
  useEffect(() => {
    if (
      lockedContext ||
      !userKey ||
      organizationOptions.isLoading ||
      organizationOptions.isError
    )
      return;
    const reconciled = reconcileOrganizationContext(
      context,
      organizationOptions.rows,
    );
    if (!sameContext(context, reconciled)) setContext(userKey, reconciled);
  }, [
    context,
    lockedContext,
    organizationOptions.isError,
    organizationOptions.isLoading,
    organizationOptions.rows,
    setContext,
    userKey,
  ]);

  const activeContext = lockedContext || context;

  const scopeLevel = user?.org_scope?.level || null;

  const value = useMemo(
    () => ({
      context: activeContext,
      scopeLevel,
      scoped: Boolean(lockedContext),
      setContext: lockedContext
        ? () => {} /* noop — unit terkunci, tidak boleh diubah user */
        : (next) =>
            setContext(
              userKey,
              reconcileOrganizationContext(next, organizationOptions.rows),
            ),
      // Master unit tidak dimuat untuk mahasiswa/dosen, jadi namanya diambil dari data akun.
      label: accountContext
        ? studentContext
          ? studentUnitLabel(user)
          : dosenUnitLabel(user)
        : organizationContextLabel(activeContext, organizationOptions.rows),
      ...organizationOptions,
    }),
    [
      accountContext,
      activeContext,
      lockedContext,
      scopeLevel,
      organizationOptions,
      setContext,
      studentContext,
      user,
      userKey,
    ],
  );

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components -- hook dibutuhkan bareng provider
export const useOrganizationContext = () => {
  const value = useContext(OrganizationContext);
  if (!value)
    throw new Error(
      "useOrganizationContext harus digunakan di dalam OrganizationProvider.",
    );
  return value;
};
