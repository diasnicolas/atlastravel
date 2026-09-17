/*
 * Adaptador da API pública de Landing Pages da ZapTurize → formato do site (AgencyData).
 *
 * A API devolve `sections[] → datasets[] → fields[]` (chaves em kebab-case, como no JSON
 * importado no painel). Este módulo é puro (sem React, sem import.meta) para poder ser
 * testado fora do navegador.
 */
import type {
  AgencyData, Link, MembroEquipe, Servico, Depoimento, Foto, FaqItem, CampoForm, RedeSocial,
} from '../types/agencia';

export interface ZapField { key?: string; fieldType?: string; value?: unknown }
export interface ZapDataset { key?: string; fields?: ZapField[] }
export interface ZapSection { key?: string; type?: string; enabled?: boolean; datasets?: ZapDataset[] }
export interface ZapLandingPage {
  slug?: string;
  title?: string;
  sections?: ZapSection[];
  content?: { sections?: ZapSection[] };
}

type Rec = Record<string, unknown>;

/* ─── utilitários de valor ─────────────────────────────────────────────────── */

const isRec = (v: unknown): v is Rec => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Normaliza chaves como o painel: minúsculas, só [a-z0-9-] (underscore vira hífen). */
const norm = (k: unknown): string =>
  String(k ?? '').trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

const str = (v: unknown): string | undefined => {
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  return t ? t : undefined;
};

const num = (v: unknown): number | undefined => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : undefined;
  if (typeof v === 'string' && v.trim()) { const n = Number(v); return Number.isFinite(n) ? n : undefined; }
  return undefined;
};

const bool = (v: unknown): boolean | undefined => {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') { const t = v.trim().toLowerCase(); if (t === 'true') return true; if (t === 'false') return false; }
  return undefined;
};

/** Campo/propriedade "image": string ou { url, thumbnailUrl }. */
const img = (v: unknown): string | undefined => {
  if (typeof v === 'string') return str(v);
  return isRec(v) ? str(v.url) : undefined;
};
const thumb = (v: unknown): string | undefined => (isRec(v) ? str(v.thumbnailUrl) : undefined);

/** Itens de um campo "list": { properties, items } ou array direto. */
const items = (v: unknown): unknown[] => {
  if (Array.isArray(v)) return v;
  if (isRec(v) && Array.isArray(v.items)) return v.items;
  return [];
};

/** Lê `item[chave]` aceitando kebab-case e snake_case. */
const pick = (item: unknown, key: string): unknown => {
  if (!isRec(item)) return undefined;
  if (key in item) return item[key];
  const want = norm(key);
  for (const k of Object.keys(item)) if (norm(k) === want) return item[k];
  return undefined;
};

/** Lista simples (itens { texto } ou strings) → string[]. */
const strList = (v: unknown, prop = 'texto'): string[] =>
  items(v).map((it) => (typeof it === 'string' ? str(it) : str(pick(it, prop)))).filter((s): s is string => !!s);

/** Remove chaves undefined (recursivo) para o resultado ficar igual ao JSON estático. */
function compact<T>(value: T): T {
  if (Array.isArray(value)) return value.map(compact) as unknown as T;
  if (isRec(value)) {
    const out: Rec = {};
    for (const [k, v] of Object.entries(value)) {
      if (v === undefined) continue;
      out[k] = compact(v);
    }
    return out as T;
  }
  return value;
}

/* ─── acesso seção / dataset / campo ───────────────────────────────────────── */

type Dataset = { get: (field: string) => unknown };
type Section = { ds: (dataset: string) => Dataset };

function indexPage(page: ZapLandingPage): Map<string, Map<string, Map<string, unknown>>> {
  const sections = Array.isArray(page.sections) && page.sections.length
    ? page.sections
    : (page.content?.sections ?? []);
  const index = new Map<string, Map<string, Map<string, unknown>>>();
  for (const s of sections) {
    if (!s || s.enabled === false) continue;
    const dsMap = new Map<string, Map<string, unknown>>();
    for (const d of s.datasets ?? []) {
      const fMap = new Map<string, unknown>();
      for (const f of d?.fields ?? []) if (f?.key) fMap.set(norm(f.key), f.value);
      dsMap.set(norm(d?.key), fMap);
    }
    index.set(norm(s.key), dsMap);
  }
  return index;
}

