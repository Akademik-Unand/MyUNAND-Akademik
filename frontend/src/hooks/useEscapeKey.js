import { useEffect } from 'react';

/**
 * Menutup overlay non-dialog (drawer) lewat tombol Escape.
 * Kunci scroll halaman sudah ditangani DaisyUI lewat --page-scroll-lock.
 */
export const useEscapeKey = (active, onEscape) => {
  useEffect(() => {
    if (!active) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onEscape?.();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active, onEscape]);
};
