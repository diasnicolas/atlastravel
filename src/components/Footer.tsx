/* Rodapé escuro em 4 colunas + barra legal e aviso de demonstração. */
import type { AgencyData } from '../types/agencia';
import { arr, composeAddress } from '../lib/format';
import { isLinkTargetVisible } from '../lib/sections';
import { isSafe, linkProps, safeUrl } from '../lib/url';
import { Brand, EmailText, Icon, SocialItems } from './ui';

const PAYMENT_ICONS: [RegExp, string][] = [
  [/visa/, 'fa-brands fa-cc-visa'], [/master/, 'fa-brands fa-cc-mastercard'], [/amex|american/, 'fa-brands fa-cc-amex'],
  [/pix/, 'fa-brands fa-pix'], [/diners/, 'fa-brands fa-cc-diners-club'], [/discover/, 'fa-brands fa-cc-discover'],
  [/paypal/, 'fa-brands fa-cc-paypal'], [/apple/, 'fa-brands fa-cc-apple-pay'], [/google/, 'fa-brands fa-google-pay'],
  [/jcb/, 'fa-brands fa-cc-jcb'], [/boleto/, 'fa-solid fa-barcode'], [/transfer|ted|dep[oó]sito/, 'fa-solid fa-building-columns'],
];

function PaymentChip({ nome }: { nome: string }) {
  const found = PAYMENT_ICONS.find(([re]) => re.test(nome.toLowerCase()));
  const brandCard = !!found && found[1].startsWith('fa-brands fa-cc');
  return (
    <li className={brandCard ? 'pay pay--card' : 'pay'} title={nome}>
      {found && <Icon cls={found[1]} />}
      {brandCard ? <span className="sr-only">{nome}</span> : <span>{nome}</span>}
    </li>
  );
}

export function Footer({ data, visible }: { data: AgencyData; visible: ReadonlySet<string> }) {
  const r = data.rodape ?? {};
  const ag = data.agencia ?? {};
  const c = data.contato ?? {};
  const quick = arr(r.links_rapidos).filter((l) => isLinkTargetVisible(l.link, visible));
  const endereco = composeAddress(data.endereco, false);
  const selos = arr(r.selos);
  const pagamentos = arr(r.formas_pagamento);
  const legais = arr(r.links_legais);
  const ids = [ag.cnpj ? `CNPJ ${ag.cnpj}` : '', ag.cadastur ? `Cadastur ${ag.cadastur}` : ''].filter(Boolean);

  return (
    <footer className="site-footer" id="rodape">
      <div className="footer__top">
        <div className="container footer__grid">
          <div className="footer__col footer__col--brand">
            <a className="footer__brand" href="#hero" aria-label={ag.nome || 'Início'}><Brand ag={ag} variant="light" /></a>
            {(r.sobre || ag.descricao_curta) && <p>{r.sobre || ag.descricao_curta}</p>}
            {ag.slogan && <p className="footer__slogan">{ag.slogan}</p>}
            {arr(data.redes_sociais).length > 0 && <ul className="social social--footer"><SocialItems redes={data.redes_sociais} /></ul>}
          </div>
          {quick.length > 0 && (
            <nav className="footer__col" aria-label="Links rápidos">
              <h2 className="footer__title">Links rápidos</h2>
              <ul className="footer__links">
                {quick.map((l, i) => (
                  <li key={`${l.link}-${i}`}><a {...linkProps(l.link)}><Icon cls="fa-solid fa-chevron-right" />{l.rotulo}</a></li>
                ))}
              </ul>
            </nav>
          )}
          {(c.telefone?.exibicao || c.whatsapp?.exibicao || c.email?.exibicao || endereco) && (
          <div className="footer__col">
            <h2 className="footer__title">Contato</h2>
            <ul className="footer__contact">
              {c.telefone?.exibicao && <li><Icon cls="fa-solid fa-phone" /><a href={safeUrl(c.telefone.link)}>{c.telefone.exibicao}</a></li>}
              {c.whatsapp?.exibicao && (
                <li><Icon cls="fa-brands fa-whatsapp" /><a href={safeUrl(c.whatsapp.link)} target="_blank" rel="noopener">{c.whatsapp.exibicao}</a></li>
              )}
              {c.email?.exibicao && (
                <li><Icon cls="fa-regular fa-envelope" /><a href={safeUrl(c.email.link || `mailto:${c.email.exibicao}`)}><EmailText value={c.email.exibicao} /></a></li>
              )}
              {endereco && (
                <li>
                  <Icon cls="fa-solid fa-location-dot" />
                  <span>
                    {endereco}
                    {data.endereco?.referencia && <small className="footer__note">{data.endereco.referencia}</small>}
                  </span>
                </li>
              )}
            </ul>
          </div>
          )}
          <div className="footer__col">
            {selos.length > 0 && (
              <>
                <h2 className="footer__title">Credibilidade</h2>
                <ul className="seals">
                  {selos.map((s, i) => (
                    <li key={`${s.nome}-${i}`} className="seal">
                      <Icon cls={/ssl|seguro/i.test(s.nome || '') ? 'fa-solid fa-lock' : 'fa-solid fa-shield-halved'} />
                      <div><strong>{s.nome || ''}</strong>{s.descricao && <span>{s.descricao}</span>}</div>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {pagamentos.length > 0 && (
              <>
                <h2 className="footer__title footer__title--sm">Formas de pagamento</h2>
                <ul className="pays">{pagamentos.map((p, i) => <PaymentChip key={`${p}-${i}`} nome={String(p)} />)}</ul>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <div className="footer__legal-text">
            <p>{r.copyright || `© ${new Date().getFullYear()} ${ag.nome || ''}`}</p>
            <p className="footer__ids">
              {ids.map((txt, i) => (
                <span key={txt}>{i > 0 && <span aria-hidden="true"> • </span>}{txt}</span>
              ))}
            </p>
            {r.desenvolvido_por?.nome && (
              <p className="footer__credit">
                Desenvolvido por{' '}
                {isSafe(r.desenvolvido_por.link)
                  ? <a {...linkProps(r.desenvolvido_por.link)}>{r.desenvolvido_por.nome}</a>
                  : r.desenvolvido_por.nome}
              </p>
            )}
          </div>
          {legais.length > 0 && (
            <ul className="footer__legal">
              {legais.map((l, i) => <li key={`${l.rotulo}-${i}`}><a {...linkProps(l.link)}>{l.rotulo}</a></li>)}
            </ul>
          )}
        </div>
        {r.aviso_demo && <p className="footer__demo"><Icon cls="fa-solid fa-circle-info" />{r.aviso_demo}</p>}
      </div>
    </footer>
  );
}
