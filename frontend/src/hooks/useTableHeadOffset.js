import { useLayoutEffect, useRef, useState } from 'react';

export const useTableHeadOffset = (...deps) => {
  const headRef = useRef(null);
  const [offset, setOffset] = useState(36);

  useLayoutEffect(() => {
    const el = headRef.current;
    if (!el) return undefined;
    const sync = () => setOffset(Math.ceil(el.getBoundingClientRect().height));
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => observer.disconnect();
  }, deps);

  return { headRef, offset };
};
