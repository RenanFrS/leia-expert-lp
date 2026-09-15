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

**Porta ocupada nao quer dizer outro projeto.** O `pnpm dev` pula para a proxima porta livre sem
avisar de quem e a ocupada. Ja aconteceu de um segundo dev desta pasta subir na 3002 com o primeiro na
3001: bastaram uns 20 segundos juntos para a API inteira responder 500 com
`Cannot find module './vendor-chunks/lodash...'`, enquanto a home seguia 200 pelo cache, o que esconde o
estrago. Antes de subir, confira a pasta de cada `next-server` rodando, pelo `cwd` do processo.

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
    api/registrar-contato/  grava o clique de WhatsApp com a UTM
    api/dev/           seed, gerar-tipos, gerar-importmap e subir-midia, so em dev
    sitemap.ts robots.ts
  collections/         Tratamentos, Resultados, Galeria, Depoimentos, Faq, Leads, Contatos,
                       Media, Users
  globals/             Clinica, Seo, Rastreamento, todos no grupo Configuracoes do painel
  components/
    sections/          Header, Hero, Metricas, Tratamentos, Tricoscopia,
                       Resultados, GaleriaResultados, Depoimentos, Sobre,
                       Duvidas, Agendamento, AClinica, Footer,
                       WhatsappFlutuante
    ui/                componentes shadcn mais os primitivos da landing:
                       eyebrow, titulo-secao, lista-verificada, cartao-vidro,
                       animated-content, camada-especular, camada-parallax,
                       carrossel-tratamentos, galeria-parallax, grade-parallax,
                       midia-rotativa, video-fundo
    BotaoWhatsapp.tsx  casca padrao do CTA de WhatsApp
    Logotipo.tsx       assinatura da marca, com reserva em texto
    Analytics.tsx      GTM, GA4, Pixel, Ads e banner de consentimento
    SmoothScroll.tsx   Lenis
    Revelar.tsx        reveal on scroll com IntersectionObserver
    painel/            componentes do admin do Payload, nao do site
  lib/
    analytics.ts       camada unica de eventos, conversao e leitura de UTM
    acesso.ts          regra de papel usada no access control
    aviso-lead.ts      email de lead novo, da epoca do formulario
    motivos.ts         lista canonica dos motivos, usada so pela colecao Leads
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
- Os parametros UTM sao gravados junto de **cada clique que abre o WhatsApp**, na colecao `contatos`,
  o que permite cruzar o que o painel de anuncios reporta com o que a clinica realmente recebeu. Isso
  era feito por lead do formulario, ate ele sair do site.
- Velocidade, SEO on page, UX e acessibilidade sao entrega nossa e ficam documentadas no README, para que
  nenhuma queda de resultado possa ser atribuida ao site.

## Regras por area

### Rastreamento

`src/lib/analytics.ts` e a unica porta de entrada de evento. Nao chame `gtag` nem `fbq` direto em
componente. Eventos tipados em `EventoNome`:

`clique_whatsapp`, `ver_tratamento`, `abrir_faq`.

**Quatro eventos sairam dessa lista quando o formulario saiu do site**: `clique_agendar`,
`inicio_formulario`, `envio_formulario` e `erro_formulario`. Nenhum deles tem mais onde disparar, e
evento tipado sem emissor e o mesmo buraco que o `ver_tratamento` ja teve, com a agencia lendo no
relatorio um evento que a pagina nunca produz. **Nao reintroduza nenhum sem que exista de novo um lugar
que dispare.**

#### A conversao mudou de lugar

**O clique no WhatsApp virou a conversao do site.** Antes ela saia do envio do formulario; sem
formulario, sem essa troca a conta de anuncios ficaria sem sinal nenhum para otimizar.

Quem faz isso e o `registrarContatoWhatsapp`, e **ele e a porta unica**, nao o `BotaoWhatsapp`. Ele faz
tres coisas de uma vez, e as tres andam juntas:

1. empurra `clique_whatsapp` no dataLayer, para a agencia montar tag e gatilho no GTM sem tocar em codigo
2. dispara `generate_lead` no GA4, `Lead` no Meta e a conversao do Google Ads, quando o ID e o rotulo
   estao preenchidos no painel
3. grava o clique com a UTM da visita, o que substitui a origem que antes ia em cada lead

**Clique nao e conversa aberta.** O numero daqui e maior que o de pessoas que realmente escreveram para
a clinica, e a agencia precisa saber disso ao comparar com o painel de anuncios.

**O rotulo do Ads chega pelo `window`, e nao por prop.** O `Analytics.tsx` publica
`window.leiaAds = { id, label }` no efeito de montagem. Levar dois campos de rastreamento por prop ate
cada `BotaoWhatsapp` atravessaria a pagina inteira para servir a um botao, e aquele arquivo ja e o dono
da superficie de medicao no window, onde ja vivem `dataLayer`, `gtag` e `fbq`.

#### Os dois chamadores

Abrir o WhatsApp e normalmente pelo `components/BotaoWhatsapp.tsx`, que monta o link e chama o
`registrarContatoWhatsapp`. Nao monte `wa.me` na mao em componente.

**A excecao e o `WhatsappFlutuante`**, que tem casca propria de Lottie e nao e um `Button`. Ele monta o
link na mao, mas **chama a mesma funcao**. Isso ja quase deu errado: ele chamava `pushEvento` cru, e
quando o clique virou conversao ele passaria a contar no dataLayer e **nao** disparar conversao no Ads,
justo sendo a maior porta de entrada do celular.

O rodape ja quebrou essa regra de outro jeito: tinha um `<a>` com o `whatsappLink` montado direto, entao
abria conversa sem aparecer em relatorio nenhum. Hoje passa pelo componente, com `local="footer"`.

#### Mapa dos CTAs

| Origem | Evento e `local` |
| --- | --- |
| Header e menu do celular | `clique_whatsapp`, `header` e `menu-mobile` |
| Tricoscopia | `clique_whatsapp`, `tricoscopia` |
| Contato, CTA principal | `clique_whatsapp`, `card-agendamento` |
| Contato, numero grande | `clique_whatsapp`, `contato-numero` |
| Sobre | `clique_whatsapp`, `sobre` |
| Fechamento, secao A clinica | `clique_whatsapp`, `fechamento` |
| Rodape | `clique_whatsapp`, `footer` |
| Botao flutuante | `clique_whatsapp`, `botao-flutuante` |

**O `local="hero"` nao existe mais.** O CTA de dentro do painel foi removido a pedido do cliente. Vale
saber o efeito colateral, porque ele nao e obvio: o CTA do header e `hidden xl:inline-flex`, entao
**abaixo de 1280px nao sobra nenhum botao de agendar visivel acima da dobra**, so o do menu recolhido e
o WhatsApp flutuante. Se a agencia estranhar a queda de `clique_whatsapp`, e daqui.

#### O que a agencia precisa saber

Nao e codigo, mas sem isso a medicao quebra em silencio:

| Antes | Agora |
| --- | --- |
| `envio_formulario` marcava conversao | `clique_whatsapp` marca conversao |
| `clique_agendar` | nao existe mais |
| `inicio_formulario`, `erro_formulario` | nao existem mais |
| UTM no lead do formulario | UTM na colecao `contatos`, por clique |

O rotulo de conversao continua no mesmo campo do painel, entao a tag existente segue valendo: ela so
passa a disparar em outro momento.

### Consentimento

Consent Mode v2 inicia com `ad_storage`, `ad_user_data`, `ad_personalization` e `analytics_storage`
negados, liberando so apos o aceite no banner. A decisao fica em `localStorage`, na chave
`leia-consentimento`. O banner pode ser desligado no painel pelo campo `consentimento`.

### Contatos e leads

**O formulario foi removido do site**, a pedido do cliente, que pediu foco total no WhatsApp. O que
ficou no lugar dele:

`POST /api/registrar-contato` grava, na colecao `contatos`, cada clique que abre o WhatsApp: data, o
`local` do clique, a pagina e os parametros UTM da visita. **E isso que mantem de pe a regra de medicao**
depois que o lead deixou de existir.

Tres coisas dessa rota nao sao opcionais:

- **O nome dela nao pode ser o slug da colecao, e isso custou uma investigacao.** O REST do Payload
  responde em `/api/<colecao>`, por um catch all em `(payload)/api/[...slug]`. Segmento estatico ganha
  de catch all no Next, entao um arquivo em `app/api/contatos/route.ts` **sombreia** o endpoint da
  colecao: como ele so exporta POST, todo GET, PATCH e DELETE dela passa a responder **405**, e o painel
  perde as mutacoes daquela colecao.

  Medido: com a rota chamada `contatos`, `GET /api/contatos` devolvia 405, enquanto `/api/galeria`
  devolvia 200 e `/api/leads` devolvia 403, que e o certo para colecao fechada. **A rota antiga do
  formulario tinha esse mesmo defeito**, em `/api/leads`, e ninguem notou porque lead quase nunca era
  editado pelo painel. Rota nossa que converse com uma colecao precisa de nome proprio.
