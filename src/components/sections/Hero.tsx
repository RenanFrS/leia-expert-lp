import { ArrowUpRight, Star } from 'lucide-react'

import { BotaoWhatsapp } from '@/components/BotaoWhatsapp'
import { CarrosselTratamentos, type ItemCarrossel } from '@/components/ui/carrossel-tratamentos'
import { MidiaRotativa } from '@/components/ui/midia-rotativa'
import { urlDeEntrega } from '@/lib/cloudinary-url'
import { posterDeVideo } from '@/lib/poster-video'
import { cn, midia } from '@/lib/utils'
import type { Clinica, Tratamento } from '@/payload-types'

type Props = {
  nome: string
  chamada?: string | null
  subtitulo?: string | null
  /** Numero da clinica. Vazio, o botao de agendar do hero nao aparece. */
  whatsapp: string
  mensagemWhatsapp?: string | null
  /**
   * O que o carrossel desenha, mais o segundo do quadro parado. Esse segundo so
   * serve aqui no servidor, para montar a URL da foto, e nao segue para o
   * cliente.
   */
  tratamentos: (ItemCarrossel & Pick<Tratamento, 'quadroDoCartao'>)[]
  painel?: Clinica['heroPainel']
  intervalo?: number | null
}

/**
 * Reconstrucao do `hero12` do React Bits, que e bloco pago e nao tem codigo
 * publico. O que existe aqui foi remontado com os primitivos do projeto a
 * partir da referencia visual, nao e codigo copiado. Mesma situacao do
 * `about14` e do `contact34`.
 *
 * A silhueta e um painel de midia unico com o titulo recortado **no formato do
 * notch do iPhone**: um bloco porcelana centralizado, pendurado na borda de
 * cima, com os dois cantos de baixo arredondados e a midia passando dos lados.
 * **Nao ha mascara nem `clip-path`**: o canto invertido e o proprio
 * arredondamento do bloco porcelana visto pelo lado de fora.
 *
 * O titulo fica **fora** da imagem, que e o que define este bloco. Dentro dela
 * ficam a headline, o subtitulo, o botao de agendar, as estrelas e o carrossel
 * de tratamentos.
 *
 * Duas coisas sustentam a montagem e nao podem mudar sem quebrar o desenho:
 *
 * 1. **O titulo vem primeiro no DOM.** No `lg` ele sai do fluxo e vira o
 *    recorte, mas continua sendo o primeiro elemento lido. Se ele descer para
 *    depois do painel, o leitor de tela anuncia a chamada e o carrossel antes
 *    do `h1` da pagina.
 * 2. **O painel e o unico filho em fluxo no `lg`.** E por isso que a altura da
 *    caixa e a dele, e por isso que o carrossel, absoluto, se alinha ao painel
 *    sem precisar estar dentro dele. Assim ele e montado uma vez so, em vez de
 *    uma copia para telefone e outra para desktop.
 */
/**
 * Filete que arredonda o canto da midia onde ela encosta no notch.
 *
 * Sao dois pontos assim, um de cada lado, e em ambos a midia forma um canto de
 * 90 graus contra a borda de cima do painel. Sem o filete esse canto sai em
 * bico, porque `border-radius` nao alcanca: o vertice nasce do encontro de duas
 * caixas diferentes e nao e canto de elemento nenhum.
 *
 * O quadrado tem o tamanho do raio e o gradiente deixa transparente o disco
 * centrado num dos cantos de baixo dele, pintando o resto de porcelana. E
 * exatamente o negativo de um canto arredondado, entao o arco encosta tangente
 * nas duas bordas vizinhas e nao aparece emenda.
 *
 * **O `lado` diz de que lado do notch o filete fica**, e e ele que escolhe qual
 * canto vira o disco transparente. Errar isso deixa o filete de costas: em vez
 * de abrir a curva para a midia, ele fecha um quadrado branco sobre ela.
 *
 * **O raio acompanha o `rounded-b` do notch.** Mudou la, muda aqui.
 *
 * Cor crua no gradiente inline pelo mesmo motivo da textura do hero: `theme()`
 * nao resolve dentro de `style`. E o porcelana.
 */
