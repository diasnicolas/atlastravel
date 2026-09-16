import { useEffect } from 'react';
import type { AgencyData } from '../types/agencia';
import { arr, hasText } from '../lib/format';
import { isSafe, safeUrl } from '../lib/url';

/** Cria/atualiza uma meta tag no <head>. */
function setMeta(attr: 'name' | 'property', key: string, content: unknown): void {
  if (typeof content !== 'string' || !hasText(content)) return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/** SEO: título, descrição, palavras-chave, Open Graph e favicon. */
export function useDocumentMeta(data: AgencyData): void {
  useEffect(() => {
    const seo = data.seo ?? {};
    const ag = data.agencia ?? {};
    document.title = seo.titulo || ag.nome || document.title;
    setMeta('name', 'description', seo.descricao || ag.descricao_curta);
    const keywords = arr(seo.palavras_chave);
    if (keywords.length) setMeta('name', 'keywords', keywords.join(', '));
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:title', seo.titulo || ag.nome);
    setMeta('property', 'og:description', seo.descricao || ag.descricao_curta);
    if (isSafe(seo.imagem_compartilhamento)) setMeta('property', 'og:image', safeUrl(seo.imagem_compartilhamento));
    if (ag.nome) setMeta('property', 'og:site_name', ag.nome);
    const fav = ag.logotipo?.favicon || ag.logotipo?.icone;
    if (isSafe(fav)) {
      let link = document.head.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
      link.href = safeUrl(fav);
    }
  }, [data]);
}