- **O envio vai por `sendBeacon`, nao por `fetch` comum.** O clique navega para o WhatsApp logo em
  seguida, e requisicao normal e cancelada quando a pagina sai.
- **Ela nunca devolve erro util, e responde 204 sempre.** Quem chama e um beacon: nao ha ninguem do
  outro lado para reagir. Limite estourado, corpo invalido ou falha de banco terminam igual, sem
  gravar. Impedir a pessoa de abrir a conversa por causa de um log seria o pior desfecho.

O limite por IP e de 20 a cada 10 minutos, mais alto que o do formulario porque log de clique e
naturalmente mais frequente: a mesma pessoa pode abrir pelo header, desistir e abrir pelo rodape.

**A colecao guarda volume, nao pessoas.** Ali aparece quantos contatos cada campanha gerou, e nao quem
sao: nome e telefone so existem dentro da conversa do WhatsApp. Nao ha dado pessoal, o IP serve so ao
limite e nao e gravado, entao isso nao depende do banner de consentimento. **E uma linha por clique**,
entao ela cresce rapido e vale combinar uma limpeza periodica com a clinica.

#### A colecao Leads continua de pe

Ela guarda os cadastros que entraram enquanto o formulario existia e **parou de crescer**. A rota
`/api/leads` foi apagada, entao `/api/leads` hoje e o REST do Payload, que responde 403 pelo
`create: () => false`. O `aviso-lead.ts` e o `motivos.ts` continuam porque a colecao usa os dois.

Leitura, edicao e exclusao das duas colecoes exigem papel de administrador, pelo helper `ehAdmin` em
`src/lib/acesso.ts`. A colecao Users tambem e gateada, e o campo `papel` so aceita alteracao vinda de
administrador, senao um editor se promoveria e a trava nao valeria nada. O primeiro usuario nasce
administrador de proposito, porque e criado sem ninguem logado.

O aviso por email do `afterChange` continua ligado na colecao Leads. Como nada cria lead novo, ele nao
dispara mais na pratica, mas segue valendo se alguem cadastrar um pela mao no painel.

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

A clinica enquadra as fotos por dois controles, e eles resolvem coisas diferentes:

- **recorte** apara o arquivo num retangulo fixo
- **ponto de foco** marca o que nao pode sair de quadro. Uma mesma foto cai em caixas de proporcoes
  diferentes, do painel largo do hero ao avatar redondo do depoimento, e o `object-cover` recorta de
  novo por cima do recorte salvo. So o foco sobrevive a todas.

**O recorte nativo do Payload esta desligado, `crop: false`.** No lugar dele entrou o
`src/components/painel/RecorteImagem.tsx`, com o endpoint `POST /api/media/:id/recortar` na propria
colecao. A diferenca que importa: **o nosso gera um arquivo novo e nunca encosta no original**.

O nativo sobrescrevia o original no mesmo `public_id`, e como o endereco nao muda quando o conteudo
muda, a foto recortada ficava presa no cache de borda por minutos e um segundo recorte estourava com
`extract_area: bad extract area`. Todo esse diagnostico esta mais abaixo, e continua valendo como
historia.

Tres decisoes do recorte novo:

- **Quem recorta e o Cloudinary, por `c_crop` na URL, nao o sharp.** O endpoint so busca os bytes ja
  prontos e cria o documento. Isso derruba de uma vez a cadeia frangil do nativo: reler o original pela
  rota do proprio site, passar pelo `safeFetch` e subir por cima do mesmo arquivo.
- **A area vai em porcentagem, nunca em pixel.** E o que desacopla o recorte das dimensoes que o
  navegador acha que o arquivo tem, que era a origem do `extract_area`. Testado recortando duas vezes
  seguidas sem recarregar, o caminho que antes quebrava: passou nas duas.
- **O arquivo novo guarda de onde veio**, nos campos `recortadaDe` e `recorte`, os dois somente leitura.
  Sem isso a biblioteca vira um monte de arquivo parecido sem procedencia.

O recorte **nao troca nada sozinho no site**: ele entra na biblioteca e alguem escolhe onde usar.

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

**Mexeu no tamanho do logotipo, ou na largura do container? Refaca a conta.** A soma das larguras dos
atalhos nao pode passar da coluna lateral, que e `(container - logotipo - gaps) / 2`. Com o container
em 1440 e o logotipo em 56px, sao 644px de coluna para 445px de atalhos, ou seja 199px de folga ate a
marca. No `xl`, a largura mais apertada onde a barra completa aparece, a folga cai para 131px. O CTA do
lado direito ocupa 192px.

O `pt` do hero acompanha a altura do header, porque ele e fixo e nao empurra nada. Com a barra em 96px,
o `pt-28` de antes deixava 16px entre ela e o titulo e a frase encostava. Hoje sao `pt-28` e `md:pt-32`
abaixo do `lg`, o que devolve os mesmos 16px de folga com o titulo menor, e `lg:pt-24` dali para cima,
onde o painel encosta no header sem folga nenhuma.
O `scroll-mt-28` dos cartoes de tratamento continua valendo, porque 112px ainda limpam os 96px.

### Hero

A silhueta vem do `hero12` do React Bits, escolhido pelo cliente. Ele e Pro, o codigo nao e publico e
nao ha `REACTBITS_LICENSE_KEY` neste projeto, entao o que existe aqui e reconstrucao com os primitivos
do projeto a partir da referencia visual, nao codigo copiado. Mesma situacao do `about14` e do
`contact34`. **Nao tente rodar `npx shadcn add @reactbits-pro/hero-12`**: sem licenca o registry
recusa.

E um painel de midia unico com o titulo recortado **no formato do notch do iPhone**: um bloco de fundo
porcelana centralizado, pendurado na borda de cima do painel, de topo reto e cantos de baixo
arredondados, com a midia passando dos dois lados. Nao ha mascara nem `clip-path`: o canto invertido e
o proprio arredondamento do bloco branco visto pelo lado de fora.

**Houve uma escada aqui antes**, com um bloco por linha do titulo, larguras diferentes e recorte no
canto superior esquerdo. Ela saiu a pedido do cliente. Qualquer receita antiga que fale em degrau, em
linha larga contra linha curta ou em recorte no canto esquerdo **nao vale mais**.

**Os dois cantos onde a midia encosta no notch precisam de filete.** Em cada lado a midia forma um
canto de 90 graus contra a borda de cima do painel, e sem o filete ele sai em bico. `border-radius`
**nao resolve** ali: o vertice nasce do encontro de duas caixas diferentes e nao e canto de elemento
nenhum. Quem faz o servico e o `FileteCanto`, em `Hero.tsx`: um quadrado do tamanho do raio com um
`radial-gradient` que deixa transparente o disco de um dos cantos de baixo e pinta o resto de
porcelana. E o negativo exato de um canto arredondado, entao o arco encosta tangente nas duas bordas
vizinhas. **O raio acompanha o `rounded-b` do notch**: mudou num lugar, muda no outro.

**A prop `lado` do filete escolhe qual canto vira o disco transparente**, e errar isso deixa o filete
de costas: em vez de abrir a curva para a midia, ele fecha um quadrado branco sobre ela.

**Cada filete monta 1px sobre o notch, pelo `-mr-px` e `-ml-px`, e isso nao e folga inventada.** O
bloco fica centrado por `-translate-x-1/2`, entao a borda dele cai em coordenada fracionaria. Filete e
fundo sao os dois brancos, mas cada um e composto separadamente sobre a foto e cada um cobre so uma
fracao daquele pixel: medido, sobrava 22% de midia e a emenda aparecia como um fio de `(230,221,220)`
contra o branco. Sobrepor nao muda nada, porque a cor e a mesma, e mata o fio.

Cinco coisas que quebram o notch se forem mexidas sem cuidado:

- **As duas linhas querem larguras parecidas**, o oposto da escada. Hoje sao 407px e 407px em 1440.
  Num bloco centralizado, linhas desiguais deixam um degrau invisivel de um lado so e o recorte para
  de parecer proposital.
- **A fonte cai para `display-lg` no `lg`**, e so ali. Em `display-xl` a linha mais larga da 576px e o
  bloco passaria de 670px, quase metade do painel, largo demais para ler como notch. Abaixo do `lg`
  nao ha notch e o titulo continua em `display-xl`.
