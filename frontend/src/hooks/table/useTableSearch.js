import { useCallback, useEffect, useState } from 'react';

const DEBOUNCE_MS = 350;

/**
 * Kotak pencarian responsif: input diperbarui seketika, URL dan query menyusul
 * setelah pengetikan berhenti supaya tidak memicu request tiap huruf.
 */
export const useTableSearch = ({ get, setParams }) => {
  const search = get('search', '');
  const [draft, setDraft] = useState(search);
  const [prevSearch, setPrevSearch] = useState(search);

  if (search !== prevSearch) {
    setPrevSearch(search);
    setDraft(search);
  }

  useEffect(() => {
    if (draft === search) return undefined;
    const timer = setTimeout(() => setParams({ search: draft, page: '' }), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [draft, search, setParams]);

  const clear = useCallback(() => {
    setDraft('');
    setParams({ search: '', page: '' });
  }, [setParams]);

  return { search, draft, setDraft, clear };
};
