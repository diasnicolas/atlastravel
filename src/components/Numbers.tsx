/* Faixa de números com contagem animada. */
import type { AgencyData, Numero } from '../types/agencia';
import { arr, fmtNum } from '../lib/format';
import { useCountUp } from '../hooks/useCountUp';
import { Reveal } from './ui';

function NumberItem({ n }: { n: Numero }) {
  const [ref, value] = useCountUp<HTMLSpanElement>(Number(n.valor) || 0);
  return (
    <Reveal as="li" className="numeros__item">
      <strong className="numeros__value"><span ref={ref}>{fmtNum(value)}</span><em>{n.sufixo || ''}</em></strong>
      <span className="numeros__label">{n.rotulo}</span>
    </Reveal>
  );
}

export function Numbers({ data }: { data: AgencyData }) {
  const nums = arr(data.sobre?.numeros);
  if (!nums.length) return null;
  return (
    <section className="numeros-band" id="sobre-numeros" aria-label="Nossos números">
      <svg className="numeros-band__art" viewBox="0 0 1440 320" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 220 C 240 140, 420 300, 720 210 S 1200 120, 1440 200" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 10" />
        <path d="M0 120 C 300 40, 520 200, 820 110 S 1260 30, 1440 90" fill="none" stroke="currentColor" strokeWidth="1" opacity=".6" />
      </svg>
      <div className="container">
        <ul className="numeros">
          {nums.map((n, i) => <NumberItem key={`${n.rotulo}-${i}`} n={n} />)}
        </ul>
      </div>
    </section>
  );
}
