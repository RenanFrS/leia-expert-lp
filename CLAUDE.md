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
    api/dev/           seed, gerar-tipos e subir-midia, so em desenvolvimento
    sitemap.ts robots.ts
  collections/         Tratamentos, Resultados, Depoimentos, Faq, Leads, Media, Users
  globals/             Clinica, Seo, Rastreamento, todos no grupo Configuracoes do painel
  components/
    sections/          Header, Hero, Metricas, Tratamentos, Tricoscopia,
                       Resultados, Depoimentos, Sobre, Duvidas, Agendamento,
                       Footer, WhatsappFlutuante
    ui/                componentes shadcn mais os primitivos da landing:
                       eyebrow, titulo-secao, lista-verificada, cartao-vidro,
                       animated-content, camada-especular, camada-parallax,
                       carrossel-tratamentos, midia-rotativa, video-fundo
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
    cloudinary-url.ts  convencao de public_id e de URL da CDN, sem SDK
    poster-video.ts    quadro parado de video, para o poster do hero
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

#### Recorte e ponto de foco

A clinica enquadra as fotos por dois controles do painel, no botao de editar imagem. Eles resolvem
coisas diferentes e os dois precisam existir:

- **recorte** apara o arquivo num retangulo fixo
- **ponto de foco** marca o que nao pode sair de quadro. Uma mesma foto cai em caixas de proporcoes
  diferentes, do painel largo do hero ao avatar redondo do depoimento, e o `object-cover` recorta de
  novo por cima do recorte salvo. So o foco sobrevive a todas.

Tres coisas ali nao sao opcionais:

- **`focalPoint: true` precisa ser literal.** A interface testa `uploadConfig?.focalPoint === true`, em
  `@payloadcms/ui`, `Upload/index.js`. Contar com o padrao `true` do resto do Payload nao basta: sem o
  campo escrito, o controle de foco some do painel, embora `focalX` e `focalY` continuem sendo gravados.
- **O `skipSafeFetch` existe por causa do `disableLocalStorage`.** Sem copia em disco, recortar obriga o
  Payload a reler o original pela `url` do documento, e essa releitura passa pelo `safeFetch`, que
  recusa IP fora da faixa unicast. Em desenvolvimento a URL cai em `localhost`, que e loopback, e o
  recorte morre com `Blocked unsafe attempt`. **Nao troque a lista por `skipSafeFetch: true`**: o campo
  `pasteURL` vem ligado por padrao, e liberacao ampla junto com ele vira SSRF a partir do painel.
- **O site le o foco por `object-position`**, pelo helper `enquadramento` de `src/lib/utils.ts`, aplicado
  em toda imagem que usa `object-cover`. Imagem nova entra no site pelo mesmo caminho: passe o documento
  para o helper no `style`, senao aquela foto ignora o foco em silencio.

O helper devolve `undefined` no centro de proposito. O Payload grava `50` nos dois campos assim que o
arquivo sobe, entao sem esse corte toda foto carregaria um `object-position: 50% 50%` inline, que e o
proprio valor inicial do CSS.

O video fica de fora: o `object-position` funcionaria nele, mas o painel so oferece foco para imagem.

**Recortou e a foto continua a mesma? Espere alguns minutos.** Nao e bug, e a purga do cache de borda
do Cloudinary. O endereco do arquivo nao muda quando o conteudo muda, entao a CDN continua entregando os
bytes antigos por um tempo. Medido com um arquivo descartavel: o `staticHandler` recebeu 5142 bytes da
CDN enquanto a API do Cloudinary ja reportava 2382 para o mesmo asset. O adaptador ja sobe com
`invalidate`, e a purga e assincrona. Nao ha o que fazer do nosso lado.

**E dai vem a armadilha de verdade.** Se voce recortar de novo enquanto o painel ainda mostra a foto
antiga, o navegador manda as dimensoes velhas e o sharp estoura:

```
Error cropping image: [Error: extract_area: bad extract area]
```

Foi exatamente isso: o painel mandou `heightInPixels=1029` para um arquivo que ja estava com 723 de
altura. O erro chega na tela como "There was a problem while uploading the file", que nao diz nada.
**Recarregue a pagina do painel antes de recortar a mesma foto outra vez.**

Vale registrar o que **nao** era a causa, porque cada um custou uma investigacao: nao era o `safeFetch`
travando a releitura, nao era o cache de `fetch` do Next e nao era cache de rota do App Router. As
dimensoes do banco batem com as do arquivo em todas as 37 imagens, entao nao ha deriva sistematica.

