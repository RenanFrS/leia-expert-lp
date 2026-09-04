import { Star } from 'lucide-react'

import { Revelar } from '@/components/Revelar'
import { CarrosselTratamentos, type ItemCarrossel } from '@/components/ui/carrossel-tratamentos'
import { MidiaRotativa } from '@/components/ui/midia-rotativa'
import { urlDeEntrega } from '@/lib/cloudinary-url'
import { posterDeVideo } from '@/lib/poster-video'
import { cn, midia } from '@/lib/utils'
import type { Clinica } from '@/payload-types'

type Props = {
  nome: string
  chamada?: string | null
  tratamentos: ItemCarrossel[]
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
 * ficam a chamada com as estrelas, o CTA e o carrossel de tratamentos.
 *
 * Duas coisas sustentam a montagem e nao podem mudar sem quebrar o desenho:
 *
 * 1. **O titulo vem primeiro no DOM.** No `lg` ele sai do fluxo e vira o
 *    recorte, mas continua sendo o primeiro elemento lido. Se ele descer para
 *    depois do painel, o leitor de tela anuncia a chamada e o carrossel antes
 *    do `h1` da pagina.
 * 2. **O painel e o unico filho em fluxo no `lg`.** E por isso que a altura da
 *    caixa e a dele, e por isso que o CTA e o carrossel, absolutos, se alinham
 *    ao painel sem precisar estar dentro dele. Assim cada um e montado uma vez
 *    so, em vez de uma copia para telefone e outra para desktop.
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

export function Hero({ nome, chamada, tratamentos, painel, intervalo }: Props) {
  const texto =
    chamada ||
    // Reserva usada so quando a `chamada` do painel esta vazia. Mesma redacao da
    // chamada gravada no banco.
    //
    // Ela abre pela dor, e nao pelo nome da especialidade, a pedido do time de
    // trafego: quem chega pelo anuncio busca "queda de cabelo" e "calvicie", nao
    // "tricologia clinica". Duas travas continuam valendo aqui: nao afirma
    // diagnostico, que e ato privativo de medico e a Leia e tricologista, e nao
    // promete gratuidade, porque a consulta e cobrada.
    'Queda de cabelo, calvície e alopecia têm causa. A tricoscopia mostra qual é a sua e define o tratamento certo para o seu caso. Homens e mulheres, com acompanhamento do começo ao fim.'

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
  */
  const tratamentosResolvidos = tratamentos.map((item) => {
    const arquivo = midia(item.imagem)
    if (!arquivo?.filename || !arquivo.mimeType?.startsWith('video/')) return item

    const poster = posterDeVideo(urlDeEntrega(arquivo.filename), 640)
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
          {/* Desce da borda de cima ate assentar, que e o sentido em que a
                forma se le. O curso e curto de proposito: o motivo esta no
                `Revelar`. */}
          <Revelar direcao="cima">
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
                    que o descendente da fonte, e sem ele a cedilha de "começa"
                    vaza para fora do bloco, em cima da midia. */}
              <span className="block">Cabelo saudável</span>
              <span className="block">começa na raiz.</span>

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
          </Revelar>
        </div>

        {/* O painel e o LCP da pagina. */}
        {/*
            No `lg` o painel preenche o que sobra da janela depois do header:
            `100vh` menos os 96px dele. O pe do painel cai exatamente na dobra.

            O `min-h` existe para janela baixa: sem ele, num notebook de 700px o
            painel encolheria a ponto de a chamada e o carrossel, que sao
            absolutos no pe, se espremerem um sobre o outro.
          */}
        <div className="relative h-[520px] overflow-hidden bg-areia sm:h-[600px] lg:h-[calc(100vh-6rem)] lg:min-h-[640px]">
          <MidiaRotativa
            itens={painelResolvido}
            intervalo={intervalo}
            prioridade
            sizes="(max-width: 1200px) 100vw, 1200px"
          />

          {/*
              Veu de baixo para cima. Sobre foto qualquer, texto solto nao tem
              contraste garantido, e e ele que mantem a chamada em porcelana
              legivel seja qual for a imagem que a clinica subir.

              **A altura e fixa, e nao `h-2/3` do painel.** Em proporcao o veu
              acompanhava a altura do painel enquanto a chamada fica ancorada no
              pe dele: no celular, com painel curto, a chamada subia para a parte
              fraca do gradiente. Medido naquele estado, o pixel mais claro atras
              do texto era `rgb(244,243,243)` e o contraste caia para **1.11**.

              **O veu cresceu de 22rem para 28/30rem porque a chamada cresceu.**
              Ela e ancorada no pe do painel, entao fonte maior e texto mais longo
              empurram o topo do bloco para a parte fraca do gradiente, que e o
              mesmo defeito descrito acima por outro caminho.

              Medido no navegador, escondendo o texto por folha injetada para
              sobrar so o fundo composto, contra o pixel mais claro da faixa e nao
              contra a media dela:

                 390   rgb(103,94,88)   6.33 porcelana   5.12 porcelana/85
                 768   rgb(95,85,81)    7.23             5.80
                1024   rgb(101,91,87)   6.59             5.30
                1440   rgb(101,91,86)   6.60             5.31
                1920   rgb(102,91,87)   6.56             5.28

              **Os 28rem do celular sao piso, nao folga.** Com 24rem ali o topo do
              texto subia para 52% do gradiente e a linha das estrelas, em
              `porcelana/85`, dava **4.47**, logo abaixo do piso de 4.5. Em 28rem
              ele volta para 44,6% e a linha vai a 5.12. Quem reprova primeiro e
              sempre a linha das estrelas, nunca o texto cheio.

              **E o celular e o pior caso**, porque o painel ali e curto e o mesmo
              bloco de texto ocupa uma fracao maior dele. Mexeu no veu, no tamanho
              da fonte ou no tamanho do texto? Refaca a medida em 390 primeiro.
            */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-[28rem] bg-gradient-to-t from-tinta/90 via-tinta/70 to-transparent lg:h-[30rem]"
          />

          {/* Chamada e estrelas, dentro da imagem. O `container` de dentro e
                que traz o texto de volta para a coluna da pagina, agora que o
                painel nao esta mais dentro de um. */}
          <div className="absolute inset-x-0 bottom-6 lg:bottom-10">
            <div className="container">
              {/* A coluna abriu de `max-w-md` para `max-w-xl` junto com a
                  fonte. Em 448px o texto novo passava de seis linhas e a pilha
                  encostava no carrossel, que e absoluto no mesmo pe do painel. */}
              <Revelar className="lg:max-w-xl">
                {/* Corpo maior a pedido do time de trafego: no tamanho antigo a
                    frase lia como legenda de foto e nao como a promessa da
                    pagina. Crescer aqui obriga a refazer o veu logo acima. */}
                <p className="text-lg text-porcelana sm:text-2xl sm:leading-snug">{texto}</p>

                <div className="mt-4 flex items-center gap-2">
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
              </Revelar>
            </div>
          </div>
        </div>

        {/* Carrossel: em fluxo no telefone, sobre a imagem no lg. O
              `container` de dentro alinha ele a coluna da pagina em vez de
              encostar na borda da janela. */}
        <div className="px-5 lg:absolute lg:inset-x-0 lg:bottom-10 lg:z-10 lg:px-0">
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
