import { useEffect, useRef, useState } from 'react';

/* Um único IntersectionObserver compartilhado para as animações de entrada. */
const callbacks = new WeakMap<Element, () => void>();
let observer: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver | null {
  if (!('IntersectionObserver' in window)) return null;
  observer ??= new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      observer?.unobserve(en.target);
      callbacks.get(en.target)?.();
      callbacks.delete(en.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  return observer;
}

/** Marca o elemento como visível na primeira vez que entra na tela. */
export function useReveal<T extends Element>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    const io = getObserver();
    if (!el || visible) return;
    if (!io) { setVisible(true); return; }
    callbacks.set(el, () => setVisible(true));
    io.observe(el);
    return () => { io.unobserve(el); callbacks.delete(el); };
  }, [visible]);
  return [ref, visible] as const;
}