**Cuidado no comparador de antes e depois.** As duas fotos ficam sobrepostas sob a divisa que desliza,
entao elas precisam do mesmo enquadramento. Foco diferente no antes e no depois desalinha a comparacao,
e como sao dois documentos separados nada no codigo impede isso.

### Header e logotipo

O logotipo da clinica e **quadrado**, 500x500, e nao um wordmark deitado. O `Logotipo.tsx` tira as
medidas intrinsecas do proprio arquivo, pelo `width` e `height` do documento da Media, em vez de um par
fixo. Antes havia `168x36` escrito no codigo, que descrevia um wordmark: o `next/image` reservava a
caixa na proporcao errada e a marca saia com 36 por 36 na tela, ilegivel. Quem manda no tamanho e a
altura da classe, com `w-auto`, entao um logotipo mais largo continua funcionando sem tocar em nada.

Tamanhos: **56px no header** e **80px no rodape**, o que deixa a barra em 96px no topo e 80px depois de
compactar na rolagem.

**A barra completa so abre no `xl`, e nao no `lg`.** O logotipo fica travado no centro, numa grade de
tres colunas `1fr auto 1fr`, entao ele cresceu e as colunas laterais encolheram. No `lg` a nav de cinco
itens passava a metade da barra, empurrava o logotipo para fora do centro e encostava no CTA. Abaixo do
`xl` vale o menu recolhido, que e o mesmo do celular.

**Mexeu no tamanho do logotipo? Refaca a conta.** A soma das larguras dos atalhos nao pode passar da
coluna lateral, que e `(container - logotipo - gaps) / 2`. Com o logotipo em 56px isso da 536px de
coluna para 445px de atalhos, ou seja 107px de folga ate a marca. Era esse numero que estava negativo
antes, e a nav aparecia colada no logotipo com um vao grande sobrando do outro lado.

O `pt` do hero acompanha a altura do header, porque ele e fixo e nao empurra nada. Com a barra em 96px,
o `pt-28` de antes deixava 16px entre ela e o titulo e a frase encostava; hoje sao `pt-32` e `md:pt-36`.
O `scroll-mt-28` dos cartoes de tratamento continua valendo, porque 112px ainda limpam os 96px.

### Hero

A silhueta vem do `hero12` do React Bits, escolhido pelo cliente. Ele e Pro, o codigo nao e publico e
nao ha `REACTBITS_LICENSE_KEY` neste projeto, entao o que existe aqui e reconstrucao com os primitivos
do projeto a partir da referencia visual, nao codigo copiado. Mesma situacao do `about14` e do
`contact34`. **Nao tente rodar `npx shadcn add @reactbits-pro/hero-12`**: sem licenca o registry
recusa.

E um painel de midia unico com o titulo recortado no canto superior esquerdo. O recorte e feito de
blocos de fundo porcelana com o canto inferior direito arredondado. Nao ha mascara nem `clip-path`: o
canto invertido e o proprio arredondamento do bloco branco visto pelo lado de fora.

**O recorte e uma escada, com um bloco por linha do titulo, nao um bloco so.** Cada `span` do `h1`
encolhe ate a largura do proprio texto e leva o proprio canto arredondado, entao a linha larga forma o
primeiro degrau e a curta o segundo, com a midia aparecendo no vao. Com um bloco unico o recorte vira
um retangulo e a forma da referencia se perde.

**Os tres cantos da midia precisam de filete.** Onde a midia emerge de tras do titulo ela forma um
canto superior esquerdo, e sao tres pontos assim: no alto, a esquerda do CTA; no degrau entre a linha
larga e a curta; e na borda esquerda, abaixo do titulo. Em todos, sem filete, o canto sai reto e a
midia entra no branco em bico.

`border-radius` **nao resolve** ali: o vertice nasce do encontro de duas caixas diferentes e nao e
canto de elemento nenhum. Quem faz o servico e o `FileteCanto`, em `Hero.tsx`: um quadrado do tamanho
do raio com um `radial-gradient` que deixa transparente o disco do canto inferior direito e pinta o
resto de porcelana. E o negativo exato de um canto arredondado, entao o arco encosta tangente nas
duas bordas vizinhas e nao aparece emenda. **O raio do filete acompanha o `rounded-br` das linhas**:
mudou num lugar, muda no outro.