- **O respiro lateral aperta abaixo do `xl`, `lg:px-8 xl:px-12`.** O notch cresce em proporcao
  conforme a janela encolhe, porque o `clamp` da fonte desacelera antes do container: 37% do painel em
  1440 e 41% em 1024. Com `px-12` nos dois sobravam **12px** entre o notch e o CTA do canto. Em
  `px-8` a folga vai a 28px. **Mexeu na fonte ou no CTA, refaca a medida em 1024**, que e o pior caso,
  e lembre que o bloco e centralizado: encolher 32px afasta so 16 de cada lado.
- **As duas linhas ficam dentro do mesmo `h1`.** Tirar uma para fora deixa o titulo da pagina pela
  metade para leitor de tela.
- **A linha com descendente precisa de `pb`.** A entrelinha do display e mais apertada que o
  descendente da fonte, e sem o `pb` a cedilha de "começa" vaza do bloco branco para cima da midia.

Os filetes sao `hidden lg:block`. Abaixo do `lg` nao ha notch, e como as linhas ocupam a largura toda
eles apareceriam como quadrados brancos soltos na borda da tela.

Nao ha eyebrow no hero, de proposito: ele seria uma terceira linha dentro do notch e engordaria o
bloco justamente na altura. O eyebrow segue nas outras secoes.

O que fica **dentro** da imagem: a chamada com as estrelas no canto inferior esquerdo e o carrossel de
tratamentos no inferior direito. Fora dela, so o titulo. Havia um CTA no canto superior direito e ele
saiu a pedido do cliente.

Texto sobre foto nao tem contraste garantido, porque quem escolhe a imagem e a clinica. Por isso a
chamada fica sobre um veu, um gradiente de `tinta` subindo do pe do painel, com o texto em `porcelana`.

**A chamada abre pelo problema, em pergunta ao sintoma**: "Seu cabelo esta caindo, afinando ou abrindo
falhas? Descobrimos por que isso acontece e tratamos a causa, nao so o sintoma." E a regra dos 3
segundos do time de trafego: a pessoa precisa se reconhecer antes de decidir ficar.

Ela ja teve duas versoes, e as duas erravam por motivos diferentes. "Tricologia clinica para homens e
mulheres..." so conversava com quem ja conhece o termo. "Queda de cabelo, calvicie e alopecia tem
causa..." nomeava as condicoes em tom clinico e escorregava para o metodo antes de falar do problema.

**Tres travas continuam valendo em qualquer reescrita**: sem a palavra diagnostico, sem promessa de
gratuidade e **sem promessa de cura**. O proprio FAQ admite perda antiga que ja nao responde, entao a
frase descreve o que a clinica faz, e nao garante resultado.

Ela tambem **cresceu de `text-base sm:text-lg` para `text-lg sm:text-2xl`**, com a coluna abrindo de
`max-w-md` para `max-w-xl`. No tamanho antigo ela lia como legenda de foto, e nao como a promessa da
pagina.

**A altura do veu e fixa, `h-[28rem]` e `lg:h-[30rem]`, e nao uma fracao do painel.** Enquanto era
`h-2/3` ele acompanhava a altura do painel, mas a chamada fica ancorada no **pe** dele: no celular, com
painel curto, ela subia para a parte fraca do gradiente. Medido naquele estado, contra uma foto de
jaleco branco, o fundo atras do texto era `rgb(244,243,243)` e o contraste caia para **1.11**, ou seja
texto branco sobre branco.

**O veu subiu de 22rem junto com a fonte, e essa dependencia e a coisa mais importante desta secao.** A
chamada e ancorada no pe do painel, entao texto maior empurra o **topo** do bloco para cima, para a
parte fraca do gradiente. E o mesmo defeito de antes por outro caminho. Com o texto novo e o veu de
22rem, o topo caia a 65% do gradiente, onde o alfa e ~`tinta/49`.

Medido no navegador depois da correcao, escondendo o texto por folha injetada para sobrar so o fundo
composto, contra o pixel mais claro da faixa e nao contra a media dela:

| Largura | Fundo composto | porcelana | porcelana/85 |
| --- | --- | --- | --- |
| 390 | `rgb(103,94,88)` | 6.33 | 5.12 |
| 768 | `rgb(95,85,81)` | 7.23 | 5.80 |
| 1024 | `rgb(101,91,87)` | 6.59 | 5.30 |
| 1440 | `rgb(101,91,86)` | 6.60 | 5.31 |
| 1920 | `rgb(102,91,87)` | 6.56 | 5.28 |

**Os 28rem do celular sao piso, nao folga.** Com 24rem o topo do texto subia para 52% do gradiente e a
linha das estrelas, em `porcelana/85`, dava **4.47**, logo abaixo do piso de 4.5. Em 28rem ele volta
para 44,6% e a linha vai a 5.12.

**Quem reprova primeiro e sempre a linha das estrelas, nunca o texto cheio**, e **o celular e o pior
caso**, porque o painel ali e curto e o mesmo bloco ocupa uma fracao maior dele. Mexeu no veu, no
tamanho da fonte ou no comprimento do texto? Refaca a medida em 390 primeiro, contra o pixel mais claro.

**Com a frase em pergunta, o bloco encurtou e a conta melhorou por estrutura.** Sao ~125 caracteres
contra 183, e o topo do texto desceu de 44 a 52% do gradiente para **36,5% no desktop e 38,4% no
celular**, onde o veu vale perto de `tinta/75`: isso passa ate contra um quadro branco puro. Medido
sobre o video atual do painel, **8.78 e 6.67** na linha das estrelas em 1440 e 390. Os numeros absolutos
dependem da midia do momento, que e mais escura que a foto da tabela acima; a posicao no gradiente nao.

**O indicador de desenvolvimento do Next falseia a medida em 1440.** Ele fica no canto inferior
esquerdo, tem um "N" branco puro e encosta na borda do bloco da chamada: a leitura cai para 1.00. Esconda
o `nextjs-portal` antes de amostrar, junto com a gravacao do `leia-consentimento`.

**Cuidado ao medir: o banner de consentimento nasce por cima do pe do painel**, exatamente onde a
chamada fica, e a chapa branca dele falseia a leitura para contraste 1.00. Antes de amostrar, grave
`leia-consentimento` no `localStorage`.

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

**O painel e full bleed e nao tem canto arredondado.** Ele saiu do `container`, entao vai de borda a
borda da janela em qualquer largura. O `rounded-[28px]` foi junto: canto arredondado encostado na borda
da tela deixa quatro falhas brancas nas pontas.

**No `lg` o painel preenche o que sobra da janela**, `calc(100vh - 6rem)`, e os 6rem sao exatamente a
altura do header. Com o `lg:pt-24` da secao valendo os mesmos 96px, o painel encosta no header sem
folga e o pe dele cai na dobra. Nao ha mais altura fixa de 780px.

**O `min-h` de 640px nao e enfeite.** A chamada e o carrossel sao absolutos no pe do painel; em janela
baixa, sem o piso, os dois se espremem um sobre o outro.

O painel recorta vertical e sempre recortou: um video 9:16 aparece em cerca de um terco da altura,
tirado do centro. No telefone o painel e quase quadrado e sobe para 84%. A foto vertical que estava ali
antes mostrava 41%, entao isso e a forma do painel, nao defeito do arquivo. Como a altura agora
acompanha a janela, essa fatia muda de monitor para monitor.

**A foto so vai ate o topo se o header for resolvido junto, e por isso ela nao vai.** Tentado e medido:
com o painel em `pt-0`, o header fixo passa por cima da foto e colide com o notch em dois pontos. A nav
pede 445px e a coluna ao lado do notch tem 436px, entao **ela nao cabe em largura nenhuma**, e o
logotipo, centralizado como o notch, cai 42px em cima da primeira linha do titulo. Com o painel
comecando nos 96px nao ha colisao nenhuma: o menu termina em 76px e o notch comeca em 96px.

O hero fica acima da dobra, entao nada ali pode usar o `AnimatedContent`. Continua tudo no `Revelar`.

**O titulo desce de cima, nao entra pela esquerda.** E o `Revelar` com `direcao="cima"`, que desloca
1.5rem para cima no eixo vertical. O padrao do `Revelar` segue sendo subir, e todas as outras secoes
continuam nele: a direcao e opcao, nao troca de comportamento. A `esquerda` ficou no mapa, herdada da
silhueta em escada.

O sentido acompanha a forma: o notch esta pendurado na borda de cima, entao ele assenta descendo.

**O curso e curto de proposito, 24px, e nao os 48px da entrada lateral.** No `lg` o titulo assenta a
96px do topo da secao, pelo `lg:pt-24`, encostado no header, que ocupa exatamente esses 96px **sem
fundo proprio** enquanto a pagina esta no topo. Com 48px de curso o titulo nasceria no meio dos links
do menu.

