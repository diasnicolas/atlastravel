/* Diferenciais: fundo escuro com imagem e cards numerados. */
import type { AgencyData } from '../types/agencia';
import { arr, pad2 } from '../lib/format';
import { isSafe, safeUrl } from '../lib/url';
import { Icon, Reveal, SectionHead } from './ui';

export function Differentials({ data }: { data: AgencyData }) {
  const d = data.diferenciais;
  const itens = arr(d?.itens);
  if (!d || (!itens.length && !d.titulo)) return null;
  return (
    <section className="section diferenciais" id="diferenciais">
      {isSafe(d.imagem) && (
        <div className="diferenciais__bg" aria-hidden="true"><img src={safeUrl(d.imagem)} alt="" loading="lazy" /></div>
      )}
      <div className="container">
        <div className="diferenciais__head">
          <SectionHead d={{ etiqueta: d.etiqueta, titulo: d.titulo }} align="left" light />
          {d.subtitulo && <Reveal as="p" className="diferenciais__sub">{d.subtitulo}</Reveal>}
        </div>
        <ul className="features">
          {itens.map((it, i) => (
            <Reveal as="li" key={`${it.titulo}-${i}`} className="feature" delay={i * 70}>
              <span className="feature__num" aria-hidden="true">{pad2(i + 1)}</span>
              <span className="feature__icon"><Icon cls={it.icone} fallback="fa-solid fa-star" /></span>
              <h3 className="feature__title">{it.titulo || ''}</h3>
              {it.descricao && <p className="feature__text">{it.descricao}</p>}
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
