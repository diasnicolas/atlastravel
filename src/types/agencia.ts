/* Esquema do JSON da agência — todos os campos são opcionais (dados de terceiros). */

export interface Link {
  texto?: string;
  link?: string;
  icone?: string;
}

export interface Logotipo {
  principal?: string;
  branco?: string;
  icone?: string;
  favicon?: string;
  alt?: string;
}

export interface IdentidadeVisual {
  cor_primaria?: string;
  cor_secundaria?: string;
  cor_destaque?: string;
  cor_escura?: string;
  cor_clara?: string;
  fonte_titulos?: string;
  fonte_textos?: string;
}

export interface Agencia {
  nome?: string;
  nome_curto?: string;
  slogan?: string;
  descricao_curta?: string;
  ano_fundacao?: number | string;
  cnpj?: string;
  cadastur?: string;
  logotipo?: Logotipo;
  identidade_visual?: IdentidadeVisual;
}

export interface Seo {
  titulo?: string;
  descricao?: string;
  palavras_chave?: string[];
  imagem_compartilhamento?: string;
}

export interface MenuItem {
  rotulo?: string;
  ancora?: string;
}

export interface HeroSlide {
  titulo?: string;
  subtitulo?: string;
  imagem?: string;
}

export type CampoBuscaTipo = 'text' | 'date' | 'select' | (string & {});

export interface CampoBusca {
  nome?: string;
  rotulo?: string;
  placeholder?: string;
  tipo?: CampoBuscaTipo;
  opcoes?: string[];
}

export interface Busca {
  ativo?: boolean;
  campos?: CampoBusca[];
  botao?: string;
}

export interface Estatistica {
  valor?: string | number;
  rotulo?: string;
}

export interface Hero {
  etiqueta?: string;
  titulo?: string;
  titulo_destaque?: string;
  subtitulo?: string;
  imagem_fundo?: string;
  video_fundo?: string | null;
  overlay_opacidade?: number;
  cta_primario?: Link;
  cta_secundario?: Link;
  slides?: HeroSlide[];
  busca?: Busca;
  estatisticas?: Estatistica[];
}

export interface Numero {
  valor?: number | string;
  sufixo?: string;
  rotulo?: string;
}

export interface MembroEquipe {
  nome?: string;
  cargo?: string;
  especialidade?: string;
  foto?: string;
  /** Texto de apresentação (usado no layout individual, quando há só uma pessoa). */
  bio?: string;
  nome_completo?: string;
  instagram?: { usuario?: string; url?: string };
}

export interface Sobre {
  etiqueta?: string;
  titulo?: string;
  subtitulo?: string;
  paragrafos?: string[];
  imagem_principal?: string;
  imagem_secundaria?: string;
  selo_experiencia?: { valor?: string | number; rotulo?: string };
  missao?: string;
  visao?: string;
  valores?: string[];
  numeros?: Numero[];
  equipe?: MembroEquipe[];
  equipe_etiqueta?: string;
  equipe_titulo?: string;
  equipe_subtitulo?: string;
  cta?: Link;
}

export interface ItemIcone {
  icone?: string;
  titulo?: string;
  descricao?: string;
}

export interface Diferenciais {
  etiqueta?: string;
  titulo?: string;
  subtitulo?: string;
  imagem?: string;
  itens?: ItemIcone[];
}

export interface Servico {
  id?: string;
  icone?: string;
  titulo?: string;
  descricao?: string;
  imagem?: string;
  beneficios?: string[];
  cta?: Link;
}

export interface Servicos {
  etiqueta?: string;
  titulo?: string;
  subtitulo?: string;
  itens?: Servico[];
  servicos_complementares?: ItemIcone[];
}

export interface Pacote {
  destino?: string;
  titulo?: string;
  imagem?: string;
  duracao?: string;
  inclusos?: string[];
  preco_de?: string;
  preco_por?: string;
  parcelamento?: string;
  etiqueta?: string;
  avaliacao?: number;
}

export interface DestinosDestaque {
  etiqueta?: string;
  titulo?: string;
  subtitulo?: string;
  itens?: Pacote[];
}