Mesmo com 24px a margem e justa: medido, a base do logotipo fica em 76px e a primeira linha do titulo,
no inicio da animacao, tambem em 76px. Encostam, mas naquele instante a opacidade ainda e zero. **Se
aumentar o curso, refaca essa medida.**

O `overflow-x-clip` da secao ficou de heranca: ele existia porque o titulo nascia 48px a esquerda e no
telefone isso o punha fora da tela. Com a entrada vertical isso nao acontece mais, mas ele fica, porque
a secao continua tendo filhos absolutos encostados nas bordas do painel e o `clip` e barato. E `clip` e
nao `hidden` de proposito, para nao criar container de rolagem novo.

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

**Quando a midia do tratamento e video, aqui entra o quadro parado dele, nao o arquivo.** Sao duas
razoes. O cartao desenha com `next/image`, e o otimizador responde **400, "The requested resource isn't
a valid image"**, para um `.mov` ou um `.mp4`, entao sem isso o slide fica vazio. E este carrossel vive
acima da dobra, ao lado do painel que ja e o LCP: somar video tocando num cartao de 320px que troca
sozinho custaria caro. Quem monta o quadro e o `Hero.tsx`, que e server component, com o
`posterDeVideo`. Na secao de tratamentos, bem abaixo, o mesmo arquivo toca de verdade.

Houve pilulas com o nome de cada tratamento abaixo do painel, e elas **foram removidas a pedido do
cliente**. Com isso o unico link interno para tratamento no topo da pagina e o do cartao visivel no
momento. As ancoras em si continuam existindo nos cartoes da secao de tratamentos.

### Fundo em video

Tres secoes tem video de fundo, todas pelo mesmo `components/ui/video-fundo.tsx`: o agendamento, a
tricoscopia e os depoimentos. Os arquivos das duas ultimas saem do painel, na aba **Videos de fundo** da
global Clinica, nos campos `videoTricoscopia` e `videoDepoimentos`. Sem arquivo, a secao volta ao fundo
chapado.

**A conta do veu muda de sinal conforme a secao.** Nao existe valor padrao, e copiar o de uma secao para
outra da errado:

- **secao escura com texto claro**, como a tricoscopia: o risco vem do pixel mais **claro** do arquivo
- **secao clara com texto escuro**, como os depoimentos: o risco vem do pixel mais **escuro**

Nos depoimentos isso pesou de verdade. O pixel mais escuro daquele video e **preto puro**, o vao entre
os fios, e sobre ele o `cacau-escuro` do eyebrow so passa de 4.5 com veu de **90%**: em 85% cai para
4.28. O `tinta` do titulo da 8.08, com folga, e os cartoes sao brancos opacos, entao ficam de fora da
conta.

Um veu de `porcelana/75` deixaria o video bem mais visivel e tambem passaria, mas a secao perderia o tom
areia, que existe para quebrar o ritmo da pagina. Foi escolha, nao descuido.

**A transformacao e mais agressiva do que a do hero**, `f_auto,q_auto:eco,w_1600`, nas duas secoes. Nos
depoimentos sao 1,4 MB em vez de 3,3 MB. Vale porque o video vive atras de um veu forte. No hero nao
valeria, porque la ele e o assunto.

Cada secao com video precisa de `relative isolate`, senao a camada em `-z-10` cai atras do fundo de um
ancestral e some. A cor de fundo original continua como reserva.

### Tricoscopia

A secao do exame tem video de fundo, pelo mesmo `components/ui/video-fundo.tsx` do agendamento. O
arquivo sai do painel, no campo `videoTricoscopia` da global Clinica, aba **Exame**. Sem arquivo a
secao volta ao fundo escuro chapado, que era o comportamento antigo.

**O arquivo mudou, e com ele a conta.** O video antigo parecia salao de beleza e o time de trafego
pediu ambiente clinico. Entrou o `novobackground-tricologia.mp4`, que mostra a tela da tricoscopia
durante o exame.

Tres coisas medidas, nao estimadas:

- **O veu e `tinta/85`, e subiu de 80 por causa da troca.** O video antigo era escuro, com pixel mais
  claro em `rgb(197,194,202)`. O novo e claro: o pixel mais claro e **branco puro** e entre **40% e
  53% de cada quadro** passa de 0.75 de luminancia, medido amostrando quadro a quadro pela CDN.

  Contra branco puro, sob 85%, o fundo composto e `rgb(77,66,60)` e da **9.72** em porcelana, **5.74**
  no `porcelana/70` do paragrafo de apoio, **5.21** no `porcelana/65` das etapas e **5.13** no
  `caramelo-claro` do eyebrow e dos numeros.

  **Em 80% o caramelo-claro cai para 4.31 e reprova.** Ele e o mais apertado dos quatro, entao **e ele
  que manda no veu**, nao o titulo, que sobra em qualquer valor.

  O preco e que o video aparece pouco: arquivo claro atras de secao escura pede veu pesado. E o custo
  de manter a secao escura, e foi escolha, nao descuido.
- **A transformacao e mais agressiva que a do hero**, `f_auto,q_auto:eco,w_1600` em vez de
  `f_auto,q_auto`. Vale porque o video vive atras de um veu de 85% e a perda nao chega a aparecer. No
  hero nao valeria, porque la o video e o assunto.
- **A URL aponta direto para a CDN**, pelo `urlDeEntrega`, e nao para a rota do Payload. Mesmo motivo do
  hero: aquela rota nao transforma, nao responde a `Range` e passa os bytes pelo servidor do Next.

**Como medir isso sem ffmpeg**, que e o caso desta maquina: puxe quadros parados da propria CDN, com
`so_0`, `so_1` e por diante na URL de video do Cloudinary, e rode `sharp().stats()` ou uma varredura de
pixel em cada um. O `sharp` ja e dependencia direta do projeto. **Varra pixel a pixel e guarde o mais
claro**: a media do quadro nao serve, porque o risco de contraste mora no pixel isolado, tipo o jaleco
ou o reflexo da lampada.

**O CTA de destaque abre o WhatsApp.** Ao lado dele ja houve um link discreto ate o formulario, que
existia so para o evento `clique_agendar` continuar tendo um emissor. **O formulario saiu do site**,
entao o link nao tem mais destino e o evento saiu de `EventoNome`. Nao recoloque um sem que exista
formulario de novo.

A secao precisa de `relative isolate`, senao a camada em `-z-10` cai atras do fundo de um ancestral e o
video some. O `bg-tinta` continua como reserva.

### Sobre e contato

As duas secoes seguem a forma de blocos do shadcnblocks escolhidos pelo cliente, o `about14` e o
`contact34`. Os dois sao Pro e o codigo nao e publico, entao o que existe aqui e reconstrucao com os
primitivos do projeto, nao codigo copiado.

O Sobre fala em primeira pessoa e o conteudo inteiro vem da aba **Sobre** da global Clinica. O campo
`sobre` e so dessa secao.

**A descricao do `MedicalClinic` nos dados estruturados vem do campo `descricao` da global Seo**, com a
`chamada` e o `sobre` so de reserva, nessa ordem. Ela ja foi a propria `chamada`, enquanto a chamada era
institucional. Quando a chamada virou pergunta ao sintoma, que funciona no hero e le mal no resultado de
busca, as duas divergiram e a descricao passou para o campo que ja existia para isso. O `sobre` fica por
ultimo porque fala em primeira pessoa. **Se o `descricao` do Seo ficar vazio, a pergunta do hero volta a
ir para o Google.**

**O Sobre foi remontado a pedido do time**, que pediu para valorizar a apresentacao da profissional:

- **O rotulo virou eyebrow acima do titulo.** Ele ficava enterrado na primeira coluna da grade, e era o
  unico lugar do site onde o eyebrow nao abria a secao.
- **O resumo virou paragrafo de abertura**, sob o titulo. Em cinza pequeno na coluna estreita ele lia
  como nota de rodape, quando e a frase que apresenta a Leia.
- **A assinatura virou cartao sobre areia**, com retrato de 64px, nome, credencial e a lista de
  formacao. Antes eram um retrato de 44px e duas linhas soltas. Sobre areia o acento e o
  `cacau-escuro` em texto pequeno, pela regra da paleta.
- **Campo novo `credenciais`**, array de texto na aba Sobre. A `credencial` e uma linha so, e lista de
  formacao e o que sustenta autoridade numa pagina de clinica. Sem itens a lista nao aparece, e o
  cartao fica curto: com ele vazio sobra espaco embaixo, entao vale preencher.
- **A foto larga ganhou `CamadaParallax preencher`**, o mesmo tratamento da foto do cartao de
  tratamento. Sem dependencia nova.
