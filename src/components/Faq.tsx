/* FAQ: acordeão acessível + card lateral de ajuda. */
import { useState } from 'react';
import type { AgencyData } from '../types/agencia';
import { arr, pad2 } from '../lib/format';
import { cx } from '../lib/css';
import { safeUrl } from '../lib/url';
import { Icon, Reveal, SectionHead } from './ui';

export function Faq({ data }: { data: AgencyData }) {
  const f = data.faq;
  const itens = arr(f?.itens).filter((q) => q.pergunta);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  if (!itens.length) return null;

  const c = data.contato ?? {};
  const horarios = arr(c.horario_atendimento);
  const hasAside = !!(c.whatsapp?.link || c.telefone?.exibicao);

  return (
    <section className="section faq" id="faq">
      <div className={cx('container faq__grid', !hasAside && 'faq__grid--single')}>
        <div className="faq__main">
          <SectionHead d={f} align="left" />
          <Reveal className="accordion">
            {itens.map((q, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={`${q.pergunta}-${i}`} className={cx('accordion__item', isOpen && 'is-open')}>
                  <h3 className="accordion__heading">
                    <button
                      className="accordion__btn"
                      type="button"
                      id={`faq-btn-${i}`}
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${i}`}
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                    >
                      <span className="accordion__num" aria-hidden="true">{pad2(i + 1)}</span>
                      <span className="accordion__q">{q.pergunta}</span>
                      <span className="accordion__icon" aria-hidden="true" />
                    </button>
                  </h3>
                  <div className="accordion__panel" id={`faq-panel-${i}`} role="region" aria-labelledby={`faq-btn-${i}`} hidden={!isOpen}>
                    <p>{q.resposta || ''}</p>
                  </div>
                </div>
              );
            })}
          </Reveal>
        </div>
        {hasAside && (
          <Reveal as="aside" className="faq__aside" from="right">
            <div className="help-card">
              <span className="help-card__icon"><Icon cls="fa-solid fa-headset" /></span>
              <h3 className="help-card__title">Ainda tem dúvidas?</h3>
              {c.subtitulo && <p className="help-card__text">{c.subtitulo}</p>}
              {c.whatsapp?.link && (
                <a className="btn btn--accent btn--block" href={safeUrl(c.whatsapp.link)} target="_blank" rel="noopener">
                  <Icon cls="fa-brands fa-whatsapp" /><span>Falar no WhatsApp</span>
                </a>
              )}
              {c.telefone?.exibicao && (
                <a className="help-card__phone" href={safeUrl(c.telefone.link)}><Icon cls="fa-solid fa-phone" />{c.telefone.exibicao}</a>
              )}
              {horarios.length > 0 && (
                <ul className="help-card__hours">
                  {horarios.map((h, i) => <li key={`${h.dias}-${i}`}><span>{h.dias}</span><strong>{h.horario}</strong></li>)}
                </ul>
              )}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
