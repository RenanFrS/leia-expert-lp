# Leia Expert

Landing page unica de tricologia clinica, com painel de conteudo proprio rodando dentro da mesma
aplicacao. O site publico fica em `/` e o painel em `/admin`. Dominio de producao:
`https://leiaexpert.com.br`.

## Como trabalhar aqui

- Portugues em texto de interface, em conteudo e em comentario de codigo.
- Texto visivel leva acento: secao, rotulo do painel, mensagem de erro e o seed. Codigo, nome de
  variavel, slug e comentario continuam sem acento. Mantenha a grafia "E mail", que evita o hifen.
- Nao use travessao nem hifen no meio de texto, nem como marcador. Vale para interface, README,
  comentario e mensagem de commit.
- TypeScript sempre, sem `any` solto. Se precisar de escape de tipo, deixe um comentario explicando o
  porque.
- Antes de adicionar dependencia, confira se ja da para resolver com o que existe no projeto.
- Rode `pnpm exec tsc --noEmit` antes de considerar qualquer tarefa concluida.

## Comandos

O gerenciador de pacotes e o pnpm.

```bash
pnpm dev                # site e painel em :3000, ou na proxima porta livre
pnpm build              # build do Next
pnpm exec tsc --noEmit  # checagem de tipos, obrigatoria antes de fechar tarefa
```

Suba um `pnpm dev` por vez. Dois processos escrevem no mesmo `.next` e um apaga o chunk que o outro
acabou de gravar, o que derruba o painel com `MODULE_NOT_FOUND` e 404 em todo `/_next/static`.

Nao rode `pnpm build` com o `pnpm dev` no ar. Os dois escrevem no mesmo `.next`, o build limpa o que o
dev estava servindo e a pagina passa a carregar sem estilo e sem JS, com 404 em todo `/_next/static`. Se
acontecer, pare o dev, apague o `.next` e suba de novo.

O CLI do Payload nao funciona neste projeto, entao `pnpm generate:importmap`, `pnpm migrate` e os outros
comandos `payload ...` falham. O motivo esta na secao abaixo. Na pratica isso quase nao pesa, porque o
`pnpm dev` regera o import map sozinho a cada mudanca de config, e os tipos saem por uma rota.

## Restricao de versao

O Next esta fixado em `15.4.11`. O Payload 3 nao aceita a linha 15.5.x. Antes de subir a versao do Next,
confira o peer range do `@payloadcms/next` no `package.json` da dependencia instalada.

## Estrutura

```
src/
  app/
    (frontend)/        layout, globals.css e a home publica
    (payload)/         painel em /admin e API REST e GraphQL do Payload
    api/leads/         rota publica que recebe o formulario
    api/dev/           rota de manutencao, so em desenvolvimento
    sitemap.ts robots.ts
  collections/         Tratamentos, Resultados, Depoimentos, Faq, Leads, Media, Users
  globals/             Clinica, Seo, Rastreamento, todos no grupo Configuracoes do painel
  components/
    sections/          Header, Hero, Metricas, Sobre, Tratamentos, Tricoscopia,
                       Resultados, Depoimentos, Duvidas, Agendamento, Footer,
                       WhatsappFlutuante
    ui/                componentes shadcn mais os primitivos da landing:
                       eyebrow, titulo-secao, lista-verificada, cartao-vidro,
                       animated-content, camada-especular, midia-rotativa
    BotaoWhatsapp.tsx  unico caminho para abrir o WhatsApp
    BotaoAgendar.tsx   CTA que rola ate o formulario, com o evento junto
    Logotipo.tsx       assinatura da marca, com reserva em texto
    Analytics.tsx      GTM, GA4, Pixel, Ads e banner de consentimento
    SmoothScroll.tsx   Lenis
    Revelar.tsx        reveal on scroll com IntersectionObserver
  lib/
    analytics.ts       camada unica de eventos e leitura de UTM
    acesso.ts          regra de papel usada no access control
    aviso-lead.ts      email de lead novo
    motivos.ts         lista canonica dos motivos de contato
    seed.ts            conteudo inicial em portugues, textos originais
    cloudinary-adapter.ts
    utils.ts           cn, whatsappLink, formatarWhatsapp e o narrow de midia
  payload-types.ts     gerado, versionado
```

## Regra de medicao, inegociavel

O cliente tem uma agencia de marketing propria que roda as campanhas. O site precisa ser mensuravel e
otimizavel por essa agencia sozinha, sem deploy e sem depender do desenvolvedor. Qualquer alteracao em
medicao ou rastreamento tem que manter isso verdadeiro:

- Os IDs de GTM, GA4, Meta Pixel, Google Ads e o rotulo de conversao ficam editaveis no painel, em
  `Configuracoes > Rastreamento e ads`. Nunca hardcoded. As variaveis de ambiente valem apenas como
  valor padrao quando o campo do painel esta vazio.
