import { useMemo } from 'react';
import { useTableSearchParams } from './useTableSearchParams';
import { useTablePagination } from './useTablePagination';
import { useTableSearch } from './useTableSearch';
import { useTableSort } from './useTableSort';
import { useTableFilters } from './useTableFilters';

/**
 * Menggabungkan seluruh state tabel menjadi satu objek. `query` adalah bentuk
 * yang siap dikirim ke server (page, limit, search, sortBy, sortOrder, filter).
 */
export const useTableParams = ({ prefix = '', defaultLimit = 10 } = {}) => {
  const store = useTableSearchParams(prefix);
  const pagination = useTablePagination(store, defaultLimit);
  const search = useTableSearch(store);
  const sort = useTableSort(store);
  const filters = useTableFilters(store);

  const query = useMemo(
    () => ({
      page: pagination.page,
      limit: pagination.limit,
      search: search.search,
      sortBy: sort.sortBy,
      sortOrder: sort.sortOrder,
      filter: filters.filter,
    }),
    [
      pagination.page,
      pagination.limit,
      search.search,
      sort.sortBy,
      sort.sortOrder,
      filters.filter,
    ]
  );

  return { ...pagination, ...search, ...sort, ...filters, query };
};
