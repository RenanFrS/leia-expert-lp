# Leia Expert

Landing page de tricologia clinica com painel de conteudo proprio.

## Stack

| Camada | Tecnologia |
| --- | --- |
| Framework | Next.js 15 (App Router) + React 19 |
| Linguagem | TypeScript |
| CMS | Payload CMS 3, painel em `/admin` |
| Banco | PostgreSQL |
| Midia | Cloudinary (imagens e videos) |
| Estilo | Tailwind CSS + shadcn/ui |
| Rolagem | Lenis |
| Medicao | GTM, GA4, Meta Pixel e Google Ads, com Consent Mode v2 |

## Como rodar

```bash
pnpm install
cp .env.example .env   # preencha as variaveis
pnpm dev
```

O site sobe em `http://localhost:3000` e o painel em `http://localhost:3000/admin`.
No primeiro acesso ao painel voce cria o usuario administrador.

Para popular o conteudo inicial, com o servidor no ar, acesse
`http://localhost:3000/api/dev/seed`. Pode repetir quantas vezes quiser, o que ja existe e atualizado
em vez de duplicado.

O seed preenche tratamentos, perguntas frequentes, depoimentos e os dados da clinica, mas nao cria
imagem nenhuma. Metricas, endereco das unidades, depoimentos e a credencial da profissional entram como
conteudo de exemplo e precisam ser revisados no painel antes de publicar.

As fotos entram pelo painel, em **Configuracoes > Dados da clinica**: as midias do topo ficam na aba
Hero, a foto larga e o retrato na aba Sobre, e a foto que acompanha o formulario na aba Contato.

Os tres blocos do topo aceitam foto e video. Com mais de um arquivo no mesmo bloco, eles se alternam em
esmaecimento, e o tempo de cada um fica no mesmo lugar.

## Variaveis de ambiente

Todas estao documentadas em `.env.example`. As obrigatorias para subir:

- `DATABASE_URI`: string de conexao do Postgres
- `PAYLOAD_SECRET`: gere com `openssl rand -hex 32`
- `NEXT_PUBLIC_SITE_URL`: URL publica, sem barra no final
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

## Rastreamento e ads

O GTM e o container principal. Os IDs ficam no painel, em **Configuracoes > Rastreamento e ads**,
para que a agencia troque container, pixel ou conversao sem depender de deploy. As variaveis de
ambiente valem como valor padrao quando o campo do painel esta vazio.

Todos os eventos passam pelo `dataLayer`, entao a agencia cria gatilhos no GTM sem tocar no codigo:

| Evento | Quando dispara |
| --- | --- |
| `clique_whatsapp` | Clique em qualquer botao de WhatsApp, com o local de origem |
| `clique_agendar` | Clique no CTA que leva ao formulario, com o local de origem |
| `inicio_formulario` | Primeiro foco em um campo do formulario |
| `envio_formulario` | Lead gravado com sucesso |
| `erro_formulario` | Falha no envio, com a mensagem |
| `abrir_faq` | Abertura de uma pergunta frequente |

O envio bem sucedido tambem dispara `generate_lead` no GA4, `Lead` no Meta Pixel e a conversao do
Google Ads quando o ID e o rotulo estao preenchidos no painel.

Os parametros UTM da URL sao gravados junto com o lead, em **Atendimento > Leads**, o que permite
comparar o que o painel de anuncios reporta com o que a clinica realmente recebeu.

## Leads

Cada envio do formulario vira um registro em **Atendimento > Leads**, com nome, contato, motivo,
mensagem, a origem de campanha e um status de atendimento que vai de Novo a Agendado. A lista abre com o
mais recente no topo. So usuario com papel de administrador enxerga essa colecao, entao da para criar um
usuario editor para quem cuida so do conteudo do site.

A cada lead novo sai um email de aviso, com os dados do cadastro e um botao que abre a conversa no
WhatsApp. O endereco que recebe fica em **Configuracoes > Dados da clinica**, no campo de aviso de lead.
O envio usa SMTP, configurado pelas variaveis `SMTP_*` do `.env.example`. Enquanto o SMTP nao estiver
preenchido o site funciona normalmente e os leads continuam sendo gravados, apenas sem o aviso.

### Consent Mode v2

O site inicia com `ad_storage`, `ad_user_data`, `ad_personalization` e `analytics_storage` negados e
so libera apos o aceite no banner, atendendo a LGPD sem perder a modelagem de conversao do Google.
O banner pode ser desligado no painel.

## Performance

- Renderizacao estatica com revalidacao a cada 5 minutos, entao o HTML chega pronto
- Fontes servidas pelo `next/font`, sem requisicao externa e sem deslocamento de layout
- Imagens em AVIF e WebP pelo `next/image`, com `sizes` definido em cada uso
- Cloudinary entrega `f_auto` e `q_auto`, ajustando formato e compressao por navegador
- Scripts de medicao carregam depois da interacao, fora do caminho critico
- `optimizePackageImports` reduz o bundle dos icones
- As animacoes custam cerca de 47 kB comprimidos no cliente, entre gsap com ScrollTrigger e a parte do
  ogl que o brilho dos botoes usa. O brilho e aplicado so nos quatro CTAs principais, para nao
  multiplicar contexto de video na pagina

## SEO on page

- Metadados vindos do painel, com titulo e descricao editaveis e limite de caracteres
- Dados estruturados `MedicalClinic` e `FAQPage`, que habilitam o resultado rico de perguntas
- `sitemap.xml` e `robots.txt` gerados pelo framework, com `/admin` e `/api` bloqueados
- Hierarquia de headings correta, com um unico `h1` por pagina
- Texto alternativo obrigatorio em toda midia enviada pelo painel

## UX e CRO

- CTA de agendamento fixo no topo e botao de WhatsApp sempre visivel
- Formulario curto, com os campos que a clinica realmente usa para atender
- Na secao de agendamento, o cartao de contato sobre a foto traz e mail, WhatsApp e endereco, e um
  botao que abre a conversa direto, para quem nao quer preencher formulario
- O envio so libera depois da autorizacao de contato marcada
- Comparador de antes e depois, que e a prova mais forte nesse segmento
- Prova social proxima aos pontos de decisao
- Estado de carregamento, erro e sucesso tratados de forma explicita no formulario

## Acessibilidade

- Contraste conferido nas combinacoes de cor do tema
- Foco visivel em todos os elementos interativos
- Link de pular navegacao para quem usa teclado
- `prefers-reduced-motion` respeitado, inclusive desligando o Lenis
- Rotulos associados a cada campo e mensagens de erro anunciadas por leitor de tela

## Deploy

O projeto roda em qualquer plataforma que suporte Next.js com Node. Para a Vercel:

1. Suba o repositorio e importe o projeto
2. Cadastre as variaveis de ambiente do `.env.example`
3. Aponte o banco para um Postgres gerenciado (Neon, Supabase ou Railway)
4. Depois do primeiro deploy, acesse `/admin` e crie o usuario administrador

## Estrutura

```
src/
  app/
    (frontend)/     paginas publicas
    (payload)/      painel e API do Payload
    api/leads/      rota publica do formulario
  collections/      colecoes do CMS
  globals/          configuracoes unicas (clinica, SEO, rastreamento)
  components/
    sections/       secoes da landing
    ui/             componentes shadcn
  lib/              utilitarios, analytics, seed e adaptador do Cloudinary
```