export interface Depoimento {
  nome?: string;
  cidade?: string;
  foto?: string;
  avaliacao?: number;
  viagem?: string;
  data?: string;
  texto?: string;
}

export interface Depoimentos {
  etiqueta?: string;
  titulo?: string;
  subtitulo?: string;
  media_avaliacao?: number;
  total_avaliacoes?: number;
  fonte?: string;
  itens?: Depoimento[];
  /** Chamada para as avaliações externas (ex.: Google). Exibida mesmo sem depoimentos cadastrados. */
  link_avaliacoes?: { texto?: string; descricao?: string; link?: string };
}

export interface Foto {
  url?: string;
  miniatura?: string;
  titulo?: string;
  local?: string;
  categoria?: string;
  alt?: string;
}

export interface Galeria {
  etiqueta?: string;
  titulo?: string;
  subtitulo?: string;
  categorias?: string[];
  fotos?: Foto[];
}

export interface FaqItem {
  pergunta?: string;
  resposta?: string;
}

export interface Faq {
  etiqueta?: string;
  titulo?: string;
  subtitulo?: string;
  itens?: FaqItem[];
}

export interface CtaFinal {
  titulo?: string;
  subtitulo?: string;
  imagem_fundo?: string;
  botao?: Link;
}

export interface Newsletter {
  titulo?: string;
  subtitulo?: string;
  placeholder?: string;
  botao?: string;
}

export type CampoFormTipo = 'text' | 'email' | 'tel' | 'select' | 'textarea' | 'date' | 'number' | (string & {});

export interface CampoForm {
  nome?: string;
  rotulo?: string;
  tipo?: CampoFormTipo;
  obrigatorio?: boolean;
  placeholder?: string;
  opcoes?: string[];
}

export interface Formulario {
  titulo?: string;
  campos?: CampoForm[];
  botao?: string;
  mensagem_sucesso?: string;
  mensagem_erro?: string;
  aviso_privacidade?: string;
  /** Link exibido junto ao aviso de privacidade. */
  link_privacidade?: string;
  /** Envio por e-mail (endpoint AJAX que aceita JSON, ex.: FormSubmit). Sem ele, o formulário abre o WhatsApp. */
  envio_email?: { endpoint?: string; assunto?: string };
  /** Texto do botão para continuar o atendimento no WhatsApp após o envio. */
  continuar_whatsapp?: string;
}

export interface Contato {
  etiqueta?: string;
  titulo?: string;
  subtitulo?: string;
  telefone?: { exibicao?: string; link?: string };
  whatsapp?: { exibicao?: string; numero?: string; mensagem_padrao?: string; link?: string };
  email?: { exibicao?: string; link?: string };
  emails_departamentos?: { setor?: string; email?: string }[];
  horario_atendimento?: { dias?: string; horario?: string }[];
  formulario?: Formulario;
  mapa?: { latitude?: number; longitude?: number; embed_url?: string; link?: string };
}

export interface RedeSocial {
  nome?: string;
  usuario?: string;
  url?: string;
  icone?: string;
  seguidores?: string | null;
}

export interface Endereco {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  uf?: string;
  cep?: string;
  pais?: string;
  referencia?: string;
  completo?: string;
}

export interface LinkRotulo {
  rotulo?: string;
  link?: string;
}

export interface Rodape {
  sobre?: string;
  links_rapidos?: LinkRotulo[];
  links_legais?: LinkRotulo[];
  formas_pagamento?: string[];
  selos?: { nome?: string; descricao?: string }[];
  copyright?: string;
  aviso_demo?: string;
}

export interface AgencyData {
  agencia?: Agencia;
  seo?: Seo;
  menu?: MenuItem[];
  hero?: Hero;
  sobre?: Sobre;
  diferenciais?: Diferenciais;
  servicos?: Servicos;
  destinos_destaque?: DestinosDestaque;
  depoimentos?: Depoimentos;
  galeria?: Galeria;
  faq?: Faq;
  cta_final?: CtaFinal;
  newsletter?: Newsletter;
  contato?: Contato;
  redes_sociais?: RedeSocial[];
  endereco?: Endereco;
  rodape?: Rodape;
}
