/* Contato: cards, departamentos, horários, endereço, redes + formulário (→ e-mail e/ou WhatsApp) e mapa. */
import { useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import type { AgencyData, CampoForm } from '../types/agencia';
import { arr, composeAddress, isEmail } from '../lib/format';
import { cx } from '../lib/css';
import { isSafe, linkProps, safeUrl } from '../lib/url';
import { openInNewTab, waLink } from '../lib/whatsapp';
import { EmailText, Icon, Reveal, SectionHead } from './ui';

type FieldEl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
type SendStatus = 'idle' | 'sending' | 'success' | 'error';

const INPUT_TYPES = ['email', 'tel', 'text', 'date', 'number'];
const inputType = (fd: CampoForm): string => (INPUT_TYPES.includes(fd.tipo ?? '') ? String(fd.tipo) : 'text');

function validateField(fd: CampoForm, raw: string): string {
  const v = raw.trim();
  const type = fd.tipo === 'textarea' || fd.tipo === 'select' ? fd.tipo : inputType(fd);
  if (fd.obrigatorio && !v) return 'Campo obrigatório.';
  if (v && type === 'email' && !isEmail(v)) return 'Informe um e-mail válido.';
  if (v && type === 'tel' && v.replace(/\D/g, '').length < 10) return 'Informe um telefone com DDD.';
  return '';
}

function InfoCard({ icon, label, children, extra }: { icon: string; label: string; children: ReactNode; extra?: string }) {
  return (
    <li className={cx('info-card', extra)}>
      <span className="info-card__icon"><Icon cls={icon} /></span>
      <div className="info-card__body"><span className="info-card__label">{label}</span>{children}</div>
    </li>
  );
}

export function Contact({ data }: { data: AgencyData }) {
  const c = data.contato;
  const campos = arr(c?.formulario?.campos);
  const [values, setValues] = useState<string[]>(() => campos.map(() => ''));
  const [errors, setErrors] = useState<string[]>(() => campos.map(() => ''));
  const [status, setStatus] = useState<SendStatus>('idle');
  const [waUrl, setWaUrl] = useState('');
  const fieldRefs = useRef<(FieldEl | null)[]>([]);
  if (!c) return null;

  const f = c.formulario;
  const endereco = composeAddress(data.endereco);
  const referencia = data.endereco?.referencia;
  const redes = arr(data.redes_sociais).filter((r) => isSafe(r.url));
  const deps = arr(c.emails_departamentos).filter((d) => d.email);
  const horas = arr(c.horario_atendimento);
  const mapUrl = isSafe(c.mapa?.embed_url) ? safeUrl(c.mapa?.embed_url) : '';
  const mapLink = c.mapa?.link || (c.mapa?.latitude ? `https://www.google.com/maps/search/?api=1&query=${c.mapa.latitude},${c.mapa.longitude}` : '');

  const setAt = (list: string[], i: number, v: string) => { const next = [...list]; next[i] = v; return next; };

  const onBlur = (i: number) => {
    if (values[i] || errors[i]) setErrors((prev) => setAt(prev, i, validateField(campos[i], values[i] ?? '')));
  };

  const endpoint = f?.envio_email?.endpoint ?? '';
  const emailEndpoint = /^https:\/\//i.test(endpoint) ? endpoint : '';

  const resetFields = () => {
    setValues(campos.map(() => ''));
    setErrors(campos.map(() => ''));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'sending') return;
    const nextErrors = campos.map((fd, i) => validateField(fd, values[i] ?? ''));
    setErrors(nextErrors);
    const firstInvalid = nextErrors.findIndex(Boolean);
    if (firstInvalid >= 0) { fieldRefs.current[firstInvalid]?.focus(); setStatus('idle'); return; }
    const w = c.whatsapp ?? {};
    const filled = campos
      .map((fd, i) => ({ label: fd.rotulo || fd.nome || '', value: (values[i] ?? '').trim() }))
      .filter((l) => l.value);
    const lines = filled.map((l) => `*${l.label}:* ${l.value}`);
    const url = waLink(w.numero, `${w.mensagem_padrao || 'Olá! Vim pelo site.'}\n\n${lines.join('\n')}`);

    if (!emailEndpoint) {
      // Sem serviço de e-mail configurado: a solicitação segue direto para o WhatsApp
      if (url) openInNewTab(url);
      setStatus('success');
      resetFields();
      return;
    }

    setWaUrl(url);
    setStatus('sending');
    const honey = (e.currentTarget.elements.namedItem('_honey') as HTMLInputElement | null)?.value ?? '';
    const payload: Record<string, string> = {
      _subject: f?.envio_email?.assunto || 'Nova solicitação pelo site',
      _template: 'table',
      _honey: honey,
    };
    filled.forEach((l) => { payload[l.label] = l.value; });
    const emailIdx = campos.findIndex((fd) => fd.tipo === 'email');
    if (emailIdx >= 0 && values[emailIdx]) payload._replyto = values[emailIdx].trim();
    try {
      const res = await fetch(emailEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const body: { success?: unknown } = await res.json().catch(() => ({}));
      if (!res.ok || String(body.success) === 'false') throw new Error(res.statusText);
      setStatus('success');
      resetFields();
    } catch {
      setStatus('error');
    }
  };

  const renderField = (fd: CampoForm, i: number) => {
    const id = `ct-${fd.nome || i}`;
    const common = {
      id,
      name: fd.nome || `campo${i}`,
      required: !!fd.obrigatorio,
      'aria-required': fd.obrigatorio ? true : undefined,
      'aria-invalid': errors[i] ? true : undefined,
      value: values[i] ?? '',
      onChange: (e: { target: { value: string } }) => { const v = e.target.value; setValues((prev) => setAt(prev, i, v)); },
      onBlur: () => onBlur(i),
    };
    let control: ReactNode;
    if (fd.tipo === 'textarea') {
      control = <textarea {...common} ref={(el) => { fieldRefs.current[i] = el; }} rows={4} placeholder={fd.placeholder || ''} />;
    } else if (fd.tipo === 'select') {
      control = (
        <select {...common} ref={(el) => { fieldRefs.current[i] = el; }}>
          <option value="">{fd.placeholder || 'Selecione'}</option>
          {arr(fd.opcoes).map((o, k) => <option key={`${o}-${k}`} value={o}>{o}</option>)}
        </select>
      );
    } else {
      const type = inputType(fd);
      const autoComplete = type === 'email' ? 'email' : type === 'tel' ? 'tel' : fd.nome === 'nome' ? 'name' : 'off';
      control = <input {...common} ref={(el) => { fieldRefs.current[i] = el; }} type={type} placeholder={fd.placeholder || ''} autoComplete={autoComplete} />;
    }
    return (
      <div key={id} className={cx('field', fd.tipo === 'textarea' && 'field--wide', errors[i] && 'has-error')}>
        <label htmlFor={id}>
          {fd.rotulo || fd.nome || ''}
          {fd.obrigatorio && <>{' '}<span className="req" aria-hidden="true">*</span></>}
        </label>
        {control}
        <span className="field__error" aria-live="polite">{errors[i]}</span>
      </div>
    );
  };

  return (
    <section className="section contato" id="contato">
      <div className="container">
        <SectionHead d={c} />
        <div className={cx('contato__grid', !campos.length && 'contato__grid--single')}>
          <Reveal className="contato__info" from="left">
            {(c.telefone?.exibicao || c.whatsapp?.exibicao || c.email?.exibicao) && (
              <ul className="info-cards">
                {c.telefone?.exibicao && (
                  <InfoCard icon="fa-solid fa-phone" label="Telefone"><a href={safeUrl(c.telefone.link)}>{c.telefone.exibicao}</a></InfoCard>
                )}
                {c.whatsapp?.exibicao && (
                  <InfoCard icon="fa-brands fa-whatsapp" label="WhatsApp" extra="info-card--wa">
                    <a href={safeUrl(c.whatsapp.link || waLink(c.whatsapp.numero, c.whatsapp.mensagem_padrao))} target="_blank" rel="noopener">
                      {c.whatsapp.exibicao}
                    </a>
                  </InfoCard>
                )}
                {c.email?.exibicao && (
                  <InfoCard icon="fa-regular fa-envelope" label="E-mail">
                    <a href={safeUrl(c.email.link || `mailto:${c.email.exibicao}`)}><EmailText value={c.email.exibicao} /></a>
                  </InfoCard>
                )}
              </ul>
            )}
            {deps.length > 0 && (
              <div className="panel">
                <h3 className="panel__title"><Icon cls="fa-solid fa-sitemap" />Departamentos</h3>
                <ul className="deps">
                  {deps.map((d, i) => (
                    <li key={`${d.email}-${i}`}><span>{d.setor || ''}</span><a href={safeUrl(`mailto:${d.email}`)}><EmailText value={d.email} /></a></li>
                  ))}
                </ul>
              </div>
            )}
            {horas.length > 0 && (
              <div className="panel">
                <h3 className="panel__title"><Icon cls="fa-regular fa-clock" />Horário de atendimento</h3>
                <ul className="hours">
                  {horas.map((h, i) => (
                    <li key={`${h.dias}-${i}`}>
                      <span>{h.dias || ''}</span>
                      <strong className={/fechado/i.test(h.horario || '') ? 'is-closed' : undefined}>{h.horario || ''}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {endereco && (
              <div className="panel panel--address">
                <h3 className="panel__title"><Icon cls="fa-solid fa-location-dot" />Endereço</h3>
                <address>{endereco}</address>
                {referencia && <p className="panel__ref"><Icon cls="fa-solid fa-signs-post" />{referencia}</p>}
              </div>
            )}
            {redes.length > 0 && (
              <ul className="follow">
                {redes.map((r, i) => (
                  <li key={`${r.url}-${i}`}>
                    <a href={safeUrl(r.url)} target="_blank" rel="noopener" aria-label={`${r.nome || ''}${r.seguidores ? `, ${r.seguidores} seguidores` : ''}`}>
                      <Icon cls={r.icone} fallback="fa-solid fa-link" />
                      <span>
                        {r.seguidores
                          ? <><strong>{r.seguidores}</strong><small>{r.nome || ''}</small></>
                          : <strong>{r.nome || ''}</strong>}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Reveal>
          {campos.length > 0 && (
            <Reveal className="contato__form-wrap" from="right">
              <form className="contact-form" id="contact-form" noValidate onSubmit={onSubmit}>
                {f?.titulo && <h3 className="contact-form__title">{f.titulo}</h3>}
                <div className="contact-form__grid">{campos.map(renderField)}</div>
                {emailEndpoint && (
                  <input className="contact-form__hp" type="text" name="_honey" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                )}
                <button className="btn btn--accent btn--lg btn--block" type="submit" disabled={status === 'sending'} aria-busy={status === 'sending'}>
                  <Icon cls={status === 'sending' ? 'fa-solid fa-spinner fa-spin' : emailEndpoint ? 'fa-regular fa-paper-plane' : 'fa-brands fa-whatsapp'} />
                  <span>{status === 'sending' ? 'Enviando…' : f?.botao || 'Enviar'}</span>
                </button>
                {f?.aviso_privacidade && (
                  <p className="contact-form__privacy">
                    <Icon cls="fa-solid fa-lock" />
                    <span>
                      {f.aviso_privacidade}
                      {isSafe(f.link_privacidade) && <>{' '}<a {...linkProps(f.link_privacidade)}>Política de Privacidade</a>.</>}
                    </span>
                  </p>
                )}
                <div className="form-msg form-msg--success" role="status" aria-live="polite" hidden={status !== 'success'}>
                  {status === 'success' && (
                    <>
                      <p><Icon cls="fa-solid fa-circle-check" /><span>{f?.mensagem_sucesso || 'Mensagem enviada!'}</span></p>
                      {emailEndpoint && waUrl && (
                        <a className="btn btn--primary" href={safeUrl(waUrl)} target="_blank" rel="noopener">
                          <Icon cls="fa-brands fa-whatsapp" /><span>{f?.continuar_whatsapp || 'Continuar pelo WhatsApp'}</span>
                        </a>
                      )}
                    </>
                  )}
                </div>
                <div className="form-msg form-msg--error" role="alert" hidden={status !== 'error'}>
                  {status === 'error' && (
                    <>
                      <p><Icon cls="fa-solid fa-triangle-exclamation" /><span>{f?.mensagem_erro || 'Não foi possível enviar agora. Tente novamente ou fale com a gente pelo WhatsApp.'}</span></p>
                      {waUrl && (
                        <a className="btn btn--primary" href={safeUrl(waUrl)} target="_blank" rel="noopener">
                          <Icon cls="fa-brands fa-whatsapp" /><span>Enviar pelo WhatsApp</span>
                        </a>
                      )}
                    </>
                  )}
                </div>
              </form>
            </Reveal>
          )}
        </div>
      </div>
      {mapUrl && (
        <div className="map">
          <iframe
            src={mapUrl}
            title={`Mapa de localização${data.agencia?.nome ? ` — ${data.agencia.nome}` : ''}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
          {mapLink && (
            <a className="btn btn--primary map__link" href={safeUrl(mapLink)} target="_blank" rel="noopener">
              <Icon cls="fa-solid fa-map-location-dot" /><span>Abrir no Google Maps</span>
            </a>
          )}
        </div>
      )}
    </section>
  );
}
