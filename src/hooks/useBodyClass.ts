import { useEffect } from 'react';

/** Aplica uma classe no <body> enquanto `active` (ex.: trava de rolagem com menu/lightbox abertos). */
export function useBodyClass(className: string, active: boolean): void {
  useEffect(() => {
    if (!active) return;
    document.body.classList.add(className);
    return () => document.body.classList.remove(className);
  }, [className, active]);
}

/** Trava a rolagem da página (classes `nav-open` / `lb-open` definem overflow: hidden). */
export const useLockScroll = useBodyClass;