function FileteCanto({ lado, className }: { lado: 'esquerda' | 'direita'; className?: string }) {
  // A esquerda do notch a midia fica embaixo e a esquerda, entao o disco
  // transparente vai no canto inferior esquerdo. A direita, o espelho disso.
  const canto = lado === 'esquerda' ? '0% 100%' : '100% 100%'

  return (
    <span
      aria-hidden
      className={cn('absolute hidden h-7 w-7 lg:block', className)}
      style={{
        background: `radial-gradient(circle at ${canto}, transparent 27.5px, #FFFFFF 28px)`,
      }}
    />
  )
}

export function Hero({
  nome,
  chamada,
  subtitulo,
  whatsapp,
  mensagemWhatsapp,
  tratamentos,
  painel,
  intervalo,
}: Props) {
  const texto =
    chamada ||
    // Reserva usada so quando a headline do painel esta vazia. Mesma redacao da
    // gravada no banco.
    //
    // **A pergunta aos sintomas voltou, e foi escolha do cliente.** Ela ja tinha
    // saido uma vez, quando o `h1` passou a ser "Queda de cabelo tem
    // tratamento.", porque as duas abrem com a mesma queixa, uma embaixo da
    // outra. Em 19/11/2026 a equipe definiu esta frase e o subtitulo abaixo, com
    // o `h1` como esta. A lista de sintomas e para a pessoa se reconhecer em um
    // deles antes de decidir ficar.
    'Queda de cabelo, falhas, fios afinando, entradas aumentando ou outro problema relacionado ao couro cabeludo?'

  const textoSubtitulo =
    subtitulo ||
    // Reserva do subtitulo, com a redacao gravada no banco. Foi escrita pela
    // equipe, em primeira pessoa, na voz da Leia: lista as queixas que a clinica
    // atende e fecha no que ela faz, ajudar a entender a causa e montar um plano
    // de tratamento, sem prometer cura nem gratuidade.
    //
    // **A palavra diagnostico aparece aqui sem ferir a trava.** O que a trava
    // proibe e dizer que a clinica faz diagnostico, ato privativo de medico, e a
    // Leia e tricologista. Aqui ele e o que a pessoa ja recebeu antes, de fora.
    'Sou tricologista, especialista em saúde capilar. Se você percebe queda de cabelo, falhas, fios mais finos, perda de volume, entradas mais aparentes ou a risca do cabelo mais larga, tem alguma alteração no couro cabeludo ou já recebeu um diagnóstico de alopecia areata, calvície (alopecia androgenética) ou qualquer outro tipo de alopecia, vou te ajudar a entender o que está acontecendo e montar um plano de tratamento personalizado para o seu caso.'

  /*
    O video do painel aponta direto para a CDN do Cloudinary, com `f_auto,q_auto`.
    Sem isso ele sairia pela URL que o Payload grava, `/api/media/file/...`, e ali
    tres coisas dao errado de uma vez: o arquivo vem sem transformacao nenhuma, o
    `staticHandler` nao responde a `Range`, entao nao ha reproducao progressiva, e
    os bytes ainda passam pelo servidor do Next em vez da CDN. Medido neste
    arquivo: 26,6 MB pela rota do Payload contra 5,1 MB pela CDN.

    Vale so para video. Imagem continua saindo pela rota do Payload, porque quem
    otimiza ela e o `next/image`, e mexer nisso mudaria a midia do site inteiro.

    Este componente e server component, entao a leitura de `CLOUDINARY_CLOUD_NAME`
    fica no servidor e a chave nao vai para o navegador.
  */
  const painelResolvido = painel?.map((item) => {
    const arquivo = midia(item.arquivo)
    if (!arquivo?.filename || !arquivo.mimeType?.startsWith('video/')) return item

    const url = urlDeEntrega(arquivo.filename)
    return url ? { ...item, arquivo: { ...arquivo, url } } : item
  })

  /*
    O cartao do carrossel mostra a midia do tratamento, e o campo aceita video.
    Quando e video, o que entra aqui e o **quadro parado**, nao o arquivo.

    Duas razoes. A primeira e que sem isso o cartao quebra: ele desenha com
    `next/image`, e o otimizador responde **400, "The requested resource isn't a
    valid image"**, para um `.mov` ou `.mp4`. A segunda e que este carrossel fica
    acima da dobra, ao lado do painel que ja e o LCP da pagina: somar mais um
    video tocando ali custaria caro para um cartao de 320px que troca sozinho a
    cada poucos segundos.

    Na secao de tratamentos, que fica bem abaixo, o video toca de verdade.

    **O quadro sai do segundo gravado em `quadroDoCartao`, e nao sempre do
    primeiro.** O cartao e 16:10 e corta o resto, e video vertical perde em cima
    e embaixo: o da alopecia areata abre no rosto da modelo, e o cartao mostrava
    so os olhos dela, sem falha nenhuma. Com o campo vazio continua o primeiro.
  */
  const tratamentosResolvidos = tratamentos.map(({ quadroDoCartao, ...item }) => {
    const arquivo = midia(item.imagem)
    if (!arquivo?.filename || !arquivo.mimeType?.startsWith('video/')) return item

    const poster = posterDeVideo(urlDeEntrega(arquivo.filename), 640, quadroDoCartao)
    return poster ? { ...item, imagem: { ...arquivo, url: poster } } : item
  })

  return (
    // O `overflow-x-clip` era por causa da entrada lateral do titulo, que nascia
    // 48px a esquerda e passava da borda da tela. Hoje a entrada e vertical e
    // isso nao acontece mais, mas ele fica: a secao continua tendo filhos
    // absolutos encostados nas bordas do painel, e o `clip` e barato. E `clip` e
    // nao `hidden` de proposito, para nao criar container de rolagem novo.
    // O `pt` acompanha a altura do header fixo, que passou a 96px quando o
    // logotipo cresceu para 56px. Com o `pt-28` de antes sobravam 16px entre a
    // barra e o titulo, e a frase encostava nela.
    // No `lg` o `pt` passa a ser exatamente a altura do header, 96px, entao o
    // painel encosta nele sem folga nenhuma. Abaixo do `lg` a folga continua,
    // porque ali quem vem primeiro e o titulo, e nao o painel.
    <section id="topo" className="overflow-x-clip pb-16 pt-28 md:pb-20 md:pt-32 lg:pt-24">
      {/*
        **O hero e o unico bloco do site sem `container`.** O painel vai de borda
        a borda, e por isso quem precisa de respiro lateral pede o seu: o titulo
        e o carrossel levam `px` proprio no telefone, e o que fica **sobre** a
        foto volta a se alinhar ao container por dentro, senao no monitor largo o
        texto encostaria na borda enquanto o resto da pagina fica centrado em
        1440.
      */}
      <div className="relative isolate flex flex-col gap-6 lg:block lg:gap-0">
        {/*
            O recorte do titulo, no formato do notch do iPhone. Primeiro no DOM,
            absoluto so no lg.

            E **um bloco unico, centralizado e pendurado na borda de cima do
            painel**: topo reto, porque ele encosta na borda, e os dois cantos de
            baixo arredondados. A midia passa dos dois lados. Antes eram dois
            blocos de larguras diferentes formando uma escada no canto esquerdo,
            e nada daquela receita vale mais aqui.

            **As duas linhas agora querem larguras parecidas**, ao contrario da
            escada, que dependia de uma linha larga e outra curta. Num bloco
            centralizado, linhas desiguais deixam o notch com um degrau invisivel
            de um lado so e ele para de parecer um recorte proposital.
          */}
        <div className="px-5 lg:absolute lg:left-1/2 lg:top-0 lg:z-10 lg:max-w-full lg:-translate-x-1/2 lg:px-0">
          {/*
              Desce da borda de cima ate assentar, que e o sentido em que a forma
              se le, no mesmo curso curto de 24px do `Revelar direcao="cima"`.

              **A entrada e CSS puro, e nao o `Revelar`.** O `Revelar` nasce em
              `opacity-0` e so revela depois da hidratacao: no celular, com o
              JavaScript da pagina inteira na frente, o titulo ficava invisivel
              por segundos e o PageSpeed contava isso. A animacao do
              `tailwindcss-animate` comeca no primeiro quadro pintado, sem esperar
              script nenhum, e para quem pede menos movimento ela nem roda.
          */}
          <div className="duration-700 ease-out animate-in fade-in slide-in-from-top-6 motion-reduce:animate-none">
            {/*
                As duas linhas vivem dentro do mesmo `h1`. Nao mova nenhuma para
                fora do heading: o titulo da pagina passaria a ser so metade da
                frase.

                **A fonte cai para `display-lg` so no `lg`**, que e onde o notch
                existe. Em `display-xl` a linha mais larga da 576px e o bloco
                passaria de 670px, quase metade do painel, largo demais para ler
                como notch. Abaixo do `lg` nao ha notch e nao ha o que apertar,
                entao ali o titulo continua em `display-xl`.

                Nao ha eyebrow aqui de proposito: ele seria uma terceira linha
                dentro do notch e engordaria o bloco justamente na altura. O
                eyebrow segue nas outras secoes.

                **O respiro lateral aperta abaixo do `xl`, e isso e conta.** O
                notch cresce em proporcao conforme a janela encolhe, porque o
                `clamp` da fonte desacelera antes do container: sao 37% do painel
                em 1440 e 41% em 1024. Com `px-12` nos dois, sobravam **12px**
                entre o notch e o CTA do canto, que e encostar. Em `px-8` a
                folga vai a 44px. Mexeu na fonte ou no CTA, refaca a medida em
                1024, que e o pior caso.
              */}
            <h1 className="relative font-display text-display-xl text-tinta lg:rounded-b-[28px] lg:bg-porcelana lg:px-8 lg:pb-7 lg:pt-1 lg:text-center lg:text-display-lg xl:px-12">
              {/* O `pb` nao e respiro: a entrelinha do display e mais apertada
                    que o descendente da fonte, e sem ele qualquer descendente da
                    segunda linha vaza do bloco para cima da midia. Foi o que a
                    cedilha do titulo antigo, "começa na raiz.", fazia. */}
              {/*
                  **O titulo nomeia a dor e responde a ela**, a pedido do
                  cliente: quem chega pelo anuncio procura a queixa, e a frase
                  diz em quatro palavras que ela tem saida. Ja foi "Cabelo
                  saudável começa na raiz.", que falava de cuidado e nao do
                  problema. "Tem tratamento" nao promete cura, so que ha o que
                  fazer.

                  **As duas linhas tem 15 caracteres cada**, como as de antes,
                  para o notch continuar simetrico. Trocou o texto, mantenha as
                  linhas parecidas e refaca a medida em 1024.
                */}
              <span className="block">Queda de cabelo</span>
              <span className="block">tem tratamento.</span>

              {/*
                  Os dois cantos onde a midia encosta no notch. Ficam presos ao
                  `h1`, e nao a uma das linhas, porque quem tem as bordas do
                  bloco e ele.

                  **O `-mr-px` e o `-ml-px` fazem o filete montar 1px sobre o
                  notch, e isso nao e folga inventada.** O bloco fica centrado
                  por `-translate-x-1/2`, entao a borda dele cai em coordenada
                  fracionaria. Filete e fundo sao brancos, mas cada um e
                  composto separadamente sobre a foto e cada um cobre so uma
                  fracao daquele pixel: medido, sobrava 22% de midia e a emenda
                  aparecia como um fio de (230,221,220) contra o branco. Como os
                  dois sao da mesma cor, sobrepor nao muda nada e mata o fio.
                */}
              <FileteCanto lado="esquerda" className="right-full top-0 -mr-px" />
              <FileteCanto lado="direita" className="left-full top-0 -ml-px" />
            </h1>
          </div>
        </div>

        {/* O painel e o LCP da pagina. */}
        {/*
            **A altura do painel e a maior de duas: o piso ou o texto.** O bloco
            da chamada fica em fluxo, empurrado para o pe pelo `justify-end`, e o
            `pt` guarda a faixa de cima, que o texto nunca invade. Texto curto
            deixa o painel no piso; texto longo faz ele crescer, em vez de passar
            do topo.

            Com altura fixa, a redacao de 19/11/2026, com o botao embaixo, nao
            cabia: em 520px no telefone o `overflow-hidden` cortaria a headline,
            e em 1366x768 o bloco subia 65px por cima do notch.

            - **Piso.** 520px no telefone e 600px no `sm`. No `lg` e o que sobra
              da janela depois do header, `100vh` menos os 96px dele, com o pe
              caindo na dobra, e nunca menos de 640px: em janela baixa, sem esse
              minimo, o carrossel, absoluto no pe, subiria ate o notch.
            - **Faixa de cima.** Abaixo do `lg` sao 160px de midia, onde o veu
              esmaece. No `lg` e a altura do notch mais 48px de folga, pela
              mesma conta da fonte do `h1`: duas linhas de `display-lg`, com
              entrelinha 1.04, mais os 32px do `pt-1` e do `pb-7`. **Mexeu no
              `h1`, mexa aqui.**
          */}
        <div className="relative flex min-h-[520px] flex-col justify-end overflow-hidden bg-areia pt-40 sm:min-h-[600px] lg:min-h-[max(640px,calc(100vh-6rem))] lg:pt-[calc(2.08*clamp(2rem,4vw,3.5rem)_+_5rem)]">
          {/*
              O `retratoNoCelular` troca, abaixo do `sm`, o quadro e o video pelo
              recorte 3:4 do centro: o painel do telefone tem 3:4 e so mostrava
              os 42% do meio do 16:9. O `sizes` e `100vw` porque o painel vai de
              borda a borda em toda largura.

              **A midia e absoluta para nao contar na altura.** Abaixo do `lg`
              quem manda na altura do painel e o texto, e no `lg` e a janela.
          */}
          <MidiaRotativa
            itens={painelResolvido}
            intervalo={intervalo}
            prioridade
            retratoNoCelular
            sizes="100vw"
            className="absolute inset-0"
          />

          {/*
              Chamada e estrelas, dentro da imagem, com o veu atras. O
              `container` de dentro e que traz o texto de volta para a coluna da
              pagina, agora que o painel nao esta mais dentro de um.
          */}
          {/* O bloco do texto fica em fluxo em toda largura, no pe do painel.
              O `lg:pb-14`, que ja foi `lg:pb-10`, e o pedido de subir o texto. O
              resto da subida vem do proprio subtitulo, que empurra a headline
              para cima. O pe do carrossel acompanha. */}
          <div className="relative pb-6 lg:pb-14">
            {/*
                Veu de baixo para cima. Sobre foto qualquer, texto solto nao tem
                contraste garantido, e e ele que mantem a chamada em porcelana
                legivel seja qual for a imagem que a clinica subir.

                **O veu mede o bloco de texto, e nao o painel.** Ele e filho do
                mesmo bloco da chamada e sobe 10rem acima dela: do pe ate o topo
                do texto o alfa vai de 90% a 75%, e so nesses 10rem de cima ele
                esmaece ate sumir. Assim o topo da chamada cai sempre em
                `tinta/75`, qualquer que seja o tamanho da fonte ou do texto.

                Ja houve tres veus de altura presa ao painel aqui, e os tres
                quebraram pelo mesmo motivo: a chamada e ancorada no pe do
                painel, entao texto maior empurra o topo dela para a parte fraca
                do gradiente. Com `h-2/3` do painel, no celular, o contraste
                chegou a **1.11**; com 22rem e a fonte antiga o topo caia em
                ~`tinta/49`; e com 30rem a serifa grande deixaria o topo perto de
                `tinta/28`.

                Contra branco puro, que e o pior caso de qualquer midia, o topo
                da chamada fica em `rgb(98,88,83)` e da 6.9 em porcelana.
            */}
            <div
              aria-hidden
              className="absolute inset-x-0 -top-40 bottom-0 bg-gradient-to-t from-tinta/90 via-tinta/75 via-[calc(100%-10rem)] to-transparent"
            />
            <div className="container relative">
              {/*
                  A coluna para antes do carrossel, que e absoluto no mesmo pe do
                  painel e tem 320px: em 1024 sobram 576px, dali para cima 768px.
              */}
              {/* Entra por CSS, como o titulo, e pelo mesmo motivo: o `Revelar`
                  segurava o texto invisivel ate a hidratacao. */}
              <div className="max-w-xl duration-700 ease-out animate-in fade-in slide-in-from-bottom-4 motion-reduce:animate-none xl:max-w-3xl">
                {/*
                    **A headline e serifa grande, a pedido do cliente**, com uma
                    referencia em que a frase sobre a foto era o maior texto da
                    tela. Ela ja foi corpo de texto, `text-lg` e `text-2xl`, e
                    lia como legenda. Fica abaixo do `h1` no desktop, para o
                    titulo continuar sendo o titulo.

                    **Ela desceu para 40px no `xl` e 36px no `lg` com a pergunta
                    de 19/11/2026**, que tem 107 caracteres. Em 48px ela dava 4
                    linhas e, com o subtitulo longo e o botao, o bloco passava
                    por cima do notch em 1366x768.
                  */}
                <p className="text-pretty font-display text-[1.75rem] leading-[1.12] text-porcelana sm:text-4xl sm:leading-[1.1] xl:text-[2.5rem]">
                  {texto}
                </p>

                {/*
                    **O subtitulo e a outra fonte de proposito**, a Instrument
                    Sans do corpo do site contra a serifa da headline: a
                    diferenca de familia e o que separa a promessa da explicacao
                    sem precisar de cor nova. Ele fica dentro do mesmo bloco do
                    veu, entao a conta do contraste continua valendo: o veu mede
                    o bloco, e o subtitulo cai abaixo do topo dele, onde o veu ja
                    passou de `tinta/75`. Contra branco puro por baixo, o pior
                    caso de qualquer midia, o `/90` do texto da **7.2** na
                    primeira linha, onde o veu esta em ~`tinta/81` em 390 e em
                    1440, e nao cairia abaixo de **6.0** nem no topo do bloco.
                  */}
                <p className="mt-4 max-w-2xl text-pretty font-sans text-[15px] leading-relaxed text-porcelana/90 sm:text-lg sm:leading-relaxed">
                  {textoSubtitulo}
                </p>

                {/*
                    **O botao voltou ao hero, agora embaixo do texto**, a pedido
                    do cliente. O de antes ficava no canto de cima do painel e
                    saiu; sem ele, abaixo de 1280px nao havia botao de agendar na
                    primeira tela, porque o do header so abre no `xl`.

                    `destaque` porque fica sobre o veu escuro, como o da
                    tricoscopia. **Sem `especular`**: cada um abre um contexto
                    WebGL, e este ficaria justo na area que o PageSpeed mede.

                    As estrelas ficam junto do botao, onde a pessoa decide: ao
                    lado dele quando cabe, embaixo quando nao.
                  */}
                <div className="mt-6 flex flex-col items-start gap-x-6 gap-y-4 sm:flex-row sm:flex-wrap sm:items-center">
                  <BotaoWhatsapp
                    numero={whatsapp}
                    mensagem={mensagemWhatsapp}
                    local="hero"
                    variant="destaque"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Agende sua consulta
                    <ArrowUpRight aria-hidden className="h-4 w-4" />
                  </BotaoWhatsapp>

                  <div className="flex items-center gap-2">
                    <div className="flex" aria-hidden>
                      {Array.from({ length: 5 }).map((_, indice) => (
                        <Star
                          key={indice}
                          className="h-4 w-4 fill-caramelo-claro text-caramelo-claro"
                        />
                      ))}
                    </div>
                    <span className="text-sm text-porcelana/85">
                      Avaliações reais de pacientes no Google
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Carrossel: em fluxo no telefone, sobre a imagem no lg. O
              `container` de dentro alinha ele a coluna da pagina em vez de
              encostar na borda da janela. */}
        <div className="px-5 lg:absolute lg:inset-x-0 lg:bottom-14 lg:z-10 lg:px-0">
          <div className="lg:container lg:flex lg:justify-end">
            <div className="lg:w-[320px]">
              <CarrosselTratamentos itens={tratamentosResolvidos} intervalo={intervalo} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
