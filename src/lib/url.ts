/** Sanitiza URLs para href/src: http(s), mailto, tel, âncoras e caminhos relativos. */
export function safeUrl(url: unknown, fallback = '#'): string {
  if (typeof url !== 'string') return fallback;
  const u = url.trim();
  if (!u) return fallback;
  if (u.startsWith('#') || u.startsWith('/') || u.startsWith('./') || u.startsWith('../') || u.startsWith('?')) return u;
  const scheme = u.match(/^([a-z][a-z0-9+.-]*):/i);
  if (!scheme) return u; // relativo (ex.: img/foto.jpg)
  return ['http', 'https', 'mailto', 'tel'].includes(scheme[1].toLowerCase()) ? u : fallback;
}

/** URL utilizável (não vazia e com esquema permitido). */
export const isSafe = (url: unknown): url is string => typeof url === 'string' && safeUrl(url) !== '#';

export const isExternal = (url: unknown): boolean => /^https?:/i.test(String(url ?? ''));

/** Atributos de link: href sanitizado + target/rel para links externos. */
export function linkProps(url: unknown): { href: string; target?: string; rel?: string } {
  const href = safeUrl(url);
  return isExternal(url) ? { href, target: '_blank', rel: 'noopener' } : { href };
}

/** url() seguro para uso em CSS inline. */
export function cssUrl(url: unknown): string | undefined {
  if (!isSafe(url)) return undefined;
  const encoded = safeUrl(url).replace(/["'()\\\s]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`);
  return `url("${encoded}")`;
}
