import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Pembungkus useSearchParams dengan prefix, supaya dua tabel pada satu halaman
 * bisa punya state sendiri di URL (misal `mk_page` dan `transkrip_page`).
 */
export const useTableSearchParams = (prefix = '') => {
  const [searchParams, setSearchParams] = useSearchParams();

  const key = useCallback((name) => `${prefix}${name}`, [prefix]);

  const get = useCallback(
    (name, fallback = '') => searchParams.get(key(name)) ?? fallback,
    [searchParams, key]
  );

  /** Menulis beberapa parameter sekaligus; nilai kosong dibuang dari URL. */
  const setParams = useCallback(
    (patch) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          Object.entries(patch).forEach(([name, value]) => {
            const paramName = key(name);
            if (value === '' || value === undefined || value === null) {
              next.delete(paramName);
            } else {
              next.set(paramName, String(value));
            }
          });
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams, key]
  );

  return { searchParams, get, setParams, key };
};
