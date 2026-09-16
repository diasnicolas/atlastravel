import { useRef } from 'react';
import type { TouchEvent } from 'react';

/** Gesto horizontal de arrastar: chama onSwipe(+1) para a esquerda e onSwipe(-1) para a direita. */
export function useSwipe(onSwipe: (dir: 1 | -1) => void, threshold = 50) {
  const startX = useRef<number | null>(null);
  return {
    onTouchStart: (e: TouchEvent) => { startX.current = e.touches[0]?.clientX ?? null; },
    onTouchEnd: (e: TouchEvent) => {
      const start = startX.current;
      startX.current = null;
      const end = e.changedTouches[0]?.clientX;
      if (start === null || end === undefined) return;
      const dx = end - start;
      if (Math.abs(dx) > threshold) onSwipe(dx < 0 ? 1 : -1);
    },
  };
}
