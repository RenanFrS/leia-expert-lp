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
    api/dev/           seed, gerar-tipos, gerar-importmap e subir-midia, so em dev
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
    painel/            componentes do admin do Payload, nao do site
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

**Hoje quem dispara `clique_agendar` e so o botao da Tricoscopia**, com `local="tricoscopia"`. Os CTAs
que diziam "Agendar avaliacao", no header e no menu do celular, passaram a abrir o WhatsApp com o texto
"Agendar consulta tricologica", entao saem como `clique_whatsapp` com os locais `header` e
`menu-mobile`. **Isso nao contradiz o paragrafo acima**: a regra e que o evento siga o comportamento, e
esses botoes passaram a abrir conversa de verdade. Se um deles voltar a rolar para o formulario, o
evento volta junto.

**O `local="hero"` nao existe mais.** O CTA de dentro do painel foi removido a pedido do cliente. Vale
saber o efeito colateral, porque ele nao e obvio: o CTA do header e `hidden xl:inline-flex`, entao
**abaixo de 1280px nao sobra nenhum botao de agendar visivel acima da dobra**, so o do menu recolhido e
o WhatsApp flutuante. Se a agencia estranhar a queda de `clique_whatsapp`, e daqui.

Abrir o WhatsApp e sempre pelo `components/BotaoWhatsapp.tsx`, que monta o link e dispara o evento com o
local de origem. Nao monte `wa.me` na mao em componente.

O rodape ja quebrou essa regra: ele tinha um `<a>` com o `whatsappLink` montado direto, entao abria
conversa sem aparecer em relatorio nenhum. Hoje passa pelo componente, com `local="footer"`, e as
classes so tiram a casca de botao para ele ler como os links vizinhos.

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

**A altura do veu e fixa, `h-[22rem]`, e nao uma fracao do painel.** Enquanto era `h-2/3` ele
acompanhava a altura do painel, mas a chamada fica ancorada no **pe** dele: no celular, com painel
curto, ela subia para a parte fraca do gradiente. Medido naquele estado, contra uma foto de jaleco
branco, o fundo atras do texto era `rgb(244,243,243)` e o contraste caia para **1.11**, ou seja texto
branco sobre branco.

Com a altura fixa a chamada cai por volta de tinta/72 em qualquer largura. Medido depois da correcao,
escondendo o texto por folha injetada para sobrar so o fundo composto: `rgb(102,92,87)` no celular e
`rgb(102,92,88)` no desktop, os dois dando **6.49** na porcelana cheia e **5.26** no `porcelana/85` da
linha das estrelas.

Contra aquele pixel de jaleco branco o piso de 4.5 pede **tinta/60**. Mexeu no veu ou moveu a chamada?
Refaca a conta contra o pixel mais claro, nao contra a media.

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

Tres coisas medidas, nao estimadas:

- **O veu e `tinta/80`.** O pixel mais claro do arquivo e `rgb(197,194,202)`, onde porcelana sem veu
  daria 1.76 de contraste. Sob 80% a porcelana da 9.9, o `porcelana/65` do texto das etapas da 5.3 e o
  `caramelo-claro` do eyebrow e dos numeros da 5.2. **Em 70% os dois ultimos caem para 4.35 e 4.05**,
  abaixo do piso. Trocou o arquivo, refaca a conta contra o pixel mais claro do novo.
- **A transformacao e mais agressiva que a do hero**, `f_auto,q_auto:eco,w_1600` em vez de
  `f_auto,q_auto`. Sao 4,9 MB contra 7,4 MB no mesmo arquivo. Vale porque o video vive atras de um veu
  de 80% e a perda nao chega a aparecer. No hero nao valeria, porque la o video e o assunto.
- **A URL aponta direto para a CDN**, pelo `urlDeEntrega`, e nao para a rota do Payload. Mesmo motivo do
  hero: aquela rota nao transforma, nao responde a `Range` e passa os bytes pelo servidor do Next.

