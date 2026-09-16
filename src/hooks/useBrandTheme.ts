import { useEffect } from 'react';
import type { IdentidadeVisual } from '../types/agencia';
import { hexToRgb } from '../lib/css';

const cleanFont = (f: unknown): string => String(f ?? '').replace(/[^\w\s-]/g, '').trim();

/** Cores da marca → custom properties em :root (+ variantes -rgb) e fontes do Google Fonts. */
export function useBrandTheme(iv: IdentidadeVisual | undefined): void {
  useEffect(() => {
    const root = document.documentElement.style;
    const set: string[] = [];
    const setVar = (name: string, value: string) => { root.setProperty(name, value); set.push(name); };

    const colors: Record<string, string | undefined> = {
      primary: iv?.cor_primaria, secondary: iv?.cor_secundaria, accent: iv?.cor_destaque,
      dark: iv?.cor_escura, light: iv?.cor_clara,
    };
    Object.entries(colors).forEach(([key, value]) => {
      const rgb = hexToRgb(value);
      if (!rgb) return;
      const hex = `#${String(value).trim().replace(/^#/, '')}`;
      setVar(`--brand-${key}`, hex);
      setVar(`--brand-${key}-rgb`, rgb);
    });
    const primaryRgb = hexToRgb(iv?.cor_primaria);
    if (primaryRgb) {
      document.head.querySelector('meta[name="theme-color"]')?.setAttribute('content', `#${String(iv?.cor_primaria).trim().replace(/^#/, '')}`);
    }

    const fonts: string[] = [];
    const head = cleanFont(iv?.fonte_titulos);
    const body = cleanFont(iv?.fonte_textos);
    if (head) { setVar('--font-head', `"${head}", "Montserrat", system-ui, sans-serif`); if (head !== 'Montserrat') fonts.push(head); }
    if (body) { setVar('--font-body', `"${body}", "Open Sans", system-ui, sans-serif`); if (body !== 'Open Sans') fonts.push(body); }
    let link: HTMLLinkElement | null = null;
    if (fonts.length) {
      link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?${fonts.map((f) => `family=${encodeURIComponent(f)}:wght@400;600;700;800`).join('&')}&display=swap`;
      document.head.appendChild(link);
    }

    return () => {
      set.forEach((name) => root.removeProperty(name));
      link?.remove();
    };
  }, [iv]);
}
