import type { AgencyData } from '../types/agencia';
import { arr } from './format';

/** Ids de todas as seções renderizadas pelo template. */
export const SECTION_IDS = [
  'hero', 'hero-busca', 'sobre', 'sobre-numeros', 'sobre-equipe', 'diferenciais', 'servicos',
  'depoimentos', 'galeria', 'faq', 'cta-final', 'contato', 'rodape',
] as const;
export type SectionId = (typeof SECTION_IDS)[number];

/**
 * Seções que existem no JSON mas não são exibidas neste template (destinos, newsletter).
 * Continuam "gerenciadas": links para elas são ocultados como os de qualquer seção ausente.
 */
const REMOVED_SECTION_IDS: readonly string[] = ['destinos', 'newsletter'];

/** Regras de exibição: seção sem dados não é renderizada (e some do menu). */
const rules: Record<SectionId, (d: AgencyData) => boolean> = {
  hero: (d) => !!d.hero,
  'hero-busca': (d) => (d.hero?.busca?.ativo ? arr(d.hero.busca.campos).length > 0 : false) || arr(d.hero?.estatisticas).length > 0,
  sobre: (d) => !!d.sobre,
  'sobre-numeros': (d) => arr(d.sobre?.numeros).length > 0,
  'sobre-equipe': (d) => arr(d.sobre?.equipe).length > 0,
  diferenciais: (d) => !!d.diferenciais && (arr(d.diferenciais.itens).length > 0 || !!d.diferenciais.titulo),
  servicos: (d) => !!d.servicos && (arr(d.servicos.itens).length > 0 || arr(d.servicos.servicos_complementares).length > 0),
  depoimentos: (d) => arr(d.depoimentos?.itens).length > 0 || !!d.depoimentos?.link_avaliacoes?.link,
  galeria: (d) => arr(d.galeria?.fotos).some((f) => f.miniatura || f.url),
  faq: (d) => arr(d.faq?.itens).some((q) => q.pergunta),
  'cta-final': (d) => !!d.cta_final?.titulo,
  contato: (d) => !!d.contato,
  rodape: () => true,
};

export function visibleSections(data: AgencyData, failed: ReadonlySet<string>): Set<string> {
  const set = new Set<string>(['conteudo']);
  for (const id of SECTION_IDS) if (!failed.has(id) && rules[id](data)) set.add(id);
  return set;
}

export const isManagedId = (id: string): boolean =>
  (SECTION_IDS as readonly string[]).includes(id) || REMOVED_SECTION_IDS.includes(id) || id === 'conteudo';

/** Link utilizável: âncora para seção do template só vale se a seção estiver na página. */
export function isLinkTargetVisible(link: unknown, visible: ReadonlySet<string>): boolean {
  const href = String(link ?? '').trim();
  if (!href.startsWith('#')) return true;
  const id = href.slice(1);
  return !isManagedId(id) || visible.has(id);
}