- **Entrou `BotaoWhatsapp` com `local="sobre"`.** A secao terminava sem saida nenhuma.

#### A secao de contato

**Aqui havia um formulario, e ele foi removido**, a pedido do cliente, que pediu foco total no WhatsApp.
O que saiu junto esta na secao Contatos e leads e no Rastreamento; o resumo e que a conversao do Ads e a
gravacao de UTM mudaram de lugar, nao sumiram.

A forma segue o bloco escolhido pelo cliente: coluna de texto a esquerda e a foto sangrando ate a borda
da janela a direita, empilhando com a foto por ultimo no celular. O conteudo e eyebrow, titulo, um
paragrafo curto, o CTA com a seta e, mais abaixo, telefone e e mail grandes.

**Esta e a segunda secao sem `container`, junto com o hero**, e o motivo e a foto encostar na borda.
Nenhum truque de margem negativa resolve isso de dentro de uma coluna de grade, porque porcentagem em
margem resolve contra a celula e nao contra o container.

**O recuo da coluna de texto e calculado a mao e reproduz a calha do `container`:**
`lg:pl-[max(1.25rem,calc((100vw-1376px)/2))]`. O container e 1440px com 2rem de respiro a partir do
`2xl`, o que da 1376px uteis, entao a calha e `(100vw - 1376px) / 2` com piso de 1.25rem. Medido contra
o titulo do Sobre: **32px em 1440, 272px em 1920 e 20px em 1280, alinhado nos tres**. Mexeu no
`container.padding` ou no `screens` do tailwind.config? Refaca aqui, senao esta secao sai desalinhada do
resto da pagina.

**O numero grande e link de WhatsApp, e isso mudou de regra.** Antes o numero era texto puro de
proposito, para nao existir um segundo caminho de conversa fora do componente que grava o evento.
Passando por dentro do `BotaoWhatsapp`, com `local="contato-numero"`, o motivo daquela regra nao se
aplica: o clique entra no relatorio como qualquer outro.

**O tamanho do numero vai num `span` interno, e nao na `className` do botao.** O `Button` nasce com
`text-sm` na base, e o `tailwind-merge` nao reconhece `text-display-md` como do mesmo grupo de
`font-size`, porque e chave custom do `tailwind.config.ts`: as duas classes sobrevivem e o `text-sm`
vence pela ordem da folha. Medido, o numero saia miudo ao lado do e mail. Num descendente nao ha empate.
**Vale para qualquer classe de fonte custom aplicada sobre o `Button`.**

**O video de fundo saiu junto com o formulario.** A secao era `bg-cacau` com o
`public/backgrounds/background-agendamento.mp4` sob veu de `cacau/85`, calculado contra o pixel mais
claro do arquivo, `rgb(178,159,146)`. Hoje ela e porcelana lisa e quem traz cor e a foto. O arquivo
continua em `public/`, so nao e usado em lugar nenhum: se voltar a ser, a conta do veu precisa ser
refeita, porque o texto agora e escuro sobre claro e o risco inverte de lado.

**Os primitivos `Input`, `Textarea`, `Label` e `Checkbox` foram apagados**, porque so esta secao usava.
Se um formulario voltar ao site, eles voltam do zero.

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

#### O carrossel

Os resultados vivem num carrossel na forma do **skiper47 do skiper-ui**, escolhido pelo cliente, e nao
mais num grid. **A licenca do skiper-ui pede atribuicao na versao gratuita**, e ela esta no comentario
do componente.

O `effect: coverflow` do Swiper vai com `rotate: 0` e `stretch: 0`, que sao os valores da referencia.
Com rotacao zero ele **nao gira nada**: so empurra os vizinhos no eixo Z, e a perspectiva transforma
isso em escala. Medido no centro: o cartao ativo fica em escala 1, com 443px, e sao os vizinhos que
encolhem, para 361px e 305px. **O cartao central nao aumenta, o resto e que diminui**, entao mexer em
`depth` ou `modifier` nao aumenta o destaque, so afunda mais os lados.

Duas coisas mudaram em relacao ao skiper47, e as duas por pedido: `slidesPerView` bem acima do 2.43 do
original, que era exatamente o numero que fazia aparecerem so dois e meio, e o par das pontas cortado
pela borda do container, com veu esmaecendo.

**A armadilha grande e o arraste.** A divisa e um `input[type=range]` esticado sobre o cartao inteiro, e
arrastar nela e o mesmo gesto que troca de slide. Sao tres travas, e nenhuma delas e opcional:

- **`noSwipingSelector: '.comparador-divisa'`.** Recurso do proprio Swiper: toque que comeca na divisa
  nao vira swipe.
- **Tudo que nao e a divisa fica `pointer-events-none`**: as duas fotos e as duas pilulas. Sem isso o
  alvo do ponteiro dentro do carrossel e a `<img>`, o `closest('.comparador-divisa')` do Swiper da
  falso, ele assume o gesto e chama `preventDefault`. **Sintoma medido: a divisa nao saia do lugar e o
  carrossel andava no lugar dela, enquanto o teclado continuava funcionando.** Foi o teclado que
  denunciou que o problema era de ponteiro e nao de estado.
- **O painel de legenda, ao contrario, recebe ponteiro de proposito.** Ele nao tem nada clicavel e
  passa a ser a area de arraste do carrossel. Sem ele sobrava so a fresta do vizinho: 24px de cada lado
  no celular, contra os 278x104 do painel.
- **A divisa precisa de `translateZ(0)`, e isso nao e supersticao.** O coverflow poe `perspective` no
  `.swiper` e `preserve-3d` nos slides, e **o slide ativo nao para exatamente em Z zero**: medido, ele
  carrega um residuo que cresce com o indice, 0, -0.058, -0.117, -0.175, vindo do `slidesPerView`
  fracionario. Isso e invisivel, as caixas batem no pixel, mas desregula o hit-test: em **dois dos oito
  cartoes** o `pointerdown` caia no `div.swiper-wrapper` e a divisa ficava presa em 50%, enquanto os
  outros seis funcionavam normalmente. O `translateZ(0)` nao move nada, so promove a divisa a camada
  propria. Antes 6 de 8, depois 8 de 8, com arraste de mouse e com toque.

**Cuidado ao diagnosticar bug dessa secao: setar `input.value` por script nao serve.** O `posicao` e
estado do React, entao mexer no valor pela mao nao muda o `clip-path` e a comparacao sai igual nos dois
extremos, o que parece defeito e nao e. Teste com arraste de ponteiro de verdade.

Mais tres decisoes:

- **So o cartao do meio e interativo.** Os vizinhos vao com `aria-hidden`, `tabIndex={-1}` na divisa e
  `pointer-events-none` na figure. Sem o `tabIndex` o Tab entra em slider invisivel; com o
  `pointer-events-none` o clique cai no slide e o `slideToClickedSlide` traz aquele resultado ao centro.
- **`loop` desligado.** O loop do Swiper clona slide, e aqui slide e um comparador com duas fotos e um
  `aria-label` proprio: clonar cria divisa duplicada e dobra requisicao de imagem.
- **Autoplay desligado**, como na referencia. Cartao que sai sozinho no meio do arrasto e hostil.

**Um `AnimatedContent` so, em volta do carrossel, e nunca um por cartao.** Ele nasce com
`visibility: hidden` e so aparece quando o ScrollTrigger dispara contra a janela: cartao deslocado para
fora na horizontal nunca intersecta, e ficaria invisivel para sempre.

**O CSS do Swiper e importado no `globals.css`, e nao no componente.** Importado no componente ele cai
na folha da pagina, que carrega depois da folha do layout, e vence todo empate de especificidade contra
as nossas regras. Foi assim que a linha de controles quebrou: o
`.swiper-pagination-bullets.swiper-pagination-horizontal` do Swiper e 0,2,0, o mesmo peso do nosso
seletor, e a ordem desempatava para o lado dele.

**As setas e os pontinhos ficam fora do Swiper**, numa linha propria embaixo. O `.swiper` ganha
`perspective` do coverflow, o que cria contexto de empilhamento: com os controles la dentro, o veu das
pontas passa por cima deles e nenhum `z-index` de filho alcanca de volta. A primeira tentativa usava
`mask-image` no `.swiper` e as setas saiam lavadas junto com as fotos. **Mascara de pai nao se desfaz no
filho.**

Detalhe do Swiper que custou uma investigacao: num elemento de paginacao **externo** ele carimba so as
variantes, `swiper-pagination-bullets`, `-horizontal` e `-clickable`, e **nao** a classe base
`swiper-pagination`. Amarrar CSS nela nao casa nada.

#### Caso em tratamento

