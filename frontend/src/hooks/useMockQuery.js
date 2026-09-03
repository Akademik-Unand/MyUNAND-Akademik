import { useEffect, useState } from 'react';

/**
 * Simulates a short fetch delay so skeleton loading can be shown.
 * Copies the initial mock snapshot once; callers mutate via setData.
 */
export const useMockQuery = (source, delay = 500) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      if (cancelled) return;
      setData(Array.isArray(source) ? source.map((row) => ({ ...row })) : []);
      setIsLoading(false);
    }, delay);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // Load the initial mock snapshot once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, isLoading, setData };
};
