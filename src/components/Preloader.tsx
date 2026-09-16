import { useEffect, useState } from 'react';
import { cx } from '../lib/css';

/** Preloader temático: some com fade quando `done` e é removido após a transição. */
export function Preloader({ done }: { done: boolean }) {
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    if (!done) { setRemoved(false); return; }
    const t = window.setTimeout(() => setRemoved(true), 700);
    return () => clearTimeout(t);
  }, [done]);

  if (removed) return null;
  return (
    <div className={cx('preloader', done && 'is-done')} role="status" aria-live="polite">
      <div className="preloader__inner">
        <svg className="preloader__plane" viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeOpacity=".15" strokeWidth="3" />
          <circle className="preloader__orbit" cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="70 250" />
          <path d="M60 36l6 18 18 6-18 6-6 18-6-18-18-6 18-6z" fill="currentColor" opacity=".9" />
        </svg>
        <span className="preloader__text">Carregando</span>
      </div>
    </div>
  );
}
