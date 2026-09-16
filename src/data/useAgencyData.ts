import { useCallback, useEffect, useState } from 'react';
import type { AgencyData } from '../types/agencia';

export const DATA_URL =
  new URLSearchParams(location.search).get('data') ?? `${import.meta.env.BASE_URL}agencia-viagens.json`;

export type AgencyState =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'ready'; data: AgencyData };

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Carrega o JSON da agência (loading → ready | error), com cancelamento ao desmontar. */
export function useAgencyData(url: string = DATA_URL) {
  const [state, setState] = useState<AgencyState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });
    (async () => {
      try {
        const res = await fetch(url, { cache: 'no-store', signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status} ao buscar ${url}`);
        const json: unknown = await res.json();
        if (!isRecord(json)) throw new Error('JSON inválido');
        setState({ status: 'ready', data: json as AgencyData });
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        const message = err instanceof Error ? err.message : String(err);
        setState({ status: 'error', error: message });
      }
    })();
    return () => controller.abort();
  }, [url, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { state, retry };
}