Quatro coisas que quebram a escada se forem mexidas sem cuidado:

- **A primeira linha precisa ser mais larga que a segunda.** Hoje sao 864px contra 282px. Se o titulo
  mudar e as duas ficarem parecidas, os degraus somem e parece defeito.
- **As duas linhas ficam dentro do mesmo `h1`.** Tirar uma para fora deixa o titulo da pagina pela
  metade para leitor de tela.
- **A linha com descendente precisa de `pb`.** O `display-xl` tem entrelinha `0.98`, mais apertada que
  o descendente da fonte, e sem o `pb` a cedilha de "começa" vaza do bloco branco para cima da midia.
- **Os filetes sao `hidden lg:block`.** Abaixo do `lg` nao ha escada, e como as linhas ocupam a
  largura toda eles apareceriam como quadrados brancos soltos na borda da tela.

Nao ha eyebrow no hero, de proposito: ele seria um terceiro bloco estreito acima da linha larga e a
silhueta viraria um zigue-zague. O eyebrow segue nas outras secoes.

O que fica **dentro** da imagem: o CTA no canto superior direito, a chamada com as estrelas no
inferior esquerdo e o carrossel de tratamentos no inferior direito. Fora dela, so o titulo.

Texto sobre foto nao tem contraste garantido, porque quem escolhe a imagem e a clinica. Por isso a
chamada fica sobre um veu, um gradiente de `tinta` subindo do pe do painel, com o texto em
`porcelana`. Se mexer no veu, confira o contraste com uma foto clara.

Duas coisas sustentam a montagem:

- **O titulo vem primeiro no DOM.** No `lg` ele sai do fluxo e vira o recorte, mas continua sendo o
  primeiro elemento lido. Se descer para depois do painel, o leitor de tela anuncia a chamada e o
  carrossel antes do `h1` da pagina.
- **O painel e o unico filho em fluxo no `lg`.** E dai que sai a altura da caixa, e e por isso que o
  CTA e o carrossel, absolutos, se alinham ao painel sem precisar estar dentro dele. Assim cada um e
  montado uma vez so, em vez de uma copia para telefone e outra para desktop.

Abaixo do `lg` a sobreposicao nao se sustenta, porque nao sobra largura para texto ao lado de midia.
Ali a pilha e direta: titulo, painel, CTA, carrossel e pilulas.

O painel aceita varios arquivos, foto ou video, e alterna em esmaecimento pelo
`components/ui/midia-rotativa.tsx`. O primeiro arquivo e o LCP da pagina e leva `priority`. **Nao passe
`loading` junto do `priority`**: isso anula o preload que o Next injeta no head, que e justamente o que
adianta o LCP.

**Quando o primeiro arquivo e video, o `priority` nao vale.** Ele so tem efeito no ramo do `<Image>`,
entao sem mais nada o painel pintaria a chapa de areia ate o primeiro quadro decodificar, e o LCP da
pagina viraria o titulo. Quem segura o lugar e o `poster`, montado pelo `src/lib/poster-video.ts` a
partir da URL do proprio video, com `so_0`.

**O video do painel aponta direto para a CDN do Cloudinary, e isso e obrigatorio.** O `Hero.tsx` troca
a URL antes de passar para o `MidiaRotativa`, usando `urlDeEntrega` de `src/lib/cloudinary-url.ts`. Pela
URL que o Payload grava, `/api/media/file/...`, tres coisas dao errado de uma vez:

- o `staticHandler` do adaptador nao aplica transformacao nenhuma, entao vem o arquivo original. Medido
  com o hero atual: **26,6 MB pela rota do Payload contra 4,9 MB pela CDN com `f_auto,q_auto`**
- ele nao responde a `Range`. Pedindo 1 KB ele devolve 200 com o arquivo inteiro, e sem 206 nao ha
  reproducao progressiva nem avanco na linha do tempo. A CDN devolve 206 corretamente
- a derivada da CDN ainda sai faststart, com o `moov` antes do `mdat`. O arquivo que o cliente entrega
  costuma vir com o `moov` no fim, e nesse estado o navegador so mostra o primeiro quadro depois de
  baixar tudo

A troca vale **so para video**. Imagem continua saindo pela rota do Payload, porque quem otimiza ela e
o `next/image`, e mexer nisso mudaria a midia do site inteiro de uma vez.

