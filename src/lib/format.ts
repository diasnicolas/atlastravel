/** Lista segura: ignora valores não-array e itens vazios. */
export function arr<T>(v: T[] | null | undefined): NonNullable<T>[] {
  return Array.isArray(v) ? (v.filter((x) => x !== null && x !== undefined && (x as unknown) !== '') as NonNullable<T>[]) : [];
}

/** Texto não vazio (ou valor presente). */
export function hasText(v: unknown): boolean {
  return typeof v === 'string' ? v.trim().length > 0 : v !== null && v !== undefined;
}

/** Número formatado em pt-BR; se não for número, devolve o texto original. */
export function fmtNum(n: unknown, opts: Intl.NumberFormatOptions = {}): string {
  const num = Number(n);
  return Number.isFinite(num) ? num.toLocaleString('pt-BR', opts) : String(n ?? '');
}

/** "2026-06-18" → "junho de 2026" */
export function fmtMonthYear(iso: unknown): string {
  if (!iso) return '';
  const d = new Date(`${String(iso).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

/** "2026-09-20" → "20/09/2026" */
export function fmtDateBR(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return d && m && y ? `${d}/${m}/${y}` : iso;
}

/** Converte "R$ 12.490,50" → 12490.5 (null se não for possível). */
export function parseBRL(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string') return null;
  const cleaned = value.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

export const pad2 = (n: number): string => String(n).padStart(2, '0');

/** Validação simples de e-mail. */
export const isEmail = (v: unknown): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v ?? '').trim());

/** Classes de ícone Font Awesome (apenas caracteres seguros). */
export function iconClass(cls: unknown, fallback = 'fa-solid fa-circle'): string {
  const c = typeof cls === 'string' ? cls.replace(/[^a-z0-9\- ]/gi, '').trim() : '';
  return c || fallback;
}

/** Endereço completo (campo `completo` ou composto das partes). */
export function composeAddress(end: {
  completo?: string; logradouro?: string; numero?: string; complemento?: string; bairro?: string;
  cidade?: string; uf?: string; estado?: string; cep?: string;
} | undefined, detailed = true): string {
  if (!end) return '';
  if (end.completo) return end.completo;
  if (!detailed) return [end.logradouro, end.numero, end.bairro, end.cidade, end.uf].filter(Boolean).join(', ');
  return [
    [end.logradouro, end.numero].filter(Boolean).join(', '), end.complemento, end.bairro,
    [end.cidade, end.uf || end.estado].filter(Boolean).join(' - '), end.cep,
  ].filter(Boolean).join(', ');
}
