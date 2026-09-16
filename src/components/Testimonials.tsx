/* Depoimentos: resumo da avaliação + carrossel responsivo (1/2/3 por vez) com autoplay pausável. */
import { useCallback, useEffect, useState } from 'react';
import type { AgencyData, Depoimentos } from '../types/agencia';
import { arr, fmtMonthYear, fmtNum } from '../lib/format';
import { cssVars, cx } from '../lib/css';
import { isSafe, safeUrl } from '../lib/url';
import { usePageVisible } from '../hooks/usePageVisible';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useSwipe } from '../hooks/useSwipe';
import { Icon, Reveal, SectionHead, Stars } from './ui';

/** Chamada para as avaliações públicas (Google etc.). */
function ReviewsCta({ d }: { d: Depoimentos }) {
  const l = d.link_avaliacoes;
  if (!l?.link || !isSafe(l.link)) return null;
  return (
    <Reveal className="reviews-cta">
      <div className="reviews-cta__body">
        <span className="reviews-cta__icon"><Icon cls={sourceIcon(d.fonte || l.link)} /></span>
        <p>
          <strong>{l.texto || 'Veja as avaliações dos nossos clientes'}</strong>
          {l.descricao}
        </p>
      </div>
      <a className="btn btn--primary" href={safeUrl(l.link)} target="_blank" rel="noopener">
        <span>Ver avaliações</span><Icon cls="fa-solid fa-arrow-up-right-from-square" />
      </a>
    </Reveal>
  );
}

const calcPerView = (): number => (window.innerWidth >= 1024 ? 3 : window.innerWidth >= 680 ? 2 : 1);

function sourceIcon(fonte = ''): string {
  if (/google/i.test(fonte)) return 'fa-brands fa-google';
  if (/facebook/i.test(fonte)) return 'fa-brands fa-facebook';
  if (/tripadvisor/i.test(fonte)) return 'fa-brands fa-tripadvisor';
  return 'fa-solid fa-circle-check';
}

export function Testimonials({ data }: { data: AgencyData }) {
  const d = data.depoimentos;
  const itens = arr(d?.itens);
  const reduced = usePrefersReducedMotion();
  const pageVisible = usePageVisible();
  const [perView, setPerView] = useState(calcPerView);
  const [rawIndex, setIndex] = useState(0);
  const [tick, setTick] = useState(0);
  const [hold, setHold] = useState(false); // hover/foco pausam o autoplay

  const positions = Math.max(1, itens.length - perView + 1);
  const index = Math.min(rawIndex, positions - 1);

  useEffect(() => {
    let t = 0;
    const onResize = () => { clearTimeout(t); t = window.setTimeout(() => setPerView(calcPerView()), 120); };
    window.addEventListener('resize', onResize);
    return () => { clearTimeout(t); window.removeEventListener('resize', onResize); };
  }, []);

  const go = useCallback((i: number) => {
    setIndex(((i % positions) + positions) % positions);
    setTick((n) => n + 1);
  }, [positions]);

  useEffect(() => {
    if (reduced || hold || positions <= 1 || !pageVisible) return;
    const t = window.setTimeout(() => go(index + 1), 7000);
    return () => clearTimeout(t);
  }, [reduced, hold, positions, pageVisible, index, tick, go]);

  const swipe = useSwipe((dir) => go(index + dir), 40);

  if (!d) return null;
  if (!itens.length) {
    if (!d.link_avaliacoes?.link) return null;
    return (
      <section className="section depoimentos" id="depoimentos">
        <div className="container">
          <SectionHead d={d} />
          <ReviewsCta d={d} />
        </div>
      </section>
    );
  }
  const media = Number(d.media_avaliacao);

  return (
    <section className="section depoimentos" id="depoimentos">
      <div className="container">
        <div className="reviews__head">
          <SectionHead d={d} align="left" />
          {Number.isFinite(media) && media > 0 && (
            <Reveal className="rating-summary">
              <strong className="rating-summary__value">{fmtNum(media, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</strong>
              <div>
                <Stars rating={media} />
                {!!d.total_avaliacoes && <span className="rating-summary__total">{fmtNum(d.total_avaliacoes)} avaliações</span>}
                {d.fonte && <span className="rating-summary__src"><Icon cls={sourceIcon(d.fonte)} />{d.fonte}</span>}
              </div>
            </Reveal>
          )}
        </div>
        <div
          className="carousel"
          aria-roledescription="carrossel"
          style={cssVars({ '--per-view': perView })}
          onMouseEnter={() => setHold(true)}
          onMouseLeave={() => setHold(false)}
          onFocus={() => setHold(true)}
          onBlur={() => setHold(false)}
          {...swipe}
        >
          <div className="carousel__viewport">
            <ul
              className="carousel__track"
              style={{ transform: `translate3d(calc(${-index} * (100% + var(--gap)) / var(--per-view)), 0, 0)` }}
            >
              {itens.map((t, i) => (
                <li
                  key={`${t.nome}-${i}`}
                  className="carousel__slide"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} de ${itens.length}`}
                  aria-hidden={i < index || i >= index + perView}
                >
                  <article className="review">
                    <div className="review__top">
                      <Stars rating={t.avaliacao || 5} />
                      <span className="review__quote" aria-hidden="true"><Icon cls="fa-solid fa-quote-right" /></span>
                    </div>
                    {t.viagem && <span className="review__trip"><Icon cls="fa-solid fa-plane" />{t.viagem}</span>}
                    <blockquote className="review__text"><p>{t.texto || ''}</p></blockquote>
                    <footer className="review__author">
                      {isSafe(t.foto)
                        ? <img src={safeUrl(t.foto)} alt={t.nome || ''} loading="lazy" width={56} height={56} />
                        : <span className="review__initial" aria-hidden="true">{String(t.nome || '?').charAt(0)}</span>}
                      <div>
                        <strong>{t.nome || ''}</strong>
                        <span>{[t.cidade, fmtMonthYear(t.data)].filter(Boolean).join(' · ')}</span>
                      </div>
                    </footer>
                  </article>
                </li>
              ))}
            </ul>
          </div>
          <div className="carousel__controls" hidden={positions <= 1}>
            <button className="carousel__arrow" type="button" aria-label="Anterior" onClick={() => go(index - 1)}>
              <Icon cls="fa-solid fa-chevron-left" />
            </button>
            <div className="carousel__dots" role="tablist" aria-label="Selecionar depoimentos">
              {Array.from({ length: positions }, (_, i) => (
                <button
                  key={i}
                  className={cx('carousel__dot', i === index && 'is-active')}
                  type="button"
                  role="tab"
                  aria-label={`Ir para depoimento ${i + 1}`}
                  aria-selected={i === index}
                  onClick={() => go(i)}
                />
              ))}
            </div>
            <button className="carousel__arrow" type="button" aria-label="Próximo" onClick={() => go(index + 1)}>
              <Icon cls="fa-solid fa-chevron-right" />
            </button>
          </div>
        </div>
        <ReviewsCta d={d} />
      </div>
    </section>
  );
}