- Todo evento passa pelo `dataLayer`, para que a agencia crie tag e gatilho no GTM sem tocar no codigo.
- Os parametros UTM sao gravados junto de cada lead, o que permite cruzar o que o painel de anuncios
  reporta com o que a clinica realmente recebeu.
- Velocidade, SEO on page, UX e acessibilidade sao entrega nossa e ficam documentadas no README, para que
  nenhuma queda de resultado possa ser atribuida ao site.

## Regras por area

### Rastreamento

`src/lib/analytics.ts` e a unica porta de entrada de evento. Nao chame `gtag` nem `fbq` direto em
componente. Eventos tipados em `EventoNome`:

`clique_whatsapp`, `clique_agendar`, `inicio_formulario`, `envio_formulario`, `erro_formulario`,
`ver_tratamento`, `abrir_faq`.

O `clique_agendar` cobre o CTA que rola para o formulario. Em secao que e server component, use o
`components/BotaoAgendar.tsx`, que existe para o evento sair de la sem mandar a secao inteira para o
cliente. Antes esse clique saia como `clique_whatsapp`,
o que inflava o numero de conversas abertas sem nenhuma conversa ter sido aberta. Nao volte a juntar os
dois: a agencia otimiza campanha em cima desse dado.

Abrir o WhatsApp e sempre pelo `components/BotaoWhatsapp.tsx`, que monta o link e dispara o evento com o
local de origem. Nao monte `wa.me` na mao em componente.

O envio bem sucedido passa por `registrarLead`, que empurra `envio_formulario` no dataLayer e ainda
dispara `generate_lead` no GA4, `Lead` no Meta e a conversao do Google Ads quando o ID e o rotulo estao
preenchidos no painel.

### Consentimento

Consent Mode v2 inicia com `ad_storage`, `ad_user_data`, `ad_personalization` e `analytics_storage`
negados, liberando so apos o aceite no banner. A decisao fica em `localStorage`, na chave
`leia-consentimento`. O banner pode ser desligado no painel pelo campo `consentimento`.

### Leads

`POST /api/leads` valida com Zod, aplica limite de 5 envios por IP a cada 10 minutos e grava na colecao.
Essa rota e a unica porta de entrada de lead. Ela usa a Local API com `overrideAccess: true`, entao a
colecao pode manter `create: () => false`, o que fecha REST e GraphQL contra quem tente gravar pulando a
validacao e o limite. Se um dia mudar a forma de gravar, mantenha as duas pontas coerentes.

Leitura, edicao e exclusao exigem papel de administrador, pelo helper `ehAdmin` em `src/lib/acesso.ts`.
A colecao Users tambem e gateada, e o campo `papel` so aceita alteracao vinda de administrador, senao um
editor se promoveria e a trava dos leads nao valeria nada. O primeiro usuario nasce administrador de
proposito, porque e criado sem ninguem logado.

Cada lead novo dispara um aviso por email, pelo `afterChange` da colecao, que chama `avisarLeadNovo` em
`src/lib/aviso-lead.ts`. O destinatario sai do painel, no campo `emailAvisoLead` da global Clinica, com o
email publico da clinica como reserva. O transporte e SMTP, configurado por `SMTP_HOST` e companhia. Sem
`SMTP_HOST` o Payload usa o adaptador que so escreve no log, entao o site sobe e o formulario grava
igual. A funcao engole a propria falha de proposito, porque o lead ja esta gravado quando ela roda e
perder o cadastro por causa de um SMTP fora do ar seria o pior desfecho possivel.

Os motivos de contato vivem em `src/lib/motivos.ts`, usados pela colecao e pelo email. O esquema Zod da
rota e o select do formulario ainda repetem a lista, entao mexer em um pede conferir os tres.

**O envio so libera com a autorizacao marcada.** O checkbox e controlado por estado e o botao fica
`disabled` enquanto ele estiver vazio. Nao volte a resolver isso com o `required` do HTML: o formulario
usa `noValidate`, porque trata o proprio erro, entao a validacao nativa nunca roda e o `required` ali nao
segura nada. Foi assim que a trava ficou meses sem funcionar.

### Midia

Cloudinary por adaptador custom em `src/lib/cloudinary-adapter.ts`, plugado no `cloudStoragePlugin`. A
colecao Media usa `disableLocalStorage: true` porque as variacoes de tamanho vem da propria URL do
Cloudinary, com `f_auto` e `q_auto`, e nao de arquivo local. O campo `alt` e obrigatorio.

Duas armadilhas ja custaram caro nesse arquivo:

