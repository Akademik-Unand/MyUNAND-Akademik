import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { listResource } from '../services/api';

const EMPTY_META = { page: 1, limit: 10, total: 0, totalPages: 1 };
const EMPTY_ROWS = [];

/**
 * Mengambil satu halaman data tabel. keepPreviousData menahan baris lama saat
 * pindah halaman supaya tabel tidak berkedip kosong.
 */
export const useTableQuery = (resource, params, options = {}) => {
  const enabled = Boolean(resource) && options.enabled !== false;

  const query = useQuery({
    queryKey: ['table', resource, params],
    queryFn: () => listResource(resource, params),
    placeholderData: keepPreviousData,
    ...options,
    enabled,
  });

  return {
    ...query,
    rows: query.data?.data ?? EMPTY_ROWS,
    meta: query.data?.pagination ?? query.data?.meta ?? { ...EMPTY_META, limit: params?.limit ?? EMPTY_META.limit },
    isPending: enabled && query.isPending,
  };
};
