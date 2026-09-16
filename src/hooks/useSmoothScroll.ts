import { useEffect } from 'react';
import type { RefObject } from 'react';
import { prefersReducedMotion } from './usePrefersReducedMotion';

/** Rolagem suave para âncoras internas, compensando a altura do cabeçalho fixo. */
export function useSmoothScroll(navbarRef: RefObject<HTMLElement | null>, enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target instanceof Element ? e.target.closest('a[href^="#"]') : null;
      if (!a) return;
      const id = (a.getAttribute('href') ?? '').slice(1);
      if (!id) { e.preventDefault(); return; }
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const offset = (navbarRef.current?.getBoundingClientRect().height ?? 72) + 8;
      const top = id === 'hero' ? 0 : target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      history.replaceState(null, '', `#${id}`);
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [navbarRef, enabled]);
}
