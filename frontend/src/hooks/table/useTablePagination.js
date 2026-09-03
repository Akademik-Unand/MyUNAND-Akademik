import { useCallback, useMemo } from 'react';

export const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

/** Mengelola `page` dan `limit` di URL. */
export const useTablePagination = ({ get, setParams }, defaultLimit = 10) => {
  const page = useMemo(() => Math.max(1, Number(get('page', '1')) || 1), [get]);
  const limit = useMemo(() => {
    const value = Number(get('limit', String(defaultLimit)));
    return ROWS_PER_PAGE_OPTIONS.includes(value) ? value : defaultLimit;
  }, [get, defaultLimit]);

  const setPage = useCallback((next) => setParams({ page: next <= 1 ? '' : next }), [setParams]);

  const setLimit = useCallback(
    (next) => setParams({ limit: next === defaultLimit ? '' : next, page: '' }),
    [setParams, defaultLimit]
  );

  return { page, limit, setPage, setLimit };
};
