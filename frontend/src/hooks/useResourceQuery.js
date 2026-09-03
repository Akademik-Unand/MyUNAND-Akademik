import { useQuery } from '@tanstack/react-query';
import { getResourceRows } from '../services/api';

/** Mengambil seluruh baris resource, untuk tampilan non-tabel seperti matriks. */
export const useResourceQuery = (resource, options = {}) =>
  useQuery({
    queryKey: [resource, 'all'],
    queryFn: () => getResourceRows(resource),
    ...options,
  });
