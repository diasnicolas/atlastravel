/* Lightbox: anterior/próximo, legenda, Esc, setas do teclado, foco preso e clique fora para fechar. */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import type { Foto } from '../types/agencia';
import { cx } from '../lib/css';
import { safeUrl } from '../lib/url';
import { useBodyClass } from '../hooks/useBodyClass';
import { focusablesIn, trapTab } from '../hooks/useFocusTrap';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { Icon } from './ui';

const BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

interface LightboxProps {
  photos: Foto[];
  index: number;
  open: boolean;
  onClose: () => void;
  onNavigate: (delta: number) => void;
}

export function Lightbox({ photos, index, open, onClose, onNavigate }: LightboxProps) {
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(false);   // remove [hidden]
  const [faded, setFaded] = useState(false);   // classe .is-open (opacidade)
  const [loadedSrc, setLoadedSrc] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useBodyClass('lb-open', open);

  // Mostra imediatamente; ao fechar, espera o fade antes de esconder
  useEffect(() => {
    if (open) { setShown(true); return; }
    setFaded(false);
    const t = window.setTimeout(() => setShown(false), reduced ? 0 : 250);
    return () => clearTimeout(t);
  }, [open, reduced]);

  // Foca o botão fechar (o que também calcula o estilo inicial) e inicia o fade-in no próximo quadro
  useLayoutEffect(() => {
    if (!open || !shown) return;
    closeRef.current?.focus();
    const f = requestAnimationFrame(() => setFaded(true));
    return () => cancelAnimationFrame(f);
  }, [open, shown]);

  // Teclado: Esc, setas e foco preso
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') onNavigate(1);
      else if (e.key === 'ArrowLeft') onNavigate(-1);
      else if (e.key === 'Tab') trapTab(e, focusablesIn(rootRef.current).filter((el) => el.tagName === 'BUTTON'));
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose, onNavigate]);

  const photo = photos[index];
  const src = photo ? safeUrl(photo.url || photo.miniatura) : BLANK;
  const multi = photos.length > 1;

  const onBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target instanceof Element && e.target.closest('button, .lightbox__img, .lightbox__caption')) return;
    onClose();
  };

  return createPortal(
    <div
      ref={rootRef}
      className={cx('lightbox', faded && 'is-open')}
      role="dialog"
      aria-modal="true"
      aria-label="Visualizador de fotos"
      hidden={!shown}
      onClick={onBackdropClick}
    >
      <button ref={closeRef} className="lightbox__close" type="button" aria-label="Fechar" onClick={onClose}>
        <Icon cls="fa-solid fa-xmark" />
      </button>
      <button className="lightbox__nav lightbox__nav--prev" type="button" aria-label="Anterior" hidden={!multi} onClick={() => onNavigate(-1)}>
        <Icon cls="fa-solid fa-chevron-left" />
      </button>
      <figure className="lightbox__figure">
        <img
          className={cx('lightbox__img', loadedSrc === src && 'is-loaded')}
          src={src}
          alt={photo ? photo.alt || photo.titulo || '' : ''}
          onLoad={() => setLoadedSrc(src)}
        />
        <figcaption className="lightbox__caption">
          {photo && (
            <>
              <strong>{photo.titulo || ''}</strong>
              {photo.local && <span><Icon cls="fa-solid fa-location-dot" />{photo.local}</span>}
              <em>{index + 1} / {photos.length}</em>
            </>
          )}
        </figcaption>
      </figure>
      <button className="lightbox__nav lightbox__nav--next" type="button" aria-label="Próximo" hidden={!multi} onClick={() => onNavigate(1)}>
        <Icon cls="fa-solid fa-chevron-right" />
      </button>
    </div>,
    document.body,
  );
}
