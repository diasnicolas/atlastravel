/* Serviços: cards com imagem, ícone flutuante, benefícios e CTA + pílulas de serviços complementares. */
import type { AgencyData } from '../types/agencia';
import { arr } from '../lib/format';
import { isSafe, linkProps, safeUrl } from '../lib/url';
import { cx } from '../lib/css';
import { Icon, Reveal, SectionHead } from './ui';

export function Services({ data }: { data: AgencyData }) {
  const s = data.servicos;
  const itens = arr(s?.itens);
  const comp = arr(s?.servicos_complementares);
  if (!s || (!itens.length && !comp.length)) return null;
  return (
    <section className="section servicos" id="servicos">
      <div className="container">
        <SectionHead d={s} />
        {itens.length > 0 && (
          <ul className={cx('services', itens.length % 4 === 0 && itens.length % 3 !== 0 && 'services--4')}>
            {itens.map((it, i) => {
              const beneficios = arr(it.beneficios);
              return (
                <Reveal as="li" key={`${it.id ?? ''}-${i}`} className="service" id={`servico-${it.id || i}`} delay={(i % (itens.length % 4 === 0 ? 4 : 3)) * 90}>
                  <div className="service__media">
                    <div className="service__img">
                      {isSafe(it.imagem) && <img src={safeUrl(it.imagem)} alt={it.titulo || ''} loading="lazy" />}
                    </div>
                    <span className="service__icon"><Icon cls={it.icone} fallback="fa-solid fa-suitcase" /></span>
                  </div>
                  <div className="service__body">
                    <h3 className="service__title">{it.titulo || ''}</h3>
                    {it.descricao && <p className="service__text">{it.descricao}</p>}
                    {beneficios.length > 0 && (
                      <ul className="checklist">
                        {beneficios.map((b, k) => <li key={`${b}-${k}`}><Icon cls="fa-solid fa-circle-check" />{b}</li>)}
                      </ul>
                    )}
                    {it.cta?.texto && (
                      <a className="service__cta" {...linkProps(it.cta.link || '#contato')}>
                        <span>{it.cta.texto}</span><Icon cls="fa-solid fa-arrow-right-long" />
                      </a>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </ul>
        )}
        {comp.length > 0 && (
          <Reveal as="ul" className="pills">
            {comp.map((c, i) => (
              <li key={`${c.titulo}-${i}`} className="pill"><Icon cls={c.icone} fallback="fa-solid fa-plus" /><span>{c.titulo}</span></li>
            ))}
          </Reveal>
        )}
      </div>
    </section>
  );
}
