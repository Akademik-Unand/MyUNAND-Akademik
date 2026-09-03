import { useCallback, useMemo } from 'react';

const FILTER_PREFIX = 'filter.';

/**
 * Filter per kolom disimpan di URL sebagai `filter.<kolom>=<nilai>` dan dikirim
 * ke server sebagai objek `filter` yang sama bentuknya dengan `filter[kolom]`.
 */
export const useTableFilters = ({ searchParams, setParams, key }) => {
  const filter = useMemo(() => {
    const result = {};
    const prefix = key(FILTER_PREFIX);
    searchParams.forEach((value, name) => {
      if (name.startsWith(prefix) && value !== '') {
        result[name.slice(prefix.length)] = value;
      }
    });
    return result;
  }, [searchParams, key]);

  const setFilter = useCallback(
    (field, value) => setParams({ [`${FILTER_PREFIX}${field}`]: value, page: '' }),
    [setParams]
  );

  const clearFilters = useCallback(() => {
    const patch = { page: '' };
    Object.keys(filter).forEach((field) => {
      patch[`${FILTER_PREFIX}${field}`] = '';
    });
    setParams(patch);
  }, [filter, setParams]);

  return { filter, setFilter, clearFilters, activeCount: Object.keys(filter).length };
};
