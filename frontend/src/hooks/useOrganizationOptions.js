import { useMemo } from 'react';
import { useResourceQuery } from './useResourceQuery';
import { organizationRowLabel } from '../helpers/organizationContext';

const options = (rows, level) => rows.map((row) => ({ value: String(row.id), label: organizationRowLabel(row, level) }));

export const useOrganizationOptions = () => {
  const fakultas = useResourceQuery('fakultas');
  const departemen = useResourceQuery('departemen');
  const prodi = useResourceQuery('prodi');

  const rows = useMemo(() => ({
    fakultas: fakultas.data || [],
    departemen: departemen.data || [],
    prodi: prodi.data || [],
  }), [fakultas.data, departemen.data, prodi.data]);

  return {
    rows,
    options: {
      fakultas: options(rows.fakultas, 'fakultas'),
      departemen: options(rows.departemen, 'departemen'),
      prodi: options(rows.prodi, 'prodi'),
    },
    isLoading: fakultas.isPending || departemen.isPending || prodi.isPending,
    isError: fakultas.isError || departemen.isError || prodi.isError,
    refetch: () => Promise.all([fakultas.refetch(), departemen.refetch(), prodi.refetch()]),
  };
};
