/*
 * Envio de leads para o CRM da ZapTurize pela rota pública de formulários da landing page:
 *   POST {VITE_ZAPTURIZE_API_URL}/forms/{VITE_ZAPTURIZE_FORM_KEY}/submit   (header x-api-key)
 *
 * A rota usa a mesma chave pública de leitura da landing page (não é segredo) e é protegida
 * por rate limit, honeypot e deduplicação no servidor. O formulário precisa existir no painel
 * (Formulários) com a chave FORM_KEY; a tradução dos nomes dos campos do site para as chaves
 * do painel está em FIELD_MAP.
 */

// Guarda para o módulo poder ser importado fora do Vite (testes em Node).
const env: Record<string, string | undefined> = (import.meta as { env?: Record<string, string | undefined> }).env ?? {};
const API_URL: string = env.VITE_ZAPTURIZE_API_URL ?? '';
const API_KEY: string = env.VITE_ZAPTURIZE_API_KEY ?? '';
const FORM_KEY: string = env.VITE_ZAPTURIZE_FORM_KEY ?? '';

/** Integração ativa quando as três variáveis estão definidas. */
export const leadsEnabled = !!API_URL && !!API_KEY && !!FORM_KEY;

export type LeadResult = { ok: true; submissionId?: string } | { ok: false; error: string };

/**
 * Nome do campo no site (`campos[].nome` do JSON) → chave do campo no formulário do painel.
 * O servidor descarta chaves que não existem no formulário, então o que não tiver campo
 * próprio entra no texto da mensagem (ver `periodo` abaixo).
 */
const FIELD_MAP: Record<string, string> = {
  nome: 'campo-nome',
  email: 'campo-email',
  telefone: 'campo-whatsapp',
  destino: 'campo-destino',
  servico: 'campo-necessidade',
  mensagem: 'campo-mensagem',
  website: 'website', // honeypot
};

/** Campos sem correspondente no painel: vão como linha "Rótulo: valor" dentro da mensagem. */
const INTO_MESSAGE: Record<string, string> = { periodo: 'Período da viagem' };

/** Monta o corpo da submissão a partir dos campos do site. */
export function buildLeadPayload(values: Record<string, string>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  const extra: string[] = [];
  for (const [name, raw] of Object.entries(values)) {
    const value = raw.trim();
    if (!value) continue;
    if (INTO_MESSAGE[name]) { extra.push(`${INTO_MESSAGE[name]}: ${value}`); continue; }
    payload[FIELD_MAP[name] ?? name] = value;
  }
  if (extra.length) {
    const msgKey = FIELD_MAP.mensagem;
    const msg = typeof payload[msgKey] === 'string' ? String(payload[msgKey]) : '';
    payload[msgKey] = [msg, ...extra].filter(Boolean).join('\n');
  }
  payload.consent = true;
  return payload;
}

/**
 * Envia os campos preenchidos (chave = `nome` do campo no JSON do site) para o CRM.
 * Nunca lança: a falha é devolvida para o chamador decidir (o visitante segue para o WhatsApp).
 */
export async function submitLead(values: Record<string, string>, timeoutMs = 8000): Promise<LeadResult> {
  if (!leadsEnabled) return { ok: false, error: 'Integração com o CRM não configurada' };
  const url = `${API_URL.replace(/\/+$/, '')}/forms/${encodeURIComponent(FORM_KEY)}/submit`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'x-api-key': API_KEY },
      body: JSON.stringify(buildLeadPayload(values)),
      keepalive: true,
      signal: AbortSignal.timeout(timeoutMs),
    });
    const body: { ok?: unknown; submissionId?: string; message?: string; errors?: { field: string; message: string }[] } =
      await res.json().catch(() => ({}));
    if (!res.ok || body.ok === false) {
      const detail = body.errors?.map((e) => `${e.field}: ${e.message}`).join('; ') || body.message || res.statusText;
      return { ok: false, error: `HTTP ${res.status} ${detail}`.trim() };
    }
    return { ok: true, submissionId: body.submissionId };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
