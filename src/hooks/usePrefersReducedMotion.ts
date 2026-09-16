import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';
const mql = typeof window !== 'undefined' && 'matchMedia' in window ? window.matchMedia(QUERY) : null;

const subscribe = (cb: () => void) => {
  mql?.addEventListener('change', cb);
  return () => mql?.removeEventListener('change', cb);
};

export const prefersReducedMotion = (): boolean => !!mql?.matches;

/** true quando o usuário pede menos animação (reage a mudanças do sistema). */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, prefersReducedMotion, () => false);
}
