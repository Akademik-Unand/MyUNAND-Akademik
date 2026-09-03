import { useCallback } from 'react';

/** Sort tiga tahap per kolom: asc, desc, lalu kembali tanpa urutan. */
export const useTableSort = ({ get, setParams }) => {
  const sortBy = get('sortBy', '');
  const sortOrder = get('sortOrder', 'asc') === 'desc' ? 'desc' : 'asc';

  const toggleSort = useCallback(
    (field) => {
      if (sortBy !== field) {
        setParams({ sortBy: field, sortOrder: '', page: '' });
        return;
      }
      if (sortOrder === 'asc') {
        setParams({ sortBy: field, sortOrder: 'desc', page: '' });
        return;
      }
      setParams({ sortBy: '', sortOrder: '', page: '' });
    },
    [sortBy, sortOrder, setParams]
  );

  return { sortBy, sortOrder, toggleSort };
};