- **Nao leia `doc` nos handlers de URL.** O `staticHandler` recebe `doc`, mas ele so vem preenchido
  quando o `read` da colecao devolve uma condicao de busca. A Media libera com `() => true`, entao o
  `checkFileAccess` nunca vai ao banco e o `doc` chega `undefined`. Quem decide o `resource_type` e o
  `tipoDoArquivo`, pela extensao, com imagem como padrao. Um `raw` errado gera `/raw/upload/` e 404 em
  toda imagem do site.
- **O `resource_type` precisa acompanhar a URL.** Imagem sai em `/image/upload/` e video em
  `/video/upload/`. Como a colecao aceita os dois, errar aqui quebra metade da midia em silencio.

A conta esta em Dynamic folders, onde a pasta da biblioteca e um campo separado do `public_id`. Por isso
o upload manda `asset_folder` alem do caminho no `public_id`, senao a clinica veria tudo solto na raiz.

### Hero

A silhueta vem do `hero214` do shadcnblocks. Sao tres recortes em volta de um painel de midia, e cada
recorte e so um bloco de fundo porcelana com um canto arredondado voltado para dentro. Nao ha mascara
nem `clip-path`: o canto invertido e o proprio arredondamento do bloco branco visto pelo lado de fora.

- **canto superior esquerdo**: titulo, chamada e a linha de estrelas
- **canto superior direito**: os dois blocos menores
- **canto inferior esquerdo**: o CTA

No `lg` o painel e `absolute inset-0` e fica atras de tudo, que e o que faz ele parecer entalhado. Abaixo
do `lg` isso nao se sustenta, porque nao sobra largura para conteudo ao lado de midia, entao a pilha e
direta: titulo, painel, blocos menores e CTA, com o painel virando um bloco normal do fluxo.

Se mexer nos recortes, lembre que quem abre a fresta do painel entre o titulo e os blocos menores e o
`lg:justify-self-start` do titulo mais o `lg:self-start` dos blocos. Sem os dois, os recortes tomam a
linha inteira e a fresta some.

Cada um dos tres blocos aceita varios arquivos, foto ou video, e alterna em esmaecimento pelo
`components/ui/midia-rotativa.tsx`. O primeiro arquivo do painel e o LCP da pagina e leva `priority`.
**Nao passe `loading` junto do `priority`**: isso anula o preload que o Next injeta no head, que e
justamente o que adianta o LCP.

O hero fica acima da dobra, entao nada ali pode usar o `AnimatedContent`. Continua tudo no `Revelar`.

### Sobre e formulario

As duas secoes seguem a forma de blocos do shadcnblocks escolhidos pelo cliente, o `about14` e o
`contact34`. Os dois sao Pro e o codigo nao e publico, entao o que existe aqui e reconstrucao com os
primitivos do projeto, nao codigo copiado.

O Sobre fala em primeira pessoa e o conteudo inteiro vem da aba **Sobre** da global Clinica. O campo
`sobre` e so dessa secao. Quem alimenta a descricao do `MedicalClinic` nos dados estruturados e a
`chamada`, que continua institucional.

No Agendamento o cartao branco sobre a foto usa o `CartaoVidro` com `tom="claro"`. O botao dentro dele
abre o WhatsApp pelo `BotaoWhatsapp`, com `local="card-agendamento"`, e por isso sai como
`clique_whatsapp`. O numero que aparece no cartao e texto puro de proposito, sem link, para nao existir
um segundo caminho de WhatsApp fora do componente que grava o evento.

O `Label` nao fixa cor. Ela vem da secao, porque o formulario cai sobre cacau, onde o `text-neutro` que
estava preso no primitivo dava 1.2 de contraste e sumia. Se um dia o formulario voltar para fundo claro,
troque a cor no `<form>`, nao no primitivo.

### Comparador antes e depois

`src/components/sections/Resultados.tsx` e o elemento de assinatura do projeto, porque prova visual e o
argumento mais forte nesse segmento e conversa com a logica da tricoscopia. Tem um `input[type=range]` por
baixo da divisa arrastavel para funcionar por teclado. Nao remova esse fallback.

### Design

Paleta de quatro cores fechada com o cliente, em marrom e bege. Use sempre os tokens de
`tailwind.config.ts`, nunca cor solta.

| Token | Hex | Papel |
| --- | --- | --- |
| `porcelana` | `#FFFFFF` | fundo da pagina, cartoes e campos de formulario |
| `areia` | `#DDCCC2` | blocos que quebram o ritmo, como metricas e depoimentos |
| `cacau` | `#775642` | cor principal, botao padrao e secao de agendamento |
| `caramelo` | `#966B54` | detalhe, eyebrow e estrela, sobre fundo claro |
| `cacau-escuro` | `#5C4133` | derivada, estado pressionado do botao e acento sobre areia |
| `caramelo-claro` | `#E0B48C` | derivada, acento legivel sobre fundo escuro |
| `tinta` e `tinta-suave` | `#2E211A` e `#4A362B` | texto principal e secundario |
| `neutro` | `#78685E` | texto terciario e placeholder |

