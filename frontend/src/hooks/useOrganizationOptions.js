import { useMemo } from "react";
import { useResourceQuery } from "./useResourceQuery";
import { organizationRowLabel } from "../helpers/organizationContext";

const options = (rows, level) =>
  rows.map((row) => ({
    value: String(row.id),
    label: organizationRowLabel(row, level),
  }));

/**
 * Daftar unit dari master data. `enabled` dimatikan untuk akun yang tidak
 * berhak/tidak membutuhkan (mis. mahasiswa, yang unitnya diambil dari data
 * mahasiswanya sendiri) supaya tidak memicu 403 dan status "Muat unit".
 */
export const useOrganizationOptions = (enabled = true) => {
  const fakultas = useResourceQuery("fakultas", { enabled });
  const departemen = useResourceQuery("departemen", { enabled });
  const prodi = useResourceQuery("prodi", { enabled });

  const rows = useMemo(
    () => ({
      fakultas: fakultas.data || [],
      departemen: departemen.data || [],
      prodi: prodi.data || [],
    }),
    [fakultas.data, departemen.data, prodi.data],
  );

  return {
    rows,
    options: {
      fakultas: options(rows.fakultas, "fakultas"),
      departemen: options(rows.departemen, "departemen"),
      prodi: options(rows.prodi, "prodi"),
    },
    // Query yang dinonaktifkan tetap berstatus pending di React Query, jadi
    // pending/error hanya dilaporkan saat memang dimuat.
    isLoading:
      enabled &&
      (fakultas.isPending || departemen.isPending || prodi.isPending),
    isError:
      enabled && (fakultas.isError || departemen.isError || prodi.isError),
    refetch: () =>
      Promise.all([fakultas.refetch(), departemen.refetch(), prodi.refetch()]),
  };
};
