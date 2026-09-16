import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/** Contador animado (ease-out cúbico) que dispara quando o elemento fica 40% visível. */
export function useCountUp<T extends Element>(end: number, duration = 1800) {
  const ref = useRef<T>(null);
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || started) return;
    if (!('IntersectionObserver' in window)) { setStarted(true); return; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((en) => en.isIntersecting)) { setStarted(true); io.disconnect(); }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started || reduced) return;
    let frame = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      setValue(Math.round(end * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [started, reduced, end, duration]);

  return [ref, reduced ? end : value] as const;
}
