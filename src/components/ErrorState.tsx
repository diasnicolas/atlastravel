import { useEffect } from 'react';
import { Icon } from './ui';

/** Mensagem amigável quando o JSON da agência não pode ser carregado. */
export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  useEffect(() => { document.title = 'Não foi possível carregar o site'; }, []);

  return (
    <div className="app-error">
      <div className="app-error__card" role="alert">
        <span className="app-error__icon"><Icon cls="fa-solid fa-plane-slash" /></span>
        <h1>Não foi possível carregar o site</h1>
        <p>
          Os dados da agência não puderam ser lidos. Este site precisa ser aberto por um servidor HTTP — abrir o
          arquivo diretamente (file://) bloqueia o carregamento do JSON.
        </p>
        <p>Na pasta do projeto, para desenvolvimento, execute:</p>
        <pre><code>npm run dev</code></pre>
        <p>Ou gere o build e sirva a pasta <code>dist</code> por HTTP (por exemplo):</p>
        <pre><code>npm run build{'\n'}npm run preview</code></pre>
        <p className="app-error__detail">Detalhe técnico: {message}</p>
        <button className="btn btn--primary" type="button" onClick={onRetry}>
          <Icon cls="fa-solid fa-rotate-right" />
          <span>Tentar novamente</span>
        </button>
      </div>
    </div>
  );
}