O painel recorta vertical e sempre recortou: no `lg` ele tem cerca de 1160 por 640 e um video 9:16
aparece em 31% da altura, tirado do centro. No telefone o painel e quase quadrado e sobe para 71%. A
foto vertical que estava ali antes ja mostrava 41%, entao isso e a forma do painel, nao defeito do
arquivo.

O hero fica acima da dobra, entao nada ali pode usar o `AnimatedContent`. Continua tudo no `Revelar`.

**O titulo entra pela esquerda, nao de baixo.** E o `Revelar` com `direcao="esquerda"`, que desloca
3rem no eixo horizontal em vez de 1rem no vertical. O padrao do `Revelar` segue sendo subir, e todas as
outras secoes continuam nele: a direcao e opcao, nao troca de comportamento.

Subindo, o bloco branco do recorte varria a midia de baixo para cima e brigava com a escada. Deslizando,
ele acompanha a leitura da frase.

Isso obriga o `overflow-x-clip` na secao do hero. O titulo nasce 48px a esquerda, e no telefone isso o
poe 28px fora da tela: sem o recorte, vira barra de rolagem horizontal enquanto a animacao nao termina.

### Carrossel de tratamentos

`components/ui/carrossel-tratamentos.tsx` e o cartao do hero que percorre os tratamentos sozinho,
trocando foto, titulo e resumo em conjunto. A casca e o `CartaoVidro` escuro, que existe para cartao
sobre foto.

O `MidiaRotativa` nao serve aqui, porque ele alterna so a midia e neste cartao a imagem precisa
acompanhar o texto do mesmo tratamento. O contrato dele e que foi copiado: mesma trava de 2 a 30
segundos, vinda do mesmo `heroIntervalo` do painel, mesma troca em esmaecimento e o mesmo respeito a
`prefers-reduced-motion`, que deixa so o primeiro item.

Quatro cuidados que um carrossel automatico exige e que ja estao pagos:

- **`tabIndex={-1}` no link dos slides ocultos.** So `aria-hidden` nao tira do foco: sem o tabIndex o
  teclado entra em link invisivel e leva a pessoa para um destino que ela nao esta vendo. Sao dez
  links no cartao e so um pode ser focavel por vez.
- **Pausa no ponteiro e no `focus-within`.** Conteudo que anda sozinho precisa poder parar.
- **Slides na mesma celula de grade**, com `[grid-area:1/1]`. Com posicionamento absoluto o cartao
  teria a altura do slide visivel e pularia a cada troca, porque titulo e resumo variam de tamanho.
- **O titulo do slide e `p`, nao heading.** Um cabecalho que troca sozinho entraria e sairia do outline
  da pagina a cada rotacao.

O link "Mais informacoes" dispara `ver_tratamento` com o slug e o local. Esse evento estava na lista de
`EventoNome` desde o inicio e nunca era disparado em lugar nenhum: a agencia tinha um evento tipado que
nao existia na pratica.

Houve pilulas com o nome de cada tratamento abaixo do painel, e elas **foram removidas a pedido do
cliente**. Com isso o unico link interno para tratamento no topo da pagina e o do cartao visivel no
momento. As ancoras em si continuam existindo nos cartoes da secao de tratamentos.

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

O fundo da secao e o video `public/backgrounds/background-agendamento.mp4`, uma textura abstrata de
10 segundos na propria paleta da marca, entregue pelo `components/ui/video-fundo.tsx`. Ele entra mudo,
comeca sozinho, roda em loop e pausa sob `prefers-reduced-motion`, porque `autoplay` so vale no
carregamento e respeitar quem pede menos movimento exige pausar depois, pela referencia. E a mesma
solucao do `midia-rotativa.tsx`.

Tres coisas ali nao sao escolha de gosto:

- **A secao precisa de `relative isolate`.** Sem contexto de empilhamento proprio, a camada do video em
  `-z-10` cai atras do fundo de um ancestral e o video simplesmente nao aparece.
- **O `bg-cacau` da secao continua.** Ele e a reserva enquanto o arquivo carrega e se ele falhar.
- **O veu e `cacau/85` por conta feita, nao por estimativa.** O pixel mais claro que o arquivo produz e
  `rgb(178,159,146)`, onde porcelana sozinha daria 2.5 de contraste. Sob o veu de 85% porcelana da 5.6 e
  o `porcelana/85` do texto corrido da 4.6, os dois acima do piso. Afrouxar para 70% dobra a presenca do
  video e derruba o texto corrido para perto de 4.0, abaixo do piso. **Se trocar o arquivo, refaca a
  conta contra o pixel mais claro do novo video, nao contra a media dele.**

