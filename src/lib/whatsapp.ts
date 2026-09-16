/** Monta link do WhatsApp (wa.me) com mensagem opcional. */
export function waLink(numero: unknown, message?: string): string {
  const num = String(numero ?? '').replace(/\D/g, '');
  if (!num) return '';
  return `https://wa.me/${num}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}

/** Abre uma URL em nova aba sem expor window.opener. */
export function openInNewTab(url: string): void {
  window.open(url, '_blank', 'noopener');
}