Nem todo caso terminou. O checkbox `emTratamento`, na colecao Resultados, marca aquele em que a segunda
foto e do meio do tratamento, e nao do fim.

**A foto continua indo no campo `depois`, que segue obrigatorio.** O checkbox nao muda onde o arquivo
mora, so o que o site afirma sobre ele. Foi o que permitiu ligar isso sem invalidar resultado ja
cadastrado.

A afirmacao aparece em **seis lugares**, e eles precisam andar juntos, senao o cartao diz duas coisas.
Quatro no comparador:

- a pilula da direita, que le "Em tratamento" no lugar de "Depois"
- o texto alternativo de reserva da segunda foto, "durante o tratamento" no lugar de "depois do tratamento"
- o `aria-label` do slider, "Comparar antes e durante"
- o `aria-valuetext`, "X% da foto em tratamento"

E dois na grade estatica logo abaixo, que mostra os mesmos casos:

- a pilula da metade de baixo do par
- o texto alternativo de reserva daquela mesma foto

**Cuidado com o `alt` da Media, que vence o texto de reserva.** Nos dois lugares o fallback so entra
quando o arquivo nao tem `alt` proprio, e ele quase sempre tem. Se um caso for marcado como em
tratamento e o `alt` da foto ja disser "depois do tratamento", **a pilula e o texto alternativo passam a
se contradizer**. Marcou o checkbox? Revise o `alt` daquele arquivo na Media.

**A pilula em tratamento precisa ser opaca.** As duas normais usam `bg-porcelana/90`, e `text-caramelo`
sobre esse fundo translucido, com foto escura por baixo, da **3.70** e reprova. Em `bg-caramelo` cheio
com `text-porcelana` sao **4.64**, medidos no navegador. A folga ate o piso de 4.5 e de 0.14, entao
trocar o token pede refazer a conta.

Isso nao e preciosismo de rotulo: dizer "Depois" sobre uma foto de meio de tratamento e afirmar que o
caso terminou quando ele nao terminou, num site de clinica.

**A ordem de publicar importa.** O banco e o mesmo da producao e a home e ISR com `revalidate = 300`,
entao conteudo novo entra no ar sem deploy. Um caso em tratamento criado antes de a Vercel receber a
pilula sai rotulado de "Depois". Crie ele despublicado e ligue depois do deploy.

### Grades parallax, na forma do skiper30

`src/components/ui/galeria-parallax.tsx` e a reconstrucao do **skiper30 do skiper-ui**, o Oliver
parallax, escolhido pelo cliente. Livre para uso pessoal e comercial, com **atribuicao ao Skiper UI**
pedida pela licenca da versao gratuita, e ela esta no comentario do componente.

**Nao entrou dependencia nova.** O componente publicado traz framer-motion e instancia Lenis proprio.
Aqui o framer-motion ja estava no projeto e ninguem cria um segundo Lenis, porque o `SmoothScroll.tsx`
mantem a instancia global e duas brigariam pela rolagem.

**Sao dois arquivos, e a divisao importa.** O `galeria-parallax.tsx` e server component e monta as
colunas; o `grade-parallax.tsx` e `'use client'` e so move o que recebe, ja renderizado, como
`children`. Assim as fotos continuam saindo do servidor. O preco e que a marcacao das figures aparece
duas vezes na resposta, no HTML e no payload RSC: medido, **20 KB em 467 KB, 4.4%**, e comprime bem.

**Nao importe valor de um arquivo para o outro.** A contagem de colunas e declarada nos dois de
proposito. Importar `COLUNAS` do modulo `'use client'` para o server component faz o valor atravessar a
fronteira RSC como referencia de cliente em vez de numero: `Array.from({ length: COLUNAS })` virava
array vazio e a distribuicao quebrava com "Cannot read properties of undefined (reading 'push')".
Mexeu numa lista, confira a outra.

**A grade nao sabe o que ha dentro do cartao, e isso e o que a deixa servir duas secoes bem
diferentes.** Quem chama entrega o conteudo pronto e a `razao` de altura dele, que e o unico numero que
o empacotamento precisa. O que continua sendo da grade e a distribuicao, a casca da `figure` e o
movimento.

- **`GaleriaResultados`**, logo abaixo do comparador, **le a colecao `resultados`**, a mesma do
  carrossel: cada cartao e o par antes e depois com as duas fotos visiveis de uma vez, **lado a lado em
  qualquer tela**, no formato dos posts que a clinica ja publica. Ela existe porque o
  comparador exige arrastar a divisa, e quem nao arrasta ve so a foto de antes e vai embora achando
  que nao ha resultado. **Sem titulo visivel e sem ancora, a pedido do
  cliente**: ela le como continuacao da secao Resultados, que ja tem titulo e explicacao logo acima.

  **Nao ha consulta nova por causa dela**: recebe o mesmo array que o carrossel. Os mesmos casos
  aparecem duas vezes na pagina, em duas leituras, e isso e proposital.

  **As duas metades sao fixas em `aspect-[4/5]`, a mesma proporcao do comparador**, com `object-cover` e
  `enquadramento`. A proporcao ja veio da foto de `antes` de cada caso, o que dava cartoes de alturas
  diferentes; o cliente pediu cartao padronizado. Usar o mesmo valor do comparador faz as duas secoes
  mostrarem o mesmo recorte do mesmo caso, em vez de dois enquadramentos concorrentes.

  **Padronizar significa recortar, e com isso o ponto de foco passou a mandar muito mais.** Medido nos
  10 casos cadastrados: seis sao quase quadrados e mostram ~78% da largura, enquanto os dois mais altos,
  alopecia areata e risca central feminina, mostram 64% e 70% da altura. Quem decide o que sobrevive e o
  `focalPoint` do painel, entao **caso novo com enquadramento ruim se conserta la, e nao no codigo**.

  Com todos os cartoes iguais o empacotamento vira alternancia simples entre as duas colunas. Ele
  continua ali porque a **mesma grade serve o `AClinica`**, onde cada cartao e uma foto na propria
  proporcao e o equilibrio volta a fazer trabalho de verdade. O desencontro entre as colunas passou a
  vir so do degrau de partida e do parallax.

  **O fio entre as duas metades vai em `after`, e nao em `border`.** Com `box-sizing: border-box`, que e
  o padrao do Tailwind, 1px de borda come 1px da caixa: medido, a metade de baixo saia com 570px contra
  571px da de cima. O pseudo elemento desenha por cima sem ocupar espaco, sempre vertical.

  **No celular o par ja foi empilhado, e o cliente reprovou**: "geralmente as pessoas visualizam uma do
  lado da outra". Lado a lado nas duas colunas de sempre deixaria cada foto com ~84px, pequena demais
  para enxergar diferenca de densidade, entao **esta secao usa uma coluna so no celular**, pela prop
  `colunasNoCelular={1}`. Medido em 390: cartao 350x219, foto 175x219. A secao A clinica nao passa a
  prop e continua com duas.

  **Uma coluna no celular quebraria a ordem sem o `order`, e o sintoma nao e obvio.** O DOM continua com
  duas colunas, que e o que o `lg` precisa, e o empacotamento reparte os casos alternando entre elas.
  Empilhar as duas mostraria **1, 3, 5, 7, 9, 2, 4, 6, 8**, ignorando o campo `ordem`, que e como a
  clinica agrupa casos femininos e masculinos. A saida, sem segundo DOM: no celular a coluna vira
  `display: contents`, os cartoes viram filhos diretos de um flex so, e cada `figure` leva `order` com a
  posicao original. No `lg` a coluna volta a ser caixa e o `order` ali dentro ja e crescente. Conferido
  em 390, caso a caso contra `/api/resultados` ordenado por `ordem`: bate nos nove.

  Com o cartao lado a lado em qualquer tela, a `razao` e `(5 / 4) / 2` sempre.
- **`AClinica`**, no fim da pagina, le a colecao `galeria`, hoje so de fotos da clinica. Cada cartao e
  uma foto sozinha, na propria proporcao. Essa **tem** titulo e CTA, porque abre assunto novo e e o
  ultimo bloco antes do rodape.

**A colecao `galeria` ja teve um campo `categoria`**, que separava as duas. Ele saiu quando a grade de
antes e depois passou a ler `resultados`: com um destino so, a categoria virava pergunta sem resposta no
painel. Os 14 registros que existiam na categoria antiga, posts prontos de Instagram, foram apagados a
pedido do cliente; os arquivos seguem na Media.

**O `h2` em `sr-only` da GaleriaResultados nao contradiz o "sem titulo".** Uma faixa so de imagens sem
nome nenhum some do outline da pagina e chega ao leitor de tela como um monte de foto solta depois do
carrossel.

Sete coisas que sustentam a grade:

