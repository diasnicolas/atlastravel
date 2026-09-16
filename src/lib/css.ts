import type { CSSProperties } from 'react';

/** Permite custom properties (--x) em `style` com tipagem. */
export const cssVars = (vars: Record<`--${string}`, string | number>): CSSProperties => vars as CSSProperties;

/** Junta classes ignorando valores falsos. */
export const cx = (...parts: (string | false | null | undefined)[]): string => parts.filter(Boolean).join(' ');

/** "#0B4F6C" → "11, 79, 108" */
export function hexToRgb(hex: unknown): string | null {
  const m = String(hex ?? '').trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}
