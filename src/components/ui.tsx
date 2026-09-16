/* Componentes de UI compartilhados: ícone, estrelas, animação de entrada, cabeçalho de seção, botões, logo e redes. */
import type { AllHTMLAttributes, ElementType, ReactNode } from 'react';
import type { Agencia, Link, RedeSocial } from '../types/agencia';
import { arr, fmtNum, hasText, iconClass } from '../lib/format';
import { cssVars, cx } from '../lib/css';
import { isSafe, linkProps, safeUrl } from '../lib/url';
import { useReveal } from '../hooks/useReveal';

export function Icon({ cls, fallback }: { cls?: string; fallback?: string }) {
  return <i className={iconClass(cls, fallback)} aria-hidden="true" />;
}

/** Estrelas (suporta meia estrela). */
export function Stars({ rating, max = 5 }: { rating: unknown; max?: number }) {
  const raw = Math.max(0, Math.min(max, Number(rating) || 0));
  const r = Math.round(raw * 2) / 2;
  return (
    <span className="stars" role="img" aria-label={`Avaliação ${fmtNum(raw, { maximumFractionDigits: 1 })} de ${max}`}>
      {Array.from({ length: max }, (_, k) => {
        const i = k + 1;
        const cls = r >= i ? 'fa-solid fa-star' : r >= i - 0.5 ? 'fa-solid fa-star-half-stroke' : 'fa-regular fa-star';
        return <i key={i} className={cls} aria-hidden="true" />;
      })}
    </span>
  );
}

type RevealTag = 'div' | 'li' | 'ul' | 'header' | 'p' | 'form' | 'aside';
type RevealProps = Omit<AllHTMLAttributes<HTMLElement>, 'as'> & {
  as?: RevealTag;
  from?: 'left' | 'right';
  delay?: number;
  children?: ReactNode;
};

/** Elemento com animação de entrada ao rolar (data-reveal + .is-visible). */
export function Reveal({ as = 'div', from, delay, className, style, children, ...rest }: RevealProps) {
  const [ref, visible] = useReveal<HTMLElement>();
  const Tag = as as ElementType;
  return (
    <Tag
      {...rest}
      ref={ref}
      data-reveal={from ?? ''}
      className={cx(className, visible && 'is-visible') || undefined}
      style={delay !== undefined ? { ...style, ...cssVars({ '--d': `${delay}ms` }) } : style}
    >
      {children}
    </Tag>
  );
}

interface HeadData { etiqueta?: string; titulo?: string; subtitulo?: string }

/** Cabeçalho padrão de seção (etiqueta, título, subtítulo). */
export function SectionHead({ d, align = 'center', light = false }: { d?: HeadData; align?: 'center' | 'left'; light?: boolean }) {
  if (!d) return null;
  const et = hasText(d.etiqueta);
  const ti = hasText(d.titulo);
  const su = hasText(d.subtitulo);
  if (!et && !ti && !su) return null;
  return (
    <Reveal as="header" className={cx('section-head', `section-head--${align}`, light && 'section-head--light')}>
      {et && <span className="eyebrow">{d.etiqueta}</span>}
      {ti && <h2 className="section-title">{d.titulo}</h2>}
      {su && <p className="section-sub">{d.subtitulo}</p>}
    </Reveal>
  );
}

export function CtaButton({ cta, cls = 'btn--accent' }: { cta?: Link; cls?: string }) {
  if (!cta?.texto) return null;
  return (
    <a className={`btn ${cls}`} {...linkProps(cta.link || '#')}>
      {cta.icone && <Icon cls={cta.icone} />}
      <span>{cta.texto}</span>
    </a>
  );
}

/** Logo: variação clara (fundo escuro) e escura (cabeçalho rolado); texto como fallback. */
export function Brand({ ag, variant = 'both' }: { ag?: Agencia; variant?: 'both' | 'light' }) {
  const logo = ag?.logotipo ?? {};
  const alt = logo.alt || ag?.nome || '';
  const white = isSafe(logo.branco) ? safeUrl(logo.branco) : '';
  const main = isSafe(logo.principal) ? safeUrl(logo.principal) : '';
  const text = <span className="brand__text">{ag?.nome_curto || ag?.nome || ''}</span>;
  if (!white && !main) return text;
  if (variant === 'light') {
    return <img className="brand__logo brand__logo--light" src={white || main} alt={alt} width={160} height={48} />;
  }
  return (
    <>
      <img className="brand__logo brand__logo--light" src={white || main} alt={alt} width={160} height={48} />
      <img className="brand__logo brand__logo--dark" src={main || white} alt={alt} width={160} height={48} />
    </>
  );
}

/** Itens <li> com ícones das redes sociais. */
export function SocialItems({ redes }: { redes?: RedeSocial[] }) {
  return (
    <>
      {arr(redes).filter((r) => isSafe(r.url)).map((r, i) => (
        <li key={`${r.url}-${i}`}>
          <a
            className="social__link"
            href={safeUrl(r.url)}
            target="_blank"
            rel="noopener"
            aria-label={`${r.nome || 'Rede social'}${r.usuario ? ` (${r.usuario})` : ''}`}
          >
            <Icon cls={r.icone} fallback="fa-solid fa-link" />
          </a>
        </li>
      ))}
    </>
  );
}

/** Texto com ponto de quebra após "@" (e-mails longos). */
export function EmailText({ value }: { value?: string }) {
  const text = value ?? '';
  const at = text.indexOf('@');
  if (at < 0) return <>{text}</>;
  return <>{text.slice(0, at + 1)}<wbr />{text.slice(at + 1)}</>;
}