const EMPTY_DS: Dataset = { get: () => undefined };

/* ─── conversão ────────────────────────────────────────────────────────────── */

/** Converte a resposta da API pública em AgencyData. Seções desabilitadas/ausentes ficam undefined. */
export function toAgencyData(page: ZapLandingPage): AgencyData {
  const index = indexPage(page);
  const section = (key: string): Section | undefined => {
    const dsMap = index.get(norm(key));
    if (!dsMap) return undefined;
    return { ds: (d) => { const f = dsMap.get(norm(d)); return f ? { get: (k) => f.get(norm(k)) } : EMPTY_DS; } };
  };

  const link = (d: Dataset): Link | undefined => {
    const l: Link = { texto: str(d.get('texto')), link: str(d.get('link')), icone: str(d.get('icone')) };
    return l.texto || l.link ? l : undefined;
  };

  const out: AgencyData = {};

  /* agência */
  const ag = section('agencia');
  if (ag) {
    const dados = ag.ds('dados'); const logo = ag.ds('logotipo'); const iv = ag.ds('identidade-visual');
    out.agencia = {
      nome: str(dados.get('nome')),
      nome_curto: str(dados.get('nome-curto')),
      slogan: str(dados.get('slogan')),
      descricao_curta: str(dados.get('descricao-curta')),
      ano_fundacao: num(dados.get('ano-fundacao')) ?? str(dados.get('ano-fundacao')),
      cnpj: str(dados.get('cnpj')),
      cadastur: str(dados.get('cadastur')),
      logotipo: {
        principal: img(logo.get('principal')),
        branco: img(logo.get('branco')),
        icone: img(logo.get('icone')),
        favicon: img(logo.get('favicon')),
        alt: str(logo.get('alt')),
      },
      identidade_visual: {
        cor_primaria: str(iv.get('cor-primaria')),
        cor_secundaria: str(iv.get('cor-secundaria')),
        cor_destaque: str(iv.get('cor-destaque')),
        cor_escura: str(iv.get('cor-escura')),
        cor_clara: str(iv.get('cor-clara')),
        fonte_titulos: str(iv.get('fonte-titulos')),
        fonte_textos: str(iv.get('fonte-textos')),
      },
    };
  }

  /* seo */
  const seo = section('seo');
  if (seo) {
    const m = seo.ds('meta');
    out.seo = {
      titulo: str(m.get('titulo')),
      descricao: str(m.get('descricao')),
      palavras_chave: strList(m.get('palavras-chave')),
      imagem_compartilhamento: img(m.get('imagem-compartilhamento')),
    };
  }

  /* menu */
  const menu = section('menu');
  if (menu) {
    out.menu = items(menu.ds('itens').get('itens'))
      .map((it) => ({ rotulo: str(pick(it, 'rotulo')), ancora: str(pick(it, 'ancora')) }))
      .filter((m) => m.rotulo);
  }

  /* hero */
  const hero = section('hero');
  if (hero) {
    const t = hero.ds('textos');
    out.hero = {
      etiqueta: str(t.get('etiqueta')),
      titulo: str(t.get('titulo')),
      titulo_destaque: str(t.get('titulo-destaque')),
      subtitulo: str(t.get('subtitulo')),
      imagem_fundo: img(hero.ds('imagem').get('imagem-fundo')),
      video_fundo: null,
      overlay_opacidade: num(t.get('overlay-opacidade')),
      cta_primario: link(hero.ds('cta-primario')),
      cta_secundario: link(hero.ds('cta-secundario')),
      slides: items(hero.ds('slides').get('slides'))
        .map((it) => ({ titulo: str(pick(it, 'titulo')), subtitulo: str(pick(it, 'subtitulo')), imagem: img(pick(it, 'imagem')) }))
        .filter((s) => s.titulo || s.imagem),
      busca: { ativo: false },
    };
  }

  /* sobre + equipe */
  const sobre = section('sobre');
  const equipe = section('equipe');
  if (sobre || equipe) {
    const t = sobre?.ds('textos') ?? EMPTY_DS;
    const im = sobre?.ds('imagens') ?? EMPTY_DS;
    const selo = sobre?.ds('selo-experiencia') ?? EMPTY_DS;
    const mvv = sobre?.ds('missao-visao-valores') ?? EMPTY_DS;
    const et = equipe?.ds('textos') ?? EMPTY_DS;
    const membros: MembroEquipe[] = items(equipe?.ds('membros').get('membros')).map((it) => {
      const igUser = str(pick(it, 'instagram-usuario')); const igUrl = str(pick(it, 'instagram-url'));
      return {
        nome: str(pick(it, 'nome')),
        nome_completo: str(pick(it, 'nome-completo')),
        cargo: str(pick(it, 'cargo')),
        bio: str(pick(it, 'bio')),
        especialidade: str(pick(it, 'especialidade')),
        foto: img(pick(it, 'foto')),
        instagram: igUser || igUrl ? { usuario: igUser, url: igUrl } : undefined,
      };
    }).filter((m) => m.nome);
    const seloValor = str(selo.get('valor')); const seloRotulo = str(selo.get('rotulo'));
    out.sobre = {
      etiqueta: str(t.get('etiqueta')),
      titulo: str(t.get('titulo')),
      subtitulo: str(t.get('subtitulo')),
      paragrafos: strList(t.get('paragrafos')),
      imagem_principal: img(im.get('imagem-principal')),
      imagem_secundaria: img(im.get('imagem-secundaria')),
      selo_experiencia: seloValor || seloRotulo ? { valor: seloValor, rotulo: seloRotulo } : undefined,
      missao: str(mvv.get('missao')),
      visao: str(mvv.get('visao')),
      valores: strList(mvv.get('valores')),
      equipe_etiqueta: str(et.get('etiqueta')),
      equipe_titulo: str(et.get('titulo')),
      equipe_subtitulo: str(et.get('subtitulo')),
      equipe: membros,
      cta: sobre ? link(sobre.ds('cta')) : undefined,
    };
  }

  /* diferenciais */
  const dif = section('diferenciais');
  if (dif) {
    const t = dif.ds('textos');
    out.diferenciais = {
      etiqueta: str(t.get('etiqueta')),
      titulo: str(t.get('titulo')),
      subtitulo: str(t.get('subtitulo')),
      imagem: img(dif.ds('imagem').get('imagem')),
      itens: items(dif.ds('itens').get('itens'))
        .map((it) => ({ icone: str(pick(it, 'icone')), titulo: str(pick(it, 'titulo')), descricao: str(pick(it, 'descricao')) }))
        .filter((i) => i.titulo),
    };
  }

  /* serviços */
  const serv = section('servicos');
  if (serv) {
    const t = serv.ds('textos');
    const itens: Servico[] = items(serv.ds('itens').get('itens')).map((it) => {
      const ctaTexto = str(pick(it, 'cta-texto')); const ctaLink = str(pick(it, 'cta-link'));
      return {
        id: str(pick(it, 'id')),
        icone: str(pick(it, 'icone')),
        titulo: str(pick(it, 'titulo')),
        descricao: str(pick(it, 'descricao')),
        imagem: img(pick(it, 'imagem')),
        beneficios: strList(pick(it, 'beneficios')),
        cta: ctaTexto || ctaLink ? { texto: ctaTexto, link: ctaLink } : undefined,
      };
    }).filter((s) => s.titulo);
    out.servicos = { etiqueta: str(t.get('etiqueta')), titulo: str(t.get('titulo')), subtitulo: str(t.get('subtitulo')), itens };
  }

  /* depoimentos */
  const dep = section('depoimentos');
  if (dep) {
    const t = dep.ds('textos'); const la = dep.ds('link-avaliacoes');
    const laTexto = str(la.get('texto')); const laLink = str(la.get('link'));
    const itens: Depoimento[] = items(dep.ds('itens').get('itens')).map((it) => ({
      nome: str(pick(it, 'nome')),
      cidade: str(pick(it, 'cidade')),
      foto: img(pick(it, 'foto')),
      avaliacao: num(pick(it, 'avaliacao')),
      viagem: str(pick(it, 'viagem')),
      data: str(pick(it, 'data')),
      texto: str(pick(it, 'texto')),
    })).filter((d) => d.texto || d.nome);
    out.depoimentos = {
      etiqueta: str(t.get('etiqueta')),
      titulo: str(t.get('titulo')),
      subtitulo: str(t.get('subtitulo')),
      fonte: str(t.get('fonte')),
      media_avaliacao: num(t.get('media-avaliacao')),
      total_avaliacoes: num(t.get('total-avaliacoes')),
      itens,
      link_avaliacoes: laTexto || laLink ? { texto: laTexto, descricao: str(la.get('descricao')), link: laLink } : undefined,
    };
  }

  /* galeria */
  const gal = section('galeria');
  if (gal) {
    const t = gal.ds('textos');
    const cats = strList(gal.ds('categorias').get('categorias')).filter((c) => norm(c) !== 'todos');
    const fotos: Foto[] = items(gal.ds('fotos').get('fotos')).map((it) => {
      const im = pick(it, 'imagem');
      const url = img(im) ?? img(pick(it, 'url'));
      return {
        url,
        miniatura: thumb(im) ?? img(pick(it, 'miniatura')) ?? url,
        titulo: str(pick(it, 'titulo')),
        local: str(pick(it, 'local')),
        categoria: str(pick(it, 'categoria')),
        alt: str(pick(it, 'alt')),
      };
    }).filter((f) => f.url);
    out.galeria = {
      etiqueta: str(t.get('etiqueta')),
      titulo: str(t.get('titulo')),
      subtitulo: str(t.get('subtitulo')),
      categorias: ['Todos', ...cats],
      fotos,
    };
  }

  /* faq */
  const faq = section('faq');
  if (faq) {
    const t = faq.ds('textos');
    const itens: FaqItem[] = items(faq.ds('itens').get('itens'))
      .map((it) => ({ pergunta: str(pick(it, 'pergunta')), resposta: str(pick(it, 'resposta')) }))
      .filter((q) => q.pergunta);
    out.faq = { etiqueta: str(t.get('etiqueta')), titulo: str(t.get('titulo')), subtitulo: str(t.get('subtitulo')), itens };
  }

  /* cta final */
  const cta = section('cta-final');
  if (cta) {
    const t = cta.ds('textos');
    out.cta_final = {
      titulo: str(t.get('titulo')),
      subtitulo: str(t.get('subtitulo')),
      imagem_fundo: img(cta.ds('imagem').get('imagem-fundo')),
      botao: link(cta.ds('botao')),
    };
  }

  /* contato */
  const con = section('contato');
  if (con) {
    const t = con.ds('textos'); const tel = con.ds('telefone'); const wa = con.ds('whatsapp');
    const em = con.ds('email'); const fm = con.ds('formulario');
    const campos: CampoForm[] = items(fm.get('campos')).map((it) => {
      const opcoes = strList(pick(it, 'opcoes'));
      return {
        nome: str(pick(it, 'nome')),
        rotulo: str(pick(it, 'rotulo')),
        tipo: str(pick(it, 'tipo')),
        obrigatorio: bool(pick(it, 'obrigatorio')) ?? false,
        placeholder: str(pick(it, 'placeholder')),
        opcoes: opcoes.length ? opcoes : undefined,
      };
    }).filter((c) => c.nome || c.rotulo);
    const endpoint = str(fm.get('envio-email-endpoint'));
    const telExib = str(tel.get('exibicao')); const telLink = str(tel.get('link'));
    const waNumero = str(wa.get('numero')); const waLink = str(wa.get('link'));
    const emExib = str(em.get('exibicao')); const emLink = str(em.get('link'));
    const formTitulo = str(fm.get('titulo'));
    out.contato = {
      etiqueta: str(t.get('etiqueta')),
      titulo: str(t.get('titulo')),
      subtitulo: str(t.get('subtitulo')),
      telefone: telExib || telLink ? { exibicao: telExib, link: telLink } : undefined,
      whatsapp: waNumero || waLink ? {
        exibicao: str(wa.get('exibicao')), numero: waNumero, mensagem_padrao: str(wa.get('mensagem-padrao')), link: waLink,
      } : undefined,
      email: emExib || emLink ? { exibicao: emExib, link: emLink } : undefined,
      horario_atendimento: items(con.ds('horario-atendimento').get('horarios'))
        .map((it) => ({ dias: str(pick(it, 'dias')), horario: str(pick(it, 'horario')) }))
        .filter((h) => h.dias || h.horario),
      formulario: formTitulo || campos.length ? {
        titulo: formTitulo,
        campos,
        botao: str(fm.get('botao')),
        envio_email: endpoint ? { endpoint, assunto: str(fm.get('envio-email-assunto')) } : undefined,
        mensagem_sucesso: str(fm.get('mensagem-sucesso')),
        mensagem_erro: str(fm.get('mensagem-erro')),
        continuar_whatsapp: str(fm.get('continuar-whatsapp')),
        aviso_privacidade: str(fm.get('aviso-privacidade')),
        link_privacidade: str(fm.get('link-privacidade')),
      } : undefined,
    };
  }

  /* endereço */
  const end = section('endereco');
  if (end) {
    const d = end.ds('dados');
    out.endereco = {
      logradouro: str(d.get('logradouro')),
      numero: str(d.get('numero')),
      complemento: str(d.get('complemento')),
      bairro: str(d.get('bairro')),
      cidade: str(d.get('cidade')),
      uf: str(d.get('uf')),
      cep: str(d.get('cep')),
      pais: str(d.get('pais')),
      referencia: str(d.get('referencia')),
    };
  }

  /* redes sociais */
  const redes = section('redes-sociais');
  if (redes) {
    const perfis: RedeSocial[] = items(redes.ds('perfis').get('perfis')).map((it) => ({
      nome: str(pick(it, 'nome')),
      usuario: str(pick(it, 'usuario')),
      url: str(pick(it, 'url')),
      icone: str(pick(it, 'icone')),
      seguidores: null,
    })).filter((r) => r.url);
    out.redes_sociais = perfis;
  }

  /* rodapé */
  const rod = section('rodape');
  if (rod) {
    const t = rod.ds('textos'); const dev = rod.ds('desenvolvido-por');
    const links = (d: Dataset) => items(d.get('links'))
      .map((it) => ({ rotulo: str(pick(it, 'rotulo')), link: str(pick(it, 'link')) }))
      .filter((l) => l.rotulo && l.link);
    const devNome = str(dev.get('nome')); const devLink = str(dev.get('link'));
    out.rodape = {
      sobre: str(t.get('sobre')),
      links_rapidos: links(rod.ds('links-rapidos')),
      links_legais: links(rod.ds('links-legais')),
      formas_pagamento: strList(rod.ds('formas-pagamento').get('formas-pagamento')),
      selos: items(rod.ds('selos').get('selos'))
        .map((it) => ({ nome: str(pick(it, 'nome')), descricao: str(pick(it, 'descricao')) }))
        .filter((s) => s.nome),
      copyright: str(t.get('copyright')),
      desenvolvido_por: devNome || devLink ? { nome: devNome, link: devLink } : undefined,
    };
  }

  return compact(out);
}

/** Busca a landing page na API pública da ZapTurize e converte para AgencyData. */
export async function fetchZapturize(url: string, apiKey: string, signal?: AbortSignal): Promise<AgencyData> {
  const res = await fetch(url, { headers: { 'x-api-key': apiKey }, cache: 'no-store', signal });
  if (!res.ok) throw new Error(`HTTP ${res.status} ao buscar ${url}`);
  const json: unknown = await res.json();
  if (!isRec(json)) throw new Error('Resposta inválida da API ZapTurize');
  const data = toAgencyData(json as ZapLandingPage);
  if (!Object.keys(data).length) throw new Error('A landing page da ZapTurize não tem seções habilitadas');
  return data;
}