- **O cartao muda conforme a secao.** Na grade de antes e depois ele e o par montado a partir dos
  campos `antes` e `depois` de um caso; em A clinica e uma foto sozinha, na proporcao que ela tiver.
  A grade so precisa saber a `razao` de altura de cada um.
- **A distribuicao equilibra altura, e nao e rodizio.** Cada foto vai para a coluna mais curta,
  medindo por `altura / largura`. Rodizio parece equivalente e nao e: medido com 12 fotos de razao bem
  misturada, o pe das colunas variava quase 300px. **A varredura preserva a ordem do painel**, o que
  custa um pouco de equilibrio: ordenar da mais alta para a mais baixa fecharia quase todo o degrau,
  mas jogaria fora o campo `ordem`, que e o unico controle da clinica. Com foto de post, toda na mesma
  proporcao, o empate e exato de qualquer jeito.
- **Sao duas colunas no `lg`, e no celular a quantidade que a secao pedir**, pela prop
  `colunasNoCelular`, de padrao 2. As classes de cada caso ficam num mapa `LAYOUT` escrito por extenso no
  `grade-parallax.tsx`, porque o Tailwind so gera classe literal. O espacamento e `gap` na coluna.

  **Isso ja foi mais complicado, e vale saber por que nao e mais.** Com tres colunas no `lg` e duas no
  celular, tres nao dividia por dois: numa grade de duas, a terceira coluna caia sozinha na segunda
  linha, com metade da tela vazia ao lado por toda a altura dela. A saida era `columns-2` no container
  com **`display: contents` em cada coluna**, para as figures virarem filhas diretas de um container
  multi-coluna que rebalanceia sozinho. Com duas colunas o motivo acabou e o remendo saiu, junto com o
  `break-inside-avoid` das figures, que so servia as colunas de CSS.

  Se um dia voltar a ser um numero impar de colunas, o problema volta com ele, e a saida acima e a que
  funcionou. Duas que **nao** funcionam: montar um DOM para telefone e outro para desktop dobra a
  requisicao de imagem, e usar tres colunas tambem no celular deixa cada foto com ~108px em 390px.
- **Uma medicao de rolagem para a grade inteira, nunca uma por coluna.** Era um `useScroll` por coluna,
  e era dai que vinha o engasgo que o cliente reclamou. Medido, o diagnostico obvio estava errado: nao
  era taxa de quadros, que ja era 60fps com zero quedas nos dois casos, nem atraso, que era zero
  quadros. Era **ruido de amostragem**, com cada coluna lendo a rolagem num momento ligeiramente
  diferente do quadro, entao elas tremiam **umas em relacao as outras**, que e o que mais aparece numa
  grade lado a lado.

  O numero que mostra isso e o erro residual entre a rolagem e o transform aplicado: **3.31px antes,
  0.01px depois**, contra 1.9px que a coluna anda por quadro. Antes o tremor era maior que o proprio
  movimento.

  **`useSpring` foi tentado e descartado**, e vale saber por que: ele derrubava o residuo para 1.28px,
  mas so passava a acompanhar bem a rolagem **dez quadros atras**, 166ms, com a coluna nadando atras da
  pagina. Trocava um defeito por outro pior. Resolvida a causa, nao havia o que suavizar.

  **Como medir isso:** grave `scrollY` e o translateY real da coluna a cada quadro, durante uma rolagem
  por evento de roda de verdade, e ajuste o transform contra a rolagem deslocada de k quadros. O k de
  menor erro e a defasagem, e o erro naquele k e o tremor. Taxa de quadros sozinha **nao** enxerga esse
  defeito.
- **`will-change: transform` nas colunas**, e nenhum transform abaixo do `lg`. O corte do celular e por
  `matchMedia` em JS, e nao so por classe, para a conta nem rodar la.
- **O curso vai de 4% a 10% da altura da coluna, e e curto de proposito.** Como a secao tem respiro
  vertical proprio, o deslocamento acontece dentro dele e nao abre fresta no topo nem no pe. Aumentar
  o curso pede aumentar o respiro junto.
- **Video e descartado na entrada.** A colecao aponta para a Media, que aceita os dois, e o otimizador
  do Next responde 400, "The requested resource isn't a valid image", para um `.mp4`. Sem o filtro uma
  foto trocada por video deixaria um buraco na grade sem erro nenhum na tela.

**Nao ha `enquadramento` aqui, e isso e proposital.** O ponto de foco existe para imagem que usa
`object-cover`, onde a caixa recorta de novo. Na grade a foto entra inteira, na propria proporcao, entao
nao ha recorte para o foco resolver e um `object-position` ali seria letra morta.

As duas secoes **somem inteiras enquanto nao houver conteudo publicado**, a de resultados sem caso
cadastrado e a da clinica sem foto. E o que permite subir o codigo antes do conteudo: elas entram no ar
sozinhas quando a clinica cadastrar, sem deploy novo.

### Design

Paleta de quatro cores fechada com o cliente, em marrom e bege. Use sempre os tokens de
`tailwind.config.ts`, nunca cor solta.

| Token | Hex | Papel |
| --- | --- | --- |
| `porcelana` | `#FFFFFF` | fundo da pagina e dos cartoes |
| `areia` | `#DDCCC2` | blocos que quebram o ritmo, como metricas e depoimentos |
| `cacau` | `#775642` | cor principal, botao padrao e secao de agendamento |
| `caramelo` | `#966B54` | detalhe, eyebrow e estrela, sobre fundo claro |
| `cacau-escuro` | `#5C4133` | derivada, estado pressionado do botao e acento sobre areia |
| `caramelo-claro` | `#E0B48C` | derivada, acento legivel sobre fundo escuro |
| `tinta` e `tinta-suave` | `#2E211A` e `#4A362B` | texto principal e secundario |
| `neutro` | `#78685E` | texto terciario e placeholder |

O container trava em **1440px**, com 2rem de respiro lateral a partir dessa largura, o que da 1376px de
conteudo util.

**Duas secoes ficam fora do `container`: o hero e a de contato.** As duas por precisarem que a midia
encoste na borda da janela. A de contato resolve o alinhamento do texto por um recuo calculado, descrito
na secao Sobre e contato; o hero resolve por `container` interno, como segue.

O painel do hero vai de borda a borda da janela, a pedido do cliente. O que fica **sobre** a foto, a chamada e o carrossel, tem um `container` proprio por dentro,
entao continua alinhado com a coluna do resto da pagina em vez de encostar na borda: conferido em 1920,
1440, 1280 e 1024, com a chamada caindo no mesmo pixel do conteudo das outras secoes. O titulo e o
carrossel levam `px-5` proprio abaixo do `lg`, que e onde saem do posicionamento absoluto.

**O respiro extra fica na chave `2xl` do `container.padding`, e nao em `lg`.** O Tailwind casa cada
chave contra `theme('container.screens', theme('screens'))`, e aqui o `container.screens` tem uma
entrada so, entao qualquer outra chave e descartada em silencio. Ficou tempo com um `lg: '2rem'`
escrito que nunca chegou ao CSS. Trazer o `lg` para o `screens` nao conserta: o valor ali e ao mesmo
tempo o `min-width` da media query e o `max-width` do container, entao ele limitaria a pagina a 1024px
entre 1024 e 1440.

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
- `components/ui/animated-content.tsx` e o AnimatedContent do React Bits, com gsap, usado nos cards das
  secoes. Ele nasce com `visibility: hidden` e so aparece quando o gsap roda, portanto **nunca use
  acima da dobra**: seguraria o LCP e deixaria a tela em branco em hidratacao lenta.
- `components/ui/camada-parallax.tsx` e o parallax de rolagem, com framer-motion, na tecnica do
  skiper30. Hoje so a foto dentro do cartao de tratamento usa. Diferente dos outros dois, ele nao e
  entrada: fica ligado ao progresso da rolagem o tempo todo.

O framer-motion entrou so por causa do parallax, entao o projeto carrega dois motores de animacao.
Antes de usar ele em coisa nova, veja se o gsap com `scrub`, que ja estava aqui, nao resolve.

O **Swiper** e um terceiro, e move so o carrossel de resultados. Ele entrou por escolha do cliente, que
pediu fidelidade ao skiper47. A alternativa levantada era reconstruir com o framer-motion que ja estava
aqui, ja que o coverflow com `rotate: 0` e so escala mais deslocamento. Nao use ele em coisa nova sem
refazer essa conta.

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
derruba os mais antigos passando de uns 16, com teto menor no celular. **Hoje sao quatro CTAs com ele**:
os dois do header, o da tricoscopia e o do fechamento. Eram cinco: o quinto era o botao de envio do
formulario, que saiu junto com ele. Se sair espalhando pelos botoes, alguns simplesmente apagam sem
aviso e sem erro no console.

