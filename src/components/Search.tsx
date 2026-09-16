/* Busca flutuante (→ WhatsApp) + estatísticas do hero. */
import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import type { AgencyData, CampoBusca } from '../types/agencia';
import { arr, fmtDateBR } from '../lib/format';
import { cx } from '../lib/css';
import { openInNewTab, waLink } from '../lib/whatsapp';
import { Icon, Reveal } from './ui';

const iconFor = (c: CampoBusca): string =>
  ({ date: 'fa-regular fa-calendar', select: 'fa-solid fa-user-group', text: 'fa-solid fa-location-dot' } as Record<string, string>)[c.tipo ?? ''] ||
  'fa-solid fa-magnifying-glass';

/** Data local de hoje no formato do input date. */
function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const initialValue = (c: CampoBusca): string => (c.tipo === 'select' && !c.placeholder ? arr(c.opcoes)[0] ?? '' : '');

export function Search({ data, flat }: { data: AgencyData; flat: boolean }) {
  const h = data.hero ?? {};
  const b = h.busca;
  const stats = arr(h.estatisticas);
  const campos = b?.ativo ? arr(b.campos) : [];
  const [values, setValues] = useState<string[]>(() => campos.map(initialValue));
  const [error, setError] = useState('');

  if (!campos.length && !stats.length) return null;
  const today = todayIso();

  const onSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    const lines: string[] = [];
    let ida = '';
    let volta = '';
    campos.forEach((c, i) => {
      const v = (values[i] ?? '').trim();
      if (!v) return;
      const isDate = c.tipo === 'date';
      if (isDate) { if (!ida) ida = v; else volta = v; }
      lines.push(`• ${c.rotulo || c.nome || `campo${i}`}: ${isDate ? fmtDateBR(v) : v}`);
    });
    if (!lines.length) { setError('Preencha pelo menos um campo para buscar.'); return; }
    if (ida && volta && volta < ida) { setError('A data de volta deve ser posterior à data de ida.'); return; }
    setError('');
    const url = waLink(data.contato?.whatsapp?.numero, `Olá! Encontrei vocês pelo site e gostaria de buscar pacotes:\n${lines.join('\n')}`);
    if (url) openInNewTab(url);
    else document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' });
  };

  const setValue = (i: number, v: string) => setValues((prev) => { const next = [...prev]; next[i] = v; return next; });

  return (
    <section className={cx('search-wrap', flat && 'search-wrap--flat')} id="hero-busca" aria-label="Busca de pacotes">
      <div className="container">
        {campos.length > 0 && (
          <Reveal as="form" className="search" id="search-form" noValidate onSubmit={onSubmit}>
            <div className="search__fields">
              {campos.map((c, i) => {
                const id = `busca-${c.nome || i}`;
                const name = c.nome || `campo${i}`;
                return (
                  <div key={id} className={`search__field search__field--${c.tipo || 'text'}`}>
                    <label htmlFor={id}><Icon cls={iconFor(c)} />{c.rotulo || ''}</label>
                    {c.tipo === 'select' ? (
                      <select id={id} name={name} value={values[i] ?? ''} onChange={(e) => setValue(i, e.target.value)}>
                        {c.placeholder && <option value="">{c.placeholder}</option>}
                        {arr(c.opcoes).map((o, k) => <option key={`${o}-${k}`} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input
                        id={id}
                        name={name}
                        type={c.tipo === 'date' ? 'date' : 'text'}
                        placeholder={c.placeholder || ''}
                        min={c.tipo === 'date' ? today : undefined}
                        value={values[i] ?? ''}
                        onChange={(e) => setValue(i, e.target.value)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <button className="btn btn--accent btn--lg search__submit" type="submit">
              <Icon cls="fa-solid fa-magnifying-glass" /><span>{b?.botao || 'Buscar'}</span>
            </button>
            <p className="search__error" role="alert" hidden={!error}>{error}</p>
          </Reveal>
        )}
        {stats.length > 0 && (
          <Reveal as="ul" className={cx('stats', !campos.length && 'stats--solo')}>
            {stats.map((s, i) => (
              <li key={`${s.rotulo}-${i}`} className="stats__item">
                <strong className="stats__value">{s.valor}</strong>
                <span className="stats__label">{s.rotulo}</span>
              </li>
            ))}
          </Reveal>
        )}
      </div>
    </section>
  );
}
