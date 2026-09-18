/* Atlas Club: grupo de ofertas no WhatsApp (texto + botão de entrada e cartão de vantagens). */
import type { AgencyData } from '../types/agencia';
import { arr } from '../lib/format';
import { CtaButton, Icon, Reveal, SectionHead } from './ui';

export function AtlasClub({ data }: { data: AgencyData }) {
  const c = data.atlas_club;
  if (!c?.titulo) return null;
  const paragrafos = arr(c.paragrafos);
  const destaques = arr(c.destaques).filter((d) => d.texto);
  return (
    <section className="section club" id="atlas-club">
      <div className="container">
        <div className="club__grid">
          <Reveal className="club__text" from="left">
            <SectionHead d={{ etiqueta: c.etiqueta, titulo: c.titulo, subtitulo: c.subtitulo }} align="left" light />
            {paragrafos.map((p, i) => <p key={i}>{p}</p>)}
            {c.chamada && <p className="club__call">{c.chamada}</p>}
            <CtaButton cta={c.botao} cls="btn--accent btn--lg" />
          </Reveal>
          {destaques.length > 0 && (
            <Reveal as="aside" className="club__card" from="right" aria-label="Vantagens do grupo">
              <span className="club__badge"><Icon cls={c.icone} fallback="fa-brands fa-whatsapp" /></span>
              <ul className="club__list">
                {destaques.map((d, i) => (
                  <li key={`${d.texto}-${i}`}><Icon cls={d.icone} fallback="fa-solid fa-check" /><span>{d.texto}</span></li>
                ))}
              </ul>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
