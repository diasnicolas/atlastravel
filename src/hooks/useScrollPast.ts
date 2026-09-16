import { useEffect, useState } from 'react';

/** true quando window.scrollY passa do limite (atualização limitada por rAF). */
export function useScrollPast(threshold: number): boolean {
  const [past, setPast] = useState(() => window.scrollY > threshold);
  useEffect(() => {
    let frame = 0;
    const update = () => { frame = 0; setPast(window.scrollY > threshold); };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => { window.removeEventListener('scroll', onScroll); if (frame) cancelAnimationFrame(frame); };
  }, [threshold]);
  return past;
}
