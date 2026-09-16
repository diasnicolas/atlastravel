import type { KeyboardEvent as ReactKeyboardEvent } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]):not([hidden]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/** Lista de elementos focáveis visíveis dentro dos contêineres informados. */
export function focusablesIn(...containers: (HTMLElement | null | undefined)[]): HTMLElement[] {
  return containers.flatMap((c) => {
    if (!c) return [];
    const self = c.matches(FOCUSABLE) ? [c] : [];
    return [...self, ...Array.from(c.querySelectorAll<HTMLElement>(FOCUSABLE))];
  }).filter((el) => !el.closest('[hidden]') && el.getClientRects().length > 0);
}

/** Mantém o foco circulando dentro dos elementos (Tab / Shift+Tab). */
export function trapTab(e: KeyboardEvent | ReactKeyboardEvent, items: HTMLElement[]): void {
  if (e.key !== 'Tab' || !items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  const activeEl = document.activeElement;
  const inside = items.some((el) => el === activeEl);
  if (e.shiftKey && (activeEl === first || !inside)) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && (activeEl === last || !inside)) { e.preventDefault(); first.focus(); }
}
