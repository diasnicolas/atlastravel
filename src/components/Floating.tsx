/* Botões flutuantes: WhatsApp e voltar ao topo. */
import type { RefObject } from 'react';
import type { AgencyData } from '../types/agencia';
import { cx } from '../lib/css';
import { isSafe, safeUrl } from '../lib/url';
import { waLink } from '../lib/whatsapp';
import { useScrollPast } from '../hooks/useScrollPast';
import { prefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { Icon } from './ui';

export function WhatsAppFloat({ data }: { data: AgencyData }) {
  const w = data.contato?.whatsapp;
  const href = w?.link || waLink(w?.numero, w?.mensagem_padrao);
  if (!isSafe(href)) return null;
  return (
    <a className="float-whatsapp" href={safeUrl(href)} target="_blank" rel="noopener" aria-label="Conversar no WhatsApp">
      <Icon cls="fa-brands fa-whatsapp" />
    </a>
  );
}

export function BackToTop({ focusRef }: { focusRef: RefObject<HTMLElement | null> }) {
  const visible = useScrollPast(700);
  return (
    <button
      className={cx('back-to-top', visible && 'is-visible')}
      type="button"
      aria-label="Voltar ao topo"
      onClick={() => {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        focusRef.current?.focus({ preventScroll: true });
      }}
    >
      <Icon cls="fa-solid fa-arrow-up" />
    </button>
  );
}
