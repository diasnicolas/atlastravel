# Atlas Travel Brasil — site institucional

Cópia do template **01 – Clássico Oceano** (`demo_sites/01-classico-oceano`) preenchida com a
marca e o conteúdo da Atlas Travel Brasil.

## Rodar

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # gera dist/
npm run preview  # serve o dist/
```

## De onde vem o conteúdo

O site carrega o conteúdo do **painel da agência na ZapTurize** (módulo Landing Pages), pela API
pública configurada em `.env`:

```
VITE_ZAPTURIZE_API_URL=https://api.zapturize.com.br/api/public/landing-pages/index
VITE_ZAPTURIZE_API_KEY=<chave pública de leitura da landing page>
```

Fluxo (`src/data/useAgencyData.ts`):

1. Busca a landing page na API (header `x-api-key`) e converte `sections → datasets → fields`
   para o formato do site com `src/data/zapturize.ts` (`toAgencyData`).
2. Se a API falhar (rede, chave inválida, página despublicada), usa `public/agencia-viagens.json`
   como reserva e registra um aviso no console. `<html data-source="zapturize|local">` indica a origem.
3. `?data=<url>` na query string força um JSON alternativo (testes), ignorando a API.

A chave é de leitura pública e vai para o navegador; a API só devolve páginas com status
**Publicado**. Sem as duas variáveis, o site usa apenas o JSON local.

O conteúdo foi importado no painel a partir de `../../importacao-zapturize/atlas-travel-zapturize-import.json`
(gerado de `public/agencia-viagens.json`, com as imagens no Cloudflare Images). As chaves dos campos
no painel são as mesmas do JSON em kebab-case; o adaptador aceita kebab e snake_case.

Não é preciso mexer no código para alterar textos, cores, fontes, imagens ou contatos. As exceções
são os metadados de compartilhamento em `index.html` (ver abaixo) e as páginas legais.

## Formulário de contato → CRM da ZapTurize → WhatsApp

Com `VITE_ZAPTURIZE_FORM_KEY` definido (`.env`), o envio do formulário (`src/components/Contact.tsx`):

1. faz `POST {VITE_ZAPTURIZE_API_URL}/forms/{FORM_KEY}/submit` com `x-api-key` e os campos
   preenchidos (chave = `nome` do campo no JSON do site), via `src/lib/leads.ts`. O servidor cria o
   lead no funil do CRM (ou anexa a um lead aberto com o mesmo e-mail/telefone);
2. abre o WhatsApp da agência com a mensagem pronta (todos os campos preenchidos). A aba é aberta no
   clique e recebe o destino quando a API responde, para o navegador não bloquear o pop-up;
3. mostra a mensagem de sucesso com o botão "Continuar pelo WhatsApp" (caso a aba tenha sido bloqueada).

Se a API falhar, o visitante ainda é levado ao WhatsApp e o erro fica no console do navegador.
O formulário existe no painel (menu **Formulários**) com a chave `site-contato`. As chaves dos campos
lá (`campo-nome`, `campo-email`, `campo-whatsapp`, `campo-destino`, `campo-necessidade`, `campo-mensagem`)
são traduzidas a partir dos nomes do site em `FIELD_MAP` (`src/lib/leads.ts`); `periodo` não tem campo
no painel e entra no texto da mensagem. Definição em `../../importacao-zapturize/formulario-crm.json`. Sem `VITE_ZAPTURIZE_FORM_KEY`, vale o comportamento
anterior (FormSubmit por e-mail se `formulario.envio_email.endpoint` existir; senão, só WhatsApp).

A API externa do CRM (`/api/external/crm`, token Bearer) **não** é usada pelo site: o navegador não
pode chamá-la (CORS) e o token dá leitura dos leads, então não pode ficar no JavaScript público.

## Estrutura de arquivos públicos

| Caminho | Conteúdo |
| --- | --- |
| `public/agencia-viagens.json` | Conteúdo do site (reserva; a fonte principal é a API da ZapTurize) |
| `public/brand/` | Logotipos e favicon gerados do SVG oficial (`materiais/Logo`) |
| `public/img/` | Todas as fotos, **servidas localmente** e otimizadas em WebP. Origem de cada uma em `public/img/CREDITOS.md` |
| `public/img/og-atlas-travel.jpg` | Imagem de compartilhamento (1200×630) |
| `public/politica-de-privacidade.html`, `public/termos-de-uso.html`, `public/legal.css` | Páginas legais (minutas, para revisão do cliente) |

## O que foi alterado em relação ao template

| Arquivo | Mudança |
| --- | --- |
| `public/agencia-viagens.json` | Dados reais da Atlas Travel Brasil |
| `index.html` | Título, descrição, Open Graph **estático** (WhatsApp e redes não executam JS), dados estruturados `TravelAgency`, favicon e Poppins |
| `src/components/Team.tsx` | Com uma só pessoa, a equipe vira uma apresentação individual (foto, bio, Instagram). Título e etiqueta vêm do JSON (`sobre.equipe_titulo`, `sobre.equipe_etiqueta`) |
| `src/components/Testimonials.tsx` | Chamada "Veja as avaliações no Google" (`depoimentos.link_avaliacoes`), exibida mesmo sem depoimentos cadastrados |
| `src/components/Contact.tsx` | Formulário envia para o e-mail via `formulario.envio_email.endpoint` (FormSubmit) e oferece "Continuar pelo WhatsApp". Sem endpoint, mantém o comportamento original (abre o WhatsApp). Link para a Política de Privacidade (`formulario.link_privacidade`) |
| `src/components/Services.tsx` | Grade de 4 colunas quando há 4 ou 8 serviços |
| `src/components/Footer.tsx` | Mostra a observação do endereço (`endereco.referencia`) |
| `src/types/agencia.ts` | Tipos dos novos campos |

## Identidade aplicada (Manual de Marca, pág. 20 e 21)

| Token do JSON | Cor da marca | Hex |
| --- | --- | --- |
| `cor_primaria` | Verde Atlas Profundo | `#0E432C` |
| `cor_secundaria` | Verde Jornada | `#328764` |
| `cor_destaque` | Verde Energia | `#C1F107` |
| `cor_escura` | Grafite Urbano | `#292929` |
| `cor_clara` | Branco Neblina | `#EDEDED` |

Tipografia: **Poppins**. A fonte display "Altere" da logo não existe como webfont — o lockup entra
como SVG, preservando o desenho original (aprovado pelo cliente).

## Seções ativas

Hero (5 destinos), sobre (selo "103 viajantes nos 6 primeiros meses"), apresentação do
Guilherme, diferenciais, serviços (8), avaliações no Google, galeria de destinos, FAQ, CTA final,
contato (horário, endereço cadastral sem mapa) e rodapé (Cadastur, formas de pagamento, links legais).

Omitidas: números/estatísticas (só há um indicador), mapa (atendimento só digital), newsletter.

## Antes de publicar

- **Formulário (FormSubmit):** o primeiro envio real dispara um e-mail de ativação para
  `contato@atlastravelbr.com`. Alguém precisa clicar em "Activate" para os envios seguintes chegarem.
- **Domínio:** `index.html` usa `https://atlastravelbr.com/` nas URLs absolutas (canonical, `og:image`).
  Se o site ficar em outro endereço, ajuste essas URLs.
- **Atlas Club:** o link do grupo em `agencia-viagens.json` (`redes_sociais` e `rodape.links_rapidos`)
  é o antigo; troque pelo link atualizado quando o cliente enviar.
