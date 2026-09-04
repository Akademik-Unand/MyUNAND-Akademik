import { useRef, useState } from 'react';

const MOCK_ACTION_MS = 400;

/**
 * Kunci aksi tombol/form supaya tidak bisa di-spam. `run` untuk Promise
 * (mutasi API); `runMock` menambah jeda singkat agar spinner sempat tampil.
 */
export const useBusyAction = () => {
  const [busy, setBusy] = useState(false);
  const lockRef = useRef(false);

  const run = async (fn) => {
    if (lockRef.current) return;
    lockRef.current = true;
    setBusy(true);
    try {
      return await fn();
    } finally {
      lockRef.current = false;
      setBusy(false);
    }
  };

  const runMock = (fn, ms = MOCK_ACTION_MS) =>
    run(async () => {
      await new Promise((resolve) => setTimeout(resolve, ms));
      await fn?.();
    });

  return { busy, run, runMock };
};