A secao expoe pouco fundo, porque o painel da foto e o cartao de contato cobrem a esquerda. A maior
area livre fica atras do texto do formulario, que e justamente onde o veu precisa ser forte, entao o
video ali e atmosfera e nao protagonista. Isso foi medido e decidido com o cliente, nao e descuido.

### Comparador antes e depois

`src/components/sections/Resultados.tsx` e o elemento de assinatura do projeto, porque prova visual e o
argumento mais forte nesse segmento e conversa com a logica da tricoscopia.

**A divisa e o proprio `input[type=range]`**, esticado sobre a foto inteira com a pista transparente.
Nao troque por uma div com `onPointerMove`: ja foi assim e errava em tres frentes de uma vez.

- sem `setPointerCapture`, o arrasto morria quando o ponteiro saia da caixa, entao nao dava para chegar
  em 0% nem em 100%. Media 41,6% e travava ali
- sem `touch-action`, arrastar no celular rolava a pagina em vez de mover a divisa
- o range ficava como uma barra visivel por cima da foto e ainda roubava o arrasto de quem pegava perto
  da base

O elemento nativo resolve os tres sozinho e ainda traz teclado com setas, Home e End, e o papel de
slider anunciado por leitor de tela.

Duas coisas que parecem detalhe e nao sao:

- **O thumb e invisivel de proposito.** Com a pista em altura total, o WebKit encosta o thumb no topo em
  vez de centralizar, e nao ha jeito confiavel de mover isso pelo pseudo elemento. O thumb fica so como
  area de pega e quem aparece e a alca desenhada em `[data-alca]`, que o React posiciona.
- **A alca vem depois do input no DOM.** E o que permite ao seletor `:focus-visible ~ [data-alca]`
  desenhar o anel de foco na alca, em vez de uma moldura em volta da foto inteira.

A alca nunca encosta na borda: ela para a meia largura de distancia. A linha usa a mesma conta no
`left`, senao as duas se separam nos extremos.

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

Tres sistemas convivem, cada um com um papel:

- `components/Revelar.tsx` continua nos titulos de secao. Nao depende de biblioteca e pinta na hora,
  entao e o unico que pode aparecer acima da dobra.
- `components/ui/animated-content.tsx` e o AnimatedContent do React Bits, com gsap, usado em card e no
  formulario. Ele nasce com `visibility: hidden` e so aparece quando o gsap roda, portanto **nunca use
  acima da dobra**: seguraria o LCP e deixaria a tela em branco em hidratacao lenta.
- `components/ui/camada-parallax.tsx` e o parallax de rolagem, com framer-motion, na tecnica do
  skiper30. Hoje so a foto dentro do cartao de tratamento usa. Diferente dos outros dois, ele nao e
  entrada: fica ligado ao progresso da rolagem o tempo todo.

O framer-motion entrou so por causa do parallax, entao o projeto carrega dois motores de animacao.
Antes de usar ele em coisa nova, veja se o gsap com `scrub`, que ja estava aqui, nao resolve.

A entrada lateral dos tratamentos usa o `AnimatedContent`, com `direction="horizontal"`. Esta descrita
na secao Tratamentos em zig-zag. Ela substituiu um empilhamento em `position: sticky`, entao qualquer
receita antiga que fale em baralho, degrau ou titulo preso no topo nao vale mais ali.

**O `CamadaParallax` nao pode instanciar Lenis.** O componente publicado do skiper-ui cria uma
instancia propria, e aqui o `components/SmoothScroll.tsx` ja mantem a global da pagina. Duas
instancias brigam pela rolagem. O `useScroll` le a rolagem nativa, que e a que o Lenis move, entao os
dois se entendem sem adaptador.

O modo `preencher` existe para midia dentro de container recortado: ele torna a camada absoluta e
mais alta que o container, e essa sobra e o que impede o deslocamento de abrir fresta nas pontas.
Sem ele a camada fica no fluxo, que e o certo para texto.

O brilho especular da borda vive em `components/ui/camada-especular.tsx` e liga pela prop `especular`
do Button. **E opt-in por um motivo concreto:** cada instancia abre um contexto WebGL, e o navegador
derruba os mais antigos passando de uns 16, com teto menor no celular. Hoje sao quatro CTAs com ele. Se
sair espalhando pelos botoes, alguns simplesmente apagam sem aviso e sem erro no console.

