import { useSyncExternalStore } from 'react';

const subscribe = (cb: () => void) => {
  document.addEventListener('visibilitychange', cb);
  return () => document.removeEventListener('visibilitychange', cb);
};

/** false quando a aba está em segundo plano (pausa autoplays). */
export function usePageVisible(): boolean {
  return useSyncExternalStore(subscribe, () => !document.hidden, () => true);
}
