/* Cabeçalho: barra utilitária + navegação principal (transparente → branca ao rolar) e menu mobile acessível. */
import { useEffect, useRef, useState } from 'react';
import type { MouseEvent, RefObject } from 'react';
import { flushSync } from 'react-dom';
import type { AgencyData } from '../types/agencia';
import { arr } from '../lib/format';
import { cx } from '../lib/css';
import { isManagedId } from '../lib/sections';
import { isExternal, linkProps, safeUrl } from '../lib/url';
import { useActiveSection } from '../hooks/useActiveSection';
import { useBodyClass } from '../hooks/useBodyClass';
import { focusablesIn, trapTab } from '../hooks/useFocusTrap';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useScrollPast } from '../hooks/useScrollPast';
import { Brand, Icon, SocialItems } from './ui';

interface HeaderProps {
  data: AgencyData;
  visible: ReadonlySet<string>;
  mainRef: RefObject<HTMLElement | null>;
  navbarRef: RefObject<HTMLDivElement | null>;
  brandRef: RefObject<HTMLAnchorElement | null>;
}

export function Header({ data, visible, mainRef, navbarRef, brandRef }: HeaderProps) {
  const ag = data.agencia ?? {};
  const c = data.contato ?? {};
  const heroVisible = visible.has('hero');
  const scrolled = useScrollPast(40) || !heroVisible;
  const isMobile = useMediaQuery('(max-width: 1080px)');
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  useBodyClass('nav-open', open);

  // Menu: só exibe itens cujas seções foram renderizadas
  const items = arr(data.menu).filter((m) => {
    const anchor = String(m.ancora ?? '');
    const id = anchor.replace(/^#/, '');
    if (!id) return false;
    if (anchor.startsWith('#') && isManagedId(id)) return visible.has(id);
    return anchor.startsWith('#') || /^https?:/.test(anchor);
  });
  const menuIds = items.map((m) => String(m.ancora)).filter((a) => a.startsWith('#')).map((a) => a.slice(1));
  const activeId = useActiveSection(mainRef, menuIds);

  // Fecha ao sair do breakpoint mobile
  useEffect(() => { if (!isMobile) setOpen(false); }, [isMobile]);

  // Ao abrir: foca o primeiro link; Esc fecha; Tab circula entre botão e menu
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => navRef.current?.querySelector<HTMLElement>('a')?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); toggleRef.current?.focus(); }
      else if (e.key === 'Tab') trapTab(e, focusablesIn(toggleRef.current, navRef.current));
    };
    document.addEventListener('keydown', onKey);
    return () => { clearTimeout(t); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const onNavClick = (e: MouseEvent<HTMLElement>) => {
    if (open && e.target instanceof Element && e.target.closest('a')) flushSync(() => setOpen(false));
  };

  // Topbar
  const firstHours = arr(c.horario_atendimento)[0];
  const hasInfo = !!(c.telefone?.exibicao || c.email?.exibicao || firstHours);
  const hasSocial = arr(data.redes_sociais).length > 0;

  // CTA: formulário de contato ou WhatsApp
  const ctaHref = visible.has('contato') ? '#contato' : c.whatsapp?.link || '';

  return (
    <>
      <header className={cx('site-header', scrolled && 'is-scrolled', !heroVisible && 'is-solid')} id="site-header">
        <div className="topbar" id="topbar" hidden={!hasInfo && !hasSocial}>
          <div className="container topbar__inner">
            <ul className="topbar__info">
              {c.telefone?.exibicao && (
                <li><a href={safeUrl(c.telefone.link)}><Icon cls="fa-solid fa-phone" /><span>{c.telefone.exibicao}</span></a></li>
              )}
              {c.email?.exibicao && (
                <li className="topbar__email">
                  <a href={safeUrl(c.email.link || `mailto:${c.email.exibicao}`)}><Icon cls="fa-regular fa-envelope" /><span>{c.email.exibicao}</span></a>
                </li>
              )}
              {firstHours && (
                <li className="topbar__hours">
                  <Icon cls="fa-regular fa-clock" />
                  <span>{firstHours.dias}{firstHours.horario ? `: ${firstHours.horario}` : ''}</span>
                </li>
              )}
            </ul>
            <ul className="social social--topbar"><SocialItems redes={data.redes_sociais} /></ul>
          </div>
        </div>
        <div className="navbar" ref={navbarRef}>
          <div className="container navbar__inner">
            <a className="brand" id="brand" href="#hero" ref={brandRef} aria-label={`${ag.nome || 'Início'} — início`}>
              <Brand ag={ag} />
            </a>
            <nav
              className={cx('nav', open && 'is-open')}
              id="nav"
              aria-label="Navegação principal"
              ref={navRef}
              inert={isMobile && !open}
              onClick={onNavClick}
            >
              <ul className="nav__list" id="nav-list">
                {items.map((m, i) => {
                  const id = String(m.ancora).slice(1);
                  const isActive = String(m.ancora).startsWith('#') && id === activeId;
                  return (
                    <li key={`${m.ancora}-${i}`}>
                      <a className={cx('nav__link', isActive && 'is-active')} aria-current={isActive ? 'true' : undefined} {...linkProps(m.ancora)}>
                        {m.rotulo}
                      </a>
                    </li>
                  );
                })}
              </ul>
              <div className="nav__mobile-extra">
                {c.whatsapp?.link && (
                  <a className="btn btn--accent btn--block" href={safeUrl(c.whatsapp.link)} target="_blank" rel="noopener">
                    <Icon cls="fa-brands fa-whatsapp" /><span>{c.whatsapp.exibicao || 'WhatsApp'}</span>
                  </a>
                )}
                {c.telefone?.exibicao && (
                  <a className="nav__phone" href={safeUrl(c.telefone.link)}><Icon cls="fa-solid fa-phone" />{c.telefone.exibicao}</a>
                )}
                {hasSocial && <ul className="social social--nav"><SocialItems redes={data.redes_sociais} /></ul>}
              </div>
            </nav>
            {ctaHref && (
              <a
                className="btn btn--accent navbar__cta"
                id="nav-cta"
                href={safeUrl(ctaHref)}
                {...(isExternal(ctaHref) ? { target: '_blank', rel: 'noopener' } : {})}
              >
                <Icon cls="fa-regular fa-paper-plane" />
                <span>{c.formulario?.titulo || 'Fale conosco'}</span>
              </a>
            )}
            <button
              ref={toggleRef}
              className="nav-toggle"
              id="nav-toggle"
              type="button"
              aria-label={open ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={open}
              aria-controls="nav"
              onClick={() => setOpen((o) => !o)}
            >
              <span className="nav-toggle__bar" /><span className="nav-toggle__bar" /><span className="nav-toggle__bar" />
            </button>
          </div>
        </div>
      </header>
      <div className="nav-backdrop" hidden={!open} onClick={() => setOpen(false)} />
    </>
  );
}