O brilho em CSS do botao, que varre o preenchimento, e independente e vale para todo botao. Os dois
rodam juntos nos CTAs.

Tudo isso desliga sob `prefers-reduced-motion`, inclusive sem chegar a criar o contexto WebGL.

### Tratamentos em zig-zag

`src/components/sections/Tratamentos.tsx` desce os tratamentos ao longo de uma espinha central: um
fio de 1px que sai do titulo e costura a secao inteira, com o numero de cada tratamento marcado nele.
O cartao alterna de lado a cada indice e entra deslizando do proprio lado para o centro, o primeiro
pela direita, o de baixo pela esquerda. A secao continua server component, porque quem anima e o
`AnimatedContent`, que ja e client.

A espinha e o elemento de assinatura da secao e nao e enfeite: e a mesma leitura de densidade capilar
da textura do hero, e e ela que da funcao ao contador. Com ela o numero deixa de valer como ordem de
importancia e passa a valer como posicao num percurso, que e o unico jeito de `01 Queda capilar`
seguido de `02 Dermatoscopia` fazer sentido, ja que a lista mistura queixa, exame e tratamento.

O movimento sai do `AnimatedContent` com `direction="horizontal"` e `reverse` no indice impar. Com
`reverse` falso o deslocamento e positivo, o cartao parte da direita e vai a zero. O `scale` vai em 1
de proposito: o zoom padrao de 0.96 embaralha a leitura de um movimento puramente lateral.

Cinco cuidados, todos ja pagos:

- **O `overflow-x-clip` da secao e obrigatorio.** O cartao nasce 120px fora do lugar, e sem o recorte
  esse deslocamento vira barra de rolagem horizontal na pagina inteira enquanto a animacao nao
  termina. E `clip` e nao `hidden` de proposito, para nao criar um container de rolagem novo.
- **O conector e `aria-hidden` e o numero nao volta para dentro do cartao.** Ele e informacao visual,
  e o titulo do tratamento ja identifica o cartao. Anunciado, viraria um numero solto antes de cada
  artigo.
- **A foto fica na borda de fora.** O cartao docado a direita leva a foto a direita e o texto rente a
  espinha, e o par inverte os dois. E isso que mantem a coluna de leitura sempre junto do fio.
- **A linha interna e flex, nao grid.** As duas colunas tem larguras diferentes, entao com grid o
  `order` da foto trocaria a posicao mas nao a trilha, e a coluna estreita cairia no texto. O
  `md:flex-row-reverse` troca as duas de uma vez.
- **A foto precisa do `min-h`.** Sem altura fixa no cartao, a linha do flex encolhe ate o texto, e o
  tratamento de resumo curto ficaria com uma tira de foto.

O zig-zag so liga no `lg`, com o cartao em 64% da largura docado por `ml-auto` ou `mr-auto`. Do `md`
para baixo o cartao volta a largura cheia e so a espinha continua, reta: em 64% a coluna de texto do
`md` ficaria mais estreita do que qualquer outra do site. No telefone a foto entra acima do texto.

O `scroll-mt-28` do cartao serve a ancora `#slug`, que e o destino do link do carrossel do hero. O
header e fixo, entao sem ele o cartao para escondido embaixo.

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
  **Mas o arquivo tem que ser commitado.** Ele ja esteve no `.gitignore` e foi o que derrubou o primeiro
  deploy: na maquina de quem desenvolve o dev regera e o build local passa, mas a Vercel clona o
  repositorio sem ele e o webpack quebra com `Can't resolve '../importMap.js'` em tres arquivos do
  painel. E nao da para gerar no build, porque o CLI nao carrega o config. Mexeu em config e o arquivo
  mudou? Commite junto.
- **Seed**: com o `pnpm dev` no ar, acesse `/api/dev/seed`. O conteudo vive em `src/lib/seed.ts` e pode
  ser rodado quantas vezes precisar, porque atualiza em vez de duplicar.
- **Upload**: com o `pnpm dev` no ar, `/api/dev/subir-midia?arquivo=videos/hero.mp4&alt=Descricao&hero=1`
  sobe um arquivo de `public/` para a Media e, com `hero=1`, ja troca o painel do hero por ele. Pela
  Local API o arquivo vai como buffer, em processo, entao um video de 25 MB nao esbarra em limite de
  corpo de requisicao. Repetir nao duplica: reaproveita o documento e corrige o `alt` se mudou.
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
