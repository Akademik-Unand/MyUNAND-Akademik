import { useQuery } from '@tanstack/react-query';
import { getResourceItem, getResourceRows } from '../services/api';

/** Mengambil seluruh baris resource, untuk tampilan non-tabel seperti matriks. */
export const useResourceQuery = (resource, options = {}) => {
  const { params, ...rest } = options;
  return useQuery({
    queryKey: [resource, 'all', params || {}],
    queryFn: () => getResourceRows(resource, params),
    ...rest,
  });
};

export const useResourceItem = (resource, id, options = {}) =>
  useQuery({
    queryKey: [resource, id],
    queryFn: () => getResourceItem(resource, id),
    enabled: Boolean(id),
    ...options,
  });
