/* CTA final com fundo em parallax. */
import type { AgencyData } from '../types/agencia';
import { cssUrl, safeUrl } from '../lib/url';
import { CtaButton, Icon, Reveal } from './ui';

export function CtaFinal({ data }: { data: AgencyData }) {
  const c = data.cta_final;
  if (!c?.titulo) return null;
  const bg = cssUrl(c.imagem_fundo);
  const phone = data.contato?.telefone;
  return (
    <section className="cta-final" id="cta-final">
      <div className="cta-final__bg" aria-hidden="true" style={bg ? { backgroundImage: bg } : undefined} />
      <Reveal className="container cta-final__inner">
        <h2 className="cta-final__title">{c.titulo}</h2>
        {c.subtitulo && <p className="cta-final__sub">{c.subtitulo}</p>}
        <div className="cta-final__actions">
          <CtaButton cta={c.botao} cls="btn--accent btn--lg" />
          {phone?.exibicao && (
            <a className="btn btn--ghost btn--lg" href={safeUrl(phone.link)}>
              <Icon cls="fa-solid fa-phone" /><span>{phone.exibicao}</span>
            </a>
          )}
        </div>
      </Reveal>
    </section>
  );
}
