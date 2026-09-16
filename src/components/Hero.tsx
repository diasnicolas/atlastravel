/* Hero: slider Ken Burns com card de legenda, progresso, pausa, setas, pontos e gesto de arrastar. */
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { AgencyData, HeroSlide, Link } from '../types/agencia';
import { arr, pad2 } from '../lib/format';
import { cssVars, cx } from '../lib/css';
import { isLinkTargetVisible } from '../lib/sections';
import { isSafe, safeUrl } from '../lib/url';
import { usePageVisible } from '../hooks/usePageVisible';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useSwipe } from '../hooks/useSwipe';
import { CtaButton, Icon } from './ui';

const DURATION = 6500;

/** Evita quebra de linha em palavras hifenizadas (ex.: "preocupe-se"). */
function NoBreakHyphens({ text }: { text: string }) {
  const parts = text.split(/(\S+-\S+)/g);
  return (
    <>
      {parts.map((part, i) => (i % 2 === 1
        ? <span key={i} className="nowrap">{part}</span>
        : <Fragment key={i}>{part}</Fragment>))}
    </>
  );
}

export function Hero({ data, visible }: { data: AgencyData; visible: ReadonlySet<string> }) {
  const h = data.hero;
  // Botões que apontam para seções ausentes da página não são exibidos
  const ctaFor = (cta?: Link): Link | undefined => (cta && isLinkTargetVisible(cta.link, visible) ? cta : undefined);
  const reduced = usePrefersReducedMotion();
  const pageVisible = usePageVisible();

  const slides = useMemo<HeroSlide[]>(() => {
    const list = arr(h?.slides).filter((s) => isSafe(s.imagem));
    if (!list.length && isSafe(h?.imagem_fundo)) return [{ imagem: h?.imagem_fundo }];
    return list;
  }, [h]);
  const count = slides.length;
  const multi = count > 1;

  const [index, setIndex] = useState(0);
  const [tick, setTick] = useState(0); // incrementa a cada troca (reinicia animações/timer)
  const [paused, setPaused] = useState(reduced);

  const go = useCallback((i: number) => {
    if (count < 2) return;
    setIndex(((i % count) + count) % count);
    setTick((t) => t + 1);
  }, [count]);

  // Autoplay: pausa com o botão, com a aba oculta ou com movimento reduzido
  useEffect(() => {
    if (!multi || paused || !pageVisible) return;
    const t = window.setTimeout(() => go(index + 1), DURATION);
    return () => clearTimeout(t);
  }, [multi, paused, pageVisible, index, tick, go]);

  const swipe = useSwipe((dir) => go(index + dir), 50);

  if (!h) return null;

  const rawOverlay = Number(h.overlay_opacidade ?? 0.45);
  const overlay = Math.max(0, Math.min(0.9, Number.isFinite(rawOverlay) ? rawOverlay : 0.45));
  const hasVideo = isSafe(h.video_fundo);
  const captions = slides.filter((s) => s.titulo || s.subtitulo);
  const current = slides[index] ?? {};
  const running = multi && !paused && pageVisible;

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (!(e.target instanceof Element) || !e.target.closest('.hero__controls, .hero__card')) return;
    if (e.key === 'ArrowRight') go(index + 1);
    if (e.key === 'ArrowLeft') go(index - 1);
  };

  return (
    <section
      className={cx('hero', paused && 'is-paused')}
      id="hero"
      aria-roledescription="carrossel"
      onKeyDown={multi ? onKeyDown : undefined}
      {...(multi ? swipe : {})}
    >
      <div className={cx('hero__media', hasVideo && 'hero__media--video')}>
        {slides.map((s, i) => (
          <div key={`${s.imagem}-${i}`} className={cx('hero__slide', i === index && 'is-active')} aria-hidden={i !== index}>
            {i === 0
              ? <img src={safeUrl(s.imagem)} alt="" fetchPriority="high" />
              : <img src={safeUrl(s.imagem)} alt="" decoding="async" />}
          </div>
        ))}
        {hasVideo && (
          <video className="hero__video" autoPlay muted loop playsInline poster={isSafe(h.imagem_fundo) ? safeUrl(h.imagem_fundo) : undefined}>
            <source src={safeUrl(h.video_fundo)} />
          </video>
        )}
      </div>
      <div className="hero__overlay" style={cssVars({ '--overlay': overlay })} aria-hidden="true" />
      <div className="container hero__inner">
        <div className="hero__text">
          {h.etiqueta && <span className="hero__eyebrow">{h.etiqueta}</span>}
          {(h.titulo || h.titulo_destaque) && (
            <h1 className="hero__title">
              <NoBreakHyphens text={h.titulo || ''} />
              {h.titulo && h.titulo_destaque ? ' ' : ''}
              {h.titulo_destaque && <span className="hero__highlight">{h.titulo_destaque}</span>}
            </h1>
          )}
          {h.subtitulo && <p className="hero__sub">{h.subtitulo}</p>}
          <div className="hero__actions">
            <CtaButton cta={ctaFor(h.cta_primario)} cls="btn--accent btn--lg" />
            <CtaButton cta={ctaFor(h.cta_secundario)} cls="btn--ghost btn--lg" />
          </div>
        </div>
        {captions.length > 0 && (
          <aside className={cx('hero__card', tick > 0 && 'is-swap')} aria-live="polite">
            <div className="hero__card-top">
              <span className="hero__counter"><strong>{pad2(index + 1)}</strong> / {pad2(count)}</span>
              {multi && (
                <button
                  className="hero__pause"
                  type="button"
                  aria-label={paused ? 'Reproduzir apresentação' : 'Pausar apresentação'}
                  aria-pressed={paused}
                  onClick={() => setPaused((p) => !p)}
                >
                  <Icon cls={paused ? 'fa-solid fa-play' : 'fa-solid fa-pause'} />
                </button>
              )}
            </div>
            <h2 className="hero__card-title" key={`t${tick}`}>{current.titulo || ''}</h2>
            <p className="hero__card-sub" key={`s${tick}`}>{current.subtitulo || ''}</p>
            {multi && (
              <div className="hero__progress">
                <span
                  key={`${tick}-${running}`}
                  className={running ? 'is-running' : undefined}
                  style={running ? { animationDuration: `${DURATION}ms` } : undefined}
                />
              </div>
            )}
          </aside>
        )}
      </div>
      {multi && (
        <div className="hero__controls container">
          <div className="hero__dots" role="tablist" aria-label="Selecionar slide">
            {slides.map((s, i) => (
              <button
                key={`${s.imagem}-${i}`}
                className={cx('hero__dot', i === index && 'is-active')}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Slide ${i + 1}${s.titulo ? `: ${s.titulo}` : ''}`}
                onClick={() => go(i)}
              />
            ))}
          </div>
          <div className="hero__arrows">
            <button className="hero__arrow" type="button" aria-label="Anterior" onClick={() => go(index - 1)}><Icon cls="fa-solid fa-arrow-left" /></button>
            <button className="hero__arrow" type="button" aria-label="Próximo" onClick={() => go(index + 1)}><Icon cls="fa-solid fa-arrow-right" /></button>
          </div>
        </div>
      )}
    </section>
  );
}