A secao precisa de `relative isolate`, senao a camada em `-z-10` cai atras do fundo de um ancestral e o
video some. O `bg-tinta` continua como reserva.

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

O formulario e de campo alto: `h-14` e `rounded-xl` nos campos e no select, `min-h-36` na area de texto.
Os quatro campos curtos ficam em duas colunas a partir do `sm`, e voltam a empilhar abaixo disso, onde a
coluna e estreita demais. O rotulo e frase normal, nao versalete em mono: ao lado de campo desse tamanho
a etiqueta miuda sumia.

**`Input`, `Textarea`, `Label` e `Checkbox` sao usados so por esta secao**, entao mexer neles nao respinga
em outro lugar do site. Se um segundo formulario aparecer, essa liberdade acaba.

O select leva `appearance-none` e uma seta desenhada, porque a nativa muda de desenho em cada sistema e
destoava do resto. O icone precisa de `pointer-events-none`, senao ele come o clique que deveria abrir a
lista.

O botao de envio e pilula, com icone a esquerda, e ao lado dele fica a linha que explica o que acontece
depois. Em coluna estreita essa linha desce para baixo do botao, pelo `flex-wrap`, e continua legivel.

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

A afirmacao aparece em **quatro lugares**, e eles precisam andar juntos, senao o cartao diz duas coisas:

- a pilula da direita, que le "Em tratamento" no lugar de "Depois"
- o texto alternativo de reserva da segunda foto, "durante o tratamento" no lugar de "depois do tratamento"
- o `aria-label` do slider, "Comparar antes e durante"
- o `aria-valuetext`, "X% da foto em tratamento"

**A pilula em tratamento precisa ser opaca.** As duas normais usam `bg-porcelana/90`, e `text-caramelo`
sobre esse fundo translucido, com foto escura por baixo, da **3.70** e reprova. Em `bg-caramelo` cheio
com `text-porcelana` sao **4.64**, medidos no navegador. A folga ate o piso de 4.5 e de 0.14, entao
trocar o token pede refazer a conta.

Isso nao e preciosismo de rotulo: dizer "Depois" sobre uma foto de meio de tratamento e afirmar que o
caso terminou quando ele nao terminou, num site de clinica.

**A ordem de publicar importa.** O banco e o mesmo da producao e a home e ISR com `revalidate = 300`,
entao conteudo novo entra no ar sem deploy. Um caso em tratamento criado antes de a Vercel receber a
pilula sai rotulado de "Depois". Crie ele despublicado e ligue depois do deploy.

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

O container trava em **1440px**, com 2rem de respiro lateral a partir dessa largura, o que da 1376px de
conteudo util.

**O hero e a unica secao sem `container`.** O painel dele vai de borda a borda da janela, a pedido do
cliente. O que fica **sobre** a foto, a chamada e o carrossel, tem um `container` proprio por dentro,
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
- `components/ui/animated-content.tsx` e o AnimatedContent do React Bits, com gsap, usado em card e no
  formulario. Ele nasce com `visibility: hidden` e so aparece quando o gsap roda, portanto **nunca use
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

**O vocabulario e "consulta tricologica", nao "avaliacao".** Vale para o CTA, para o titulo da secao de
agendamento, para o rotulo do motivo do formulario e para as respostas do FAQ.

**Cuidado com o homonimo.** "Avaliacao" tambem significa review do Google, e nesse sentido ela fica:
"Avaliacoes reais de pacientes no Google" no hero, "Avaliacoes verificadas no Google" nos depoimentos e
a metrica "Avaliacoes no Google". Trocar por consulta ali vira erro de sentido.

**O rotulo do motivo muda, o `valor` nao.** O `valor` vai gravado em cada lead e e o que o `z.enum` da
rota valida, entao mexer nele invalida lead ja gravado e derruba envio. A lista esta duplicada em
`src/lib/motivos.ts` e no proprio formulario, e as duas precisam andar juntas.

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
