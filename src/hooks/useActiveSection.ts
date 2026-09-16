import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

/**
 * Seção ativa conforme a rolagem. Seções auxiliares (ex.: equipe, números)
 * herdam a âncora do item de menu anterior.
 */
export function useActiveSection(mainRef: RefObject<HTMLElement | null>, menuIds: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  const idsKey = menuIds.join('|');

  useEffect(() => {
    const main = mainRef.current;
    const ids = idsKey ? idsKey.split('|') : [];
    if (!main || !ids.length || !('IntersectionObserver' in window)) return;
    const sections = Array.from(main.children).filter((el): el is HTMLElement => el instanceof HTMLElement && el.tagName === 'SECTION');
    const owner = new Map<Element, string | null>();
    let current: string | null = null;
    sections.forEach((s) => { if (ids.includes(s.id)) current = s.id; owner.set(s, current); });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) setActive(owner.get(en.target) ?? null); });
    }, { rootMargin: '-35% 0px -60% 0px' });
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [mainRef, idsKey]);

  return active;
}
