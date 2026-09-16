import { useCallback, useSyncExternalStore } from 'react';

/** Estado de uma media query (ex.: menu mobile abaixo de 1080px). */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback((cb: () => void) => {
    const mql = window.matchMedia(query);
    mql.addEventListener('change', cb);
    return () => mql.removeEventListener('change', cb);
  }, [query]);
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}