Os CTAs que entraram com as melhorias do time de trafego seguiram criterios diferentes de proposito: o
do fechamento leva `especular`, porque e o ultimo ponto de conversao da pagina, e os do Sobre e da secao
de contato nao levam, porque a forma deles e de link e nao de botao cheio. Somar `especular` em todo
botao novo e como o teto se estoura sem ninguem perceber.

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
- **O cartao aceita video, e nao so foto.** O campo `imagem` do tratamento
  aponta para a Media, que aceita os dois, e por muito tempo o cartao desenhava
  com `<Image>` sem olhar o tipo: video ali nao aparecia. Quem resolve os dois
  casos hoje e o `MidiaRotativa`, o mesmo do painel do hero, com um item so.
  Video sai pela CDN com `f_mp4,q_auto,w_800`: medido no `.mov` da queda
  capilar, **17,6 MB pela rota do Payload contra 933 KB pela CDN**.
  **A transformacao fixa `f_mp4` de proposito**, porque `f_auto` devolve o
  `.mov` ainda como `video/quicktime`. O Chrome toca assim mesmo, por
  reconhecer o H.264 por dentro, mas o peso e identico nos dois e o `f_mp4`
  declara o tipo certo em vez de depender do sniffing.
- **O video do cartao so carrega quando o cartao aparece.** E a prop
  `soQuandoVisivel` do `MidiaRotativa`, e ela segura o **`src`**, nao so o
  `play()`. Medido: so com `autoplay` desligado e `preload="metadata"`, com a
  pagina parada no topo, o Chrome ja tinha 11,7s do primeiro video em buffer.
  Sem `src` ele nao pede byte nenhum, e o `poster` segura o lugar.
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

### Painel em portugues

O `payload.config.ts` traz `i18n: { fallbackLanguage: 'pt', supportedLanguages: { pt } }`, com o `pt`
vindo do proprio `@payloadcms/translations`.

Duas notas:

- **O pacote precisou ser declarado no `package.json`**, fixado em 3.88.0, igual ao Payload. Ele ja
  existia como dependencia transitiva, mas o pnpm e estrito e o import direto nao resolvia. Mesmo caso
  do `react-image-crop`, fixado em 10.1.8 porque e a versao que o `@payloadcms/ui` usa.
- **A traducao e a do Payload, e nao cobre tudo.** Na tela de login, por exemplo, "Senha" e "Esqueceu a
  senha?" saem traduzidos e "Email" e "Login" continuam em ingles. Nao ha o que fazer do nosso lado sem
  manter traducao propria.

### Rodape

O rodape traz o mapa da unidade num iframe do Google e um botao **Definir rota**.

- **O endereco do embed vem do painel**, no campo `mapaEmbed` de cada unidade. Ele aceita tanto a URL
  quanto o codigo inteiro do iframe, porque e isso que o Google entrega no botao de incorporar, e o
  `enderecoDoMapa` de `src/lib/utils.ts` reduz os dois ao endereco.
- **Esse helper valida o dominio de proposito.** Ele so devolve endereco `https` em `google.com` sob
  `/maps/embed`. Sem essa trava, um campo de texto do painel viraria porta para incorporar qualquer
  coisa de fora dentro do rodape do site.
- **A rota vai pelo nome da clinica mais o endereco, nao por coordenada.** Assim ela continua certa se a
  clinica mudar de endereco sem ninguem lembrar de atualizar uma latitude. Cuidado para nao passar o
  nome da **unidade**: aqui ele e o bairro, e o destino sairia "Artur Alvim, R. Maria Eugenia Celso".
- **O `loading="lazy"` do iframe nao e detalhe.** Ele e conteudo de terceiro no pe da pagina, entao a
  maioria das visitas nunca chega a carregar. Sem isso, todas pagariam o custo.

**Ponto em aberto, de privacidade.** O embed do Google Maps e terceiro e grava cookie, e hoje ele carrega
sem passar pelo banner de consentimento. Como fica no pe e e `lazy`, o alcance e pequeno, mas se a
clinica quiser rigor de LGPD o caminho e trocar por um cartao que so carrega o mapa apos o aceite.

### Acessibilidade

Foco visivel global, link de pular navegacao, `prefers-reduced-motion` respeitado inclusive desligando o
Lenis, alt obrigatorio em toda midia do painel, label associado a cada campo e erro anunciado por leitor
de tela.

### Conteudo

Todo texto e original, escrito sobre as palavras chave de tricologia clinica. Nao aproveite copy de outros
sites do segmento, porque conteudo duplicado derruba o proprio SEO alem do risco autoral.

**A consulta e cobrada.** O site ja prometeu avaliacao gratuita e nao promete mais: a primeira pergunta
do FAQ hoje responde que nao, explicando que a consulta e atendimento clinico, com exame e diagnostico,
e nao visita comercial. O valor nao aparece escrito, para nao brigar com a pergunta "Quanto custa o
tratamento?", que diz que a clinica nao trabalha com tabela fechada. Se alguem reescrever essa area,
confira antes se nao voltou promessa de gratuidade em outro lugar.

**O vocabulario e "consulta tricologica", nao "avaliacao".** Vale para o CTA, para o texto da secao de
contato, para o rotulo do motivo na colecao Leads e para as respostas do FAQ.

**Cuidado com o homonimo.** "Avaliacao" tambem significa review do Google, e nesse sentido ela fica:
"Avaliacoes reais de pacientes no Google" no hero, "Avaliacoes verificadas no Google" nos depoimentos e
a metrica "Avaliacoes no Google". Trocar por consulta ali vira erro de sentido.

**O rotulo do motivo muda, o `valor` nao.** O `valor` esta gravado em cada lead ja cadastrado, entao
mexer nele invalida registro antigo. `src/lib/motivos.ts` e hoje a **unica** copia da lista: ela era
repetida no `z.enum` da rota e no select do formulario, e as duas sumiram junto com ele. Quem consome
sao a colecao Leads e o email de aviso.

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
- **Seed**: com o `pnpm dev` no ar, acesse `/api/dev/seed`. O conteudo vive em `src/lib/seed.ts`.

  **Pare antes de rodar. Ele deixou de ser inofensivo.** O seed atualiza o que encontra, mas **cria o
  que nao encontra**, e a clinica passou a apagar conteudo pelo painel. Hoje o seed tem 10 tratamentos e
  o banco tem 4: rodar agora ressuscitaria os seis que ela apagou. Antes de executar, compare
  `/api/tratamentos`, `/api/faq` e `/api/depoimentos` com os arrays do seed e resolva a diferenca, seja
  aposentando no seed o que saiu, seja aceitando o que vai voltar.

  Para aplicar so um pedaco, escreva uma rota de desenvolvimento dirigida aquela colecao, use e apague.
  Foi assim que a troca do FAQ entrou sem encostar nos tratamentos.

  **A resposta do FAQ respeita quebra de linha.** O campo e um `textarea` e o
  `AccordionContent` leva `whitespace-pre-line`, entao resposta em etapas, uma por linha, sai em linhas
  na tela. E o caso de "O que e avaliado na consulta?". Nao ha marcador de lista: o campo e texto puro,
  sem rich text.
- **O FAQ casa por `pergunta`.** Mudar o texto de uma pergunta faz o seed criar item novo e deixar o
  velho, e o site passa a mostrar as duas respostas, uma contradizendo a outra. Quando mudar o texto,
  ponha o antigo em `perguntasAntigas`, que e apagado antes da escrita. Mesmo padrao de
  `slugsTratamentosAntigos` e `nomesPlaceholderAntigos`.
- **Nome de arquivo com acento passa.** Testado ponta a ponta com `calvaço.mp4`: o Payload grava o
  acento, a URL sai percent encoded e o Cloudinary guarda o `public_id` com o acento, servindo pela CDN
  normalmente, inclusive com transformacao.
- **Upload**: com o `pnpm dev` no ar, `/api/dev/subir-midia?arquivo=videos/hero.mp4&alt=Descricao&hero=1`
  sobe um arquivo de `public/` para a Media e, com `hero=1`, ja troca o painel do hero por ele. Pela
  Local API o arquivo vai como buffer, em processo, entao um video de 25 MB nao esbarra em limite de
  corpo de requisicao. Repetir nao duplica: reaproveita o documento e corrige o `alt` se mudou.
- **Import map, na pratica**: com o `pnpm dev` no ar, acesse `/api/dev/gerar-importmap`. O dev **nao**
  regerou sozinho quando registramos o primeiro componente custom, entao a rota existe para nao depender
  disso. Ela chama a mesma `generateImportMap` que o CLI usaria.
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
