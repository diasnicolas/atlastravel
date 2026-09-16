/* Equipe: cards com foto e especialidade revelada no hover; com uma só pessoa, vira apresentação individual. */
import type { AgencyData, MembroEquipe } from '../types/agencia';
import { arr } from '../lib/format';
import { isSafe, safeUrl } from '../lib/url';
import { Icon, Reveal, SectionHead } from './ui';

function Profile({ p, head }: { p: MembroEquipe; head: { etiqueta?: string; titulo?: string; subtitulo?: string } }) {
  const ig = p.instagram;
  return (
    <div className="container profile">
      <Reveal className="profile__media" from="left">
        <figure className="profile__photo">
          {isSafe(p.foto)
            ? <img src={safeUrl(p.foto)} alt={`${p.nome || ''}${p.cargo ? `, ${p.cargo}` : ''}`} loading="lazy" width={800} height={1000} />
            : <span className="team__initials">{String(p.nome || '?').charAt(0)}</span>}
        </figure>
      </Reveal>
      <Reveal className="profile__content" from="right">
        <SectionHead d={head} align="left" />
        <h3 className="profile__name">{p.nome || ''}</h3>
        {p.cargo && <p className="profile__role">{p.cargo}</p>}
        {p.bio && <p className="profile__bio">{p.bio}</p>}
        {p.especialidade && (
          <p className="profile__spec"><Icon cls="fa-solid fa-compass" /><span>{p.especialidade}</span></p>
        )}
        {ig?.url && isSafe(ig.url) && (
          <a className="btn btn--primary" href={safeUrl(ig.url)} target="_blank" rel="noopener">
            <Icon cls="fa-brands fa-instagram" /><span>{ig.usuario ? `Siga ${ig.usuario}` : 'Instagram'}</span>
          </a>
        )}
      </Reveal>
    </div>
  );
}

export function Team({ data }: { data: AgencyData }) {
  const s = data.sobre;
  const eq = arr(s?.equipe);
  if (!eq.length) return null;
  const head = {
    etiqueta: s?.equipe_etiqueta ?? 'Nossa equipe',
    titulo: s?.equipe_titulo ?? 'Especialistas prontos para cuidar da sua viagem',
    subtitulo: s?.equipe_subtitulo,
  };
  if (eq.length === 1) {
    return (
      <section className="section equipe equipe--solo" id="sobre-equipe">
        <Profile p={eq[0]} head={head} />
      </section>
    );
  }
  return (
    <section className="section equipe" id="sobre-equipe">
      <div className="container">
        <SectionHead d={head} />
        <ul className="team">
          {eq.map((p, i) => (
            <Reveal as="li" key={`${p.nome}-${i}`} className="team__card">
              <figure className="team__photo">
                {isSafe(p.foto)
                  ? <img src={safeUrl(p.foto)} alt={`${p.nome || ''}${p.cargo ? `, ${p.cargo}` : ''}`} loading="lazy" />
                  : <span className="team__initials">{String(p.nome || '?').charAt(0)}</span>}
                {p.especialidade && (
                  <figcaption className="team__overlay">
                    <Icon cls="fa-solid fa-compass" />
                    <span className="team__spec-label">Especialidade</span>
                    <span className="team__spec">{p.especialidade}</span>
                  </figcaption>
                )}
              </figure>
              <div className="team__body">
                <h3 className="team__name">{p.nome || ''}</h3>
                {p.cargo && <p className="team__role">{p.cargo}</p>}
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
