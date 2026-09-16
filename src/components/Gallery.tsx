/* Galeria: filtros por categoria + grade quadrada + lightbox. */
import { useLayoutEffect, useRef, useState } from 'react';
import type { AgencyData } from '../types/agencia';
import { arr } from '../lib/format';
import { cx } from '../lib/css';
import { safeUrl } from '../lib/url';
import { Icon, Reveal, SectionHead } from './ui';
import { Lightbox } from './Lightbox';

const norm = (s: unknown): string => String(s ?? '').trim().toLowerCase();

export function Gallery({ data }: { data: AgencyData }) {
  const g = data.galeria;
  const fotos = arr(g?.fotos).filter((f) => f.miniatura || f.url);
  const [filter, setFilter] = useState('*');
  const [pop, setPop] = useState<'idle' | 'restart' | 'play'>('idle');
  const listRef = useRef<HTMLUListElement>(null);
  const lastFocus = useRef<HTMLButtonElement | null>(null);
  const [lb, setLb] = useState<{ list: number[]; pos: number; open: boolean }>({ list: [], pos: 0, open: false });

  // Reinicia a animação "popIn" dos itens a cada troca de filtro (remove a classe, força reflow, recoloca)
  useLayoutEffect(() => {
    if (pop !== 'restart') return;
    void listRef.current?.offsetWidth;
    setPop('play');
  }, [pop]);

  if (!fotos.length) return null;

  let cats = arr(g?.categorias).filter((c) => norm(c) !== 'todos');
  fotos.forEach((f) => { if (f.categoria && !cats.some((c) => norm(c) === norm(f.categoria))) cats.push(f.categoria); });
  cats = cats.filter((c) => fotos.some((f) => norm(f.categoria) === norm(c)));
  const todosLabel = arr(g?.categorias).find((c) => norm(c) === 'todos') || 'Todos';
  const isShown = (i: number) => filter === '*' || norm(fotos[i].categoria) === filter;

  const choose = (f: string) => { setFilter(f); setPop('restart'); };
  const open = (i: number, btn: HTMLButtonElement) => {
    const list = fotos.map((_, k) => k).filter(isShown);
    lastFocus.current = btn;
    setLb({ list, pos: Math.max(0, list.indexOf(i)), open: true });
  };
  const close = () => { setLb((s) => ({ ...s, open: false })); lastFocus.current?.focus(); };
  const navigate = (delta: number) => setLb((s) => ({ ...s, pos: (s.pos + delta + s.list.length) % s.list.length }));

  return (
    <section className="section galeria" id="galeria">
      <div className="container">
        <SectionHead d={g} />
        {cats.length > 1 && (
          <Reveal className="filters" role="group" aria-label="Filtrar fotos por categoria">
            <button className={cx('filters__btn', filter === '*' && 'is-active')} type="button" aria-pressed={filter === '*'} onClick={() => choose('*')}>
              {todosLabel}
            </button>
            {cats.map((c, i) => (
              <button key={`${c}-${i}`} className={cx('filters__btn', filter === norm(c) && 'is-active')} type="button" aria-pressed={filter === norm(c)} onClick={() => choose(norm(c))}>
                {c}
              </button>
            ))}
          </Reveal>
        )}
        <ul className="gallery" ref={listRef}>
          {fotos.map((f, i) => (
            <Reveal
              as="li"
              key={`${f.miniatura || f.url}-${i}`}
              className={cx('gallery__item', pop === 'play' && 'is-in')}
              hidden={!isShown(i)}
              delay={(i % 4) * 60}
            >
              <button className="gallery__btn" type="button" aria-label={`Ampliar foto: ${f.titulo || f.alt || ''}`} onClick={(e) => open(i, e.currentTarget)}>
                <img src={safeUrl(f.miniatura || f.url)} alt={f.alt || f.titulo || ''} loading="lazy" />
                <span className="gallery__caption">
                  {f.categoria && <span className="gallery__cat">{f.categoria}</span>}
                  <strong>{f.titulo || ''}</strong>
                  {f.local && <span><Icon cls="fa-solid fa-location-dot" />{f.local}</span>}
                </span>
                <span className="gallery__zoom" aria-hidden="true"><Icon cls="fa-solid fa-expand" /></span>
              </button>
            </Reveal>
          ))}
        </ul>
      </div>
      <Lightbox photos={lb.list.map((k) => fotos[k])} index={lb.pos} open={lb.open} onClose={close} onNavigate={navigate} />
    </section>
  );
}
