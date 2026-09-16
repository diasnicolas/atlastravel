/* Sobre: colagem de imagens com selo + texto com abas (Missão / Visão / Valores). */
import { useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import type { AgencyData } from '../types/agencia';
import { arr } from '../lib/format';
import { cx } from '../lib/css';
import { isSafe, linkProps, safeUrl } from '../lib/url';
import { Icon, Reveal, SectionHead } from './ui';

interface Tab { key: string; label: string; icon: string; body: ReactNode }

export function About({ data }: { data: AgencyData }) {
  const s = data.sobre;
  const [activeTab, setActiveTab] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  if (!s) return null;

  const ag = data.agencia ?? {};
  const paragrafos = arr(s.paragrafos);
  const valores = arr(s.valores);
  const tabs: Tab[] = [];
  if (s.missao) tabs.push({ key: 'missao', label: 'Missão', icon: 'fa-solid fa-bullseye', body: <p>{s.missao}</p> });
  if (s.visao) tabs.push({ key: 'visao', label: 'Visão', icon: 'fa-regular fa-eye', body: <p>{s.visao}</p> });
  if (valores.length) {
    tabs.push({
      key: 'valores', label: 'Valores', icon: 'fa-regular fa-gem',
      body: <ul className="values">{valores.map((v, i) => <li key={`${v}-${i}`}><Icon cls="fa-solid fa-check" />{v}</li>)}</ul>,
    });
  }
  const current = Math.min(activeTab, Math.max(0, tabs.length - 1));

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const map: Record<string, number> = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
    if (!(e.key in map)) return;
    e.preventDefault();
    const next = (map[e.key] + tabs.length) % tabs.length;
    setActiveTab(next);
    tabRefs.current[next]?.focus();
  };

  const main = isSafe(s.imagem_principal) ? safeUrl(s.imagem_principal) : '';
  const sec = isSafe(s.imagem_secundaria) ? safeUrl(s.imagem_secundaria) : '';
  const hasMedia = !!(main || sec);
  const selo = s.selo_experiencia;
  const phone = data.contato?.telefone;

  return (
    <section className="section sobre" id="sobre">
      <div className={cx('container sobre__grid', !hasMedia && 'sobre__grid--single')}>
        {hasMedia && (
          <Reveal className="sobre__media" from="left">
            <svg className="sobre__dots" viewBox="0 0 120 120" aria-hidden="true">
              <defs>
                <pattern id="dotpat" width="12" height="12" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="2" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="120" height="120" fill="url(#dotpat)" />
            </svg>
            {main && (
              <figure className="sobre__img sobre__img--main">
                <img src={main} alt={s.titulo || ag.nome || ''} loading="lazy" />
              </figure>
            )}
            {sec && (
              <figure className="sobre__img sobre__img--sec">
                <img src={sec} alt={ag.nome ? `Equipe ${ag.nome}` : ''} loading="lazy" />
              </figure>
            )}
            {selo?.valor !== undefined && selo.valor !== '' && (
              <div className="sobre__badge">
                <svg viewBox="0 0 100 100" aria-hidden="true">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 5" />
                </svg>
                <strong>{selo.valor}</strong>
                <span>{selo.rotulo || ''}</span>
              </div>
            )}
          </Reveal>
        )}
        <Reveal className="sobre__content" from="right">
          <SectionHead d={{ etiqueta: s.etiqueta, titulo: s.titulo }} align="left" />
          {s.subtitulo && <p className="sobre__lead">{s.subtitulo}</p>}
          {paragrafos.map((p, i) => <p key={i} className="sobre__p">{p}</p>)}
          {tabs.length > 0 && (
            <div className="tabs">
              <div className="tabs__list" role="tablist" aria-label={ag.nome_curto || ag.nome || 'Institucional'}>
                {tabs.map((t, i) => (
                  <button
                    key={t.key}
                    ref={(el) => { tabRefs.current[i] = el; }}
                    className={cx('tabs__btn', i === current && 'is-active')}
                    type="button"
                    role="tab"
                    id={`tab-${t.key}`}
                    aria-controls={`panel-${t.key}`}
                    aria-selected={i === current}
                    tabIndex={i === current ? 0 : -1}
                    onClick={() => setActiveTab(i)}
                    onKeyDown={(e) => onTabKey(e, i)}
                  >
                    <Icon cls={t.icon} />{t.label}
                  </button>
                ))}
              </div>
              {tabs.map((t, i) => (
                <div key={t.key} className="tabs__panel" role="tabpanel" id={`panel-${t.key}`} aria-labelledby={`tab-${t.key}`} hidden={i !== current}>
                  {t.body}
                </div>
              ))}
            </div>
          )}
          <div className="sobre__footer">
            {s.cta?.texto && (
              <a className="btn btn--primary" {...linkProps(s.cta.link || '#contato')}>
                <span>{s.cta.texto}</span><Icon cls="fa-solid fa-arrow-right" />
              </a>
            )}
            {phone?.exibicao && (
              <a className="sobre__phone" href={safeUrl(phone.link)}>
                <span className="sobre__phone-icon"><Icon cls="fa-solid fa-phone-volume" /></span>
                <span>
                  <small>{ag.ano_fundacao ? `Desde ${ag.ano_fundacao}` : ag.nome_curto || ''}</small>
                  <strong>{phone.exibicao}</strong>
                </span>
              </a>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
