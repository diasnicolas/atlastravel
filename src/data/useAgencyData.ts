import { useCallback, useEffect, useState } from 'react';
import type { AgencyData } from '../types/agencia';
import { fetchZapturize } from './zapturize';

/** JSON local (fallback e modo `?data=<url>` para testes). */
export const DATA_URL =
  new URLSearchParams(location.search).get('data') ?? `${import.meta.env.BASE_URL}agencia-viagens.json`;

/** API pública da ZapTurize (painel da agência). Sem as duas variáveis, o site usa só o JSON local. */
const ZAPTURIZE_URL: string = import.meta.env.VITE_ZAPTURIZE_API_URL ?? '';
const ZAPTURIZE_KEY: string = import.meta.env.VITE_ZAPTURIZE_API_KEY ?? '';
const useZapturize = !!ZAPTURIZE_URL && !!ZAPTURIZE_KEY && !new URLSearchParams(location.search).has('data');

export type DataSource = 'zapturize' | 'local';

export type AgencyState =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'ready'; data: AgencyData; source: DataSource };

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

async function fetchLocal(url: string, signal: AbortSignal): Promise<AgencyData> {
  const res = await fetch(url, { cache: 'no-store', signal });
  if (!res.ok) throw new Error(`HTTP ${res.status} ao buscar ${url}`);
  const json: unknown = await res.json();
  if (!isRecord(json)) throw new Error('JSON inválido');
  return json as AgencyData;
}

/**
 * Carrega os dados da agência (loading → ready | error), com cancelamento ao desmontar.
 * Ordem: API da ZapTurize (conteúdo editado no painel) → JSON local, se a API falhar.
 */
export function useAgencyData(url: string = DATA_URL) {
  const [state, setState] = useState<AgencyState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });
    (async () => {
      let data: AgencyData | undefined;
      let source: DataSource = 'local';
      let apiError: string | undefined;

      if (useZapturize) {
        try {
          data = await fetchZapturize(ZAPTURIZE_URL, ZAPTURIZE_KEY, controller.signal);
          source = 'zapturize';
        } catch (err: unknown) {
          if (controller.signal.aborted) return;
          apiError = err instanceof Error ? err.message : String(err);
          console.warn(`[atlas] API ZapTurize indisponível (${apiError}); usando ${url}`);
        }
      }

      try {
        if (!data) data = await fetchLocal(url, controller.signal);
        document.documentElement.dataset.source = source;
        setState({ status: 'ready', data, source });
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        const message = err instanceof Error ? err.message : String(err);
        setState({ status: 'error', error: apiError ? `${apiError}; ${message}` : message });
      }
    })();
    return () => controller.abort();
  }, [url, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { state, retry };
}