As cinco derivadas existem porque a paleta de quatro cores nao traz tom de texto nem estado de botao.
Todas ficam na mesma matiz do cacau, entao o conjunto continua lendo como uma familia so.

Onde o acento pode aparecer, por causa de contraste:

- sobre `porcelana`: `caramelo`
- sobre `areia`: `cacau-escuro` em texto pequeno, `cacau` em numero grande e icone
- sobre `cacau`: apenas `porcelana`, porque nenhum tom medio alcanca 4.5 contra `#775642`
- sobre `tinta`: `caramelo-claro`

Fraunces no display, Instrument Sans no corpo, JetBrains Mono nos numeros e nos eyebrows, todas servidas
pelo `next/font`. A textura do hero e uma malha de linhas paralelas, referencia a leitura de densidade
capilar, e usa `#2E211A` direto porque e gradiente inline.

O botao tem quatro variantes em `components/ui/button.tsx`. A `destaque` e a chamada das secoes escuras e
inverte, fundo claro com texto `cacau-escuro`, porque o caramelo cheio nao separa do fundo cacau.

### Animacao

Dois sistemas convivem, de proposito:

- `components/Revelar.tsx` continua nos titulos de secao. Nao depende de biblioteca e pinta na hora,
  entao e o unico que pode aparecer acima da dobra.
- `components/ui/animated-content.tsx` e o AnimatedContent do React Bits, com gsap, usado em card e no
  formulario. Ele nasce com `visibility: hidden` e so aparece quando o gsap roda, portanto **nunca use
  acima da dobra**: seguraria o LCP e deixaria a tela em branco em hidratacao lenta.

O brilho especular da borda vive em `components/ui/camada-especular.tsx` e liga pela prop `especular`
do Button. **E opt-in por um motivo concreto:** cada instancia abre um contexto WebGL, e o navegador
derruba os mais antigos passando de uns 16, com teto menor no celular. Hoje sao quatro CTAs com ele. Se
sair espalhando pelos botoes, alguns simplesmente apagam sem aviso e sem erro no console.

O brilho em CSS do botao, que varre o preenchimento, e independente e vale para todo botao. Os dois
rodam juntos nos CTAs.

Tudo isso desliga sob `prefers-reduced-motion`, inclusive sem chegar a criar o contexto WebGL.

### Acessibilidade

Foco visivel global, link de pular navegacao, `prefers-reduced-motion` respeitado inclusive desligando o
Lenis, alt obrigatorio em toda midia do painel, label associado a cada campo e erro anunciado por leitor
de tela.

### Conteudo

Todo texto e original, escrito sobre as palavras chave de tricologia clinica. Nao aproveite copy de outros
sites do segmento, porque conteudo duplicado derruba o proprio SEO alem do risco autoral.

## O CLI do Payload nao carrega o config

Qualquer comando `payload ...` falha com `Cannot find module './collections/Users'`. O CLI carrega o
config por `require`, e por esse caminho o Node 22 nao resolve import sem extensao. Nao adianta escrever
`./collections/Users.js`, ja foi testado e o webpack do Next tambem passa a nao resolver. Tambem nao
adianta `--use-swc` nem `--disable-transpile`.

Consequencias e como contornar:

- **Import map**: o `pnpm dev` regera sozinho a cada mudanca de config, entao nao precisa do comando.
- **Seed**: com o `pnpm dev` no ar, acesse `/api/dev/seed`. O conteudo vive em `src/lib/seed.ts` e pode
  ser rodado quantas vezes precisar, porque atualiza em vez de duplicar.
- **Tipos**: com o `pnpm dev` no ar, acesse `/api/dev/gerar-tipos`. A rota chama a mesma API publica que
  o CLI usaria, so que de dentro do Next, onde o config carrega. Ela responde 404 fora de desenvolvimento.
  Rode isso sempre que mexer em colecao ou global, e commite o `src/payload-types.ts`.
- **Migracoes**: `pnpm migrate` nao roda. O schema atual foi criado pelo push automatico do modo dev
  contra o proprio Neon. Enquanto for assim, mudanca de schema precisa de um `pnpm dev` apontando para o
  banco de destino. Vale resolver de verdade antes de o site ter movimento.

## Tipos gerados

`src/payload-types.ts` e arquivo versionado e as secoes consomem ele direto, sem cast. Relacao de upload
volta como id ou como documento conforme o `depth` da consulta, entao use o helper `midia` de
`src/lib/utils.ts` para reduzir os dois casos antes de ler `url` e `alt`.
