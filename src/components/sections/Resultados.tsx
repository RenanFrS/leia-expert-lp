'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { A11y, EffectCoverflow, Keyboard, Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
// O CSS do Swiper e importado no `globals.css`, e nao aqui. Motivo no
// comentario do bloco `.resultados-carrossel` daquele arquivo: importado no
// componente ele cai numa folha que carrega **depois** da nossa e vence os
// empates de especificidade, o que ja tinha quebrado a linha dos controles.

import { Revelar } from '@/components/Revelar'
import { AnimatedContent } from '@/components/ui/animated-content'
import { cn, enquadramento, midia } from '@/lib/utils'
import type { Resultado } from '@/payload-types'

/** Diametro da alca, em pixel. Precisa casar com o `h-14 w-14` do thumb. */
const ALCA = 56

/**
 * Comparador antes e depois, elemento de assinatura do projeto.
 *
 * **A divisa e o proprio `input[type=range]`**, esticado sobre a foto inteira,
 * e nao uma div com `onPointerMove`. Foi assim que a versao anterior errava em
 * tres frentes de uma vez:
 *
 * 1. sem `setPointerCapture`, o arrasto morria assim que o ponteiro saia da
 *    caixa, entao nao dava para chegar em 0% nem em 100%
 * 2. sem `touch-action`, arrastar no celular rolava a pagina em vez de mover a
 *    divisa
 * 3. o range ficava como uma barra visivel por cima da foto, e ainda roubava o
 *    arrasto de quem pegava perto da base
 *
 * O elemento nativo resolve os tres de graca e ainda traz teclado com setas,
 * Home e End, e o papel de slider para leitor de tela. Nao troque por div.
 *
 * **Tudo que nao e a divisa fica `pointer-events-none`**: as duas fotos e as
 * duas pilulas. Sem isso o alvo do ponteiro dentro do carrossel e a `<img>`, e
 * nao o `input`, entao o `noSwipingSelector` do Swiper nao casa, ele assume que
 * o gesto e de trocar de slide e chama `preventDefault`. Resultado medido: a
 * divisa nao saia do lugar e o carrossel andava no lugar dela. O teclado
 * continuava funcionando, que foi o que denunciou o problema como sendo de
 * ponteiro.
 *
 * **`ativo` diz se este cartao e o do meio do carrossel.** So ele pode receber
 * arrasto, clique e foco: nos vizinhos a divisa e um segundo `input[type=range]`
 * que o teclado alcancaria sem ninguem estar vendo, e o arrasto dela roubaria o
 * gesto que deveria trazer aquele cartao para o centro.
 */
function Comparador({ resultado, ativo }: { resultado: Resultado; ativo: boolean }) {
  const [posicao, setPosicao] = useState(50)

  const antes = midia(resultado.antes)
  const depois = midia(resultado.depois)

  // Caso ainda em andamento: a segunda foto e do meio do tratamento, e nao do
  // fim. A mesma afirmacao aparece em quatro lugares, e eles mudam juntos: a
  // pilula da direita, o texto alternativo de reserva, o `aria-label` e o
  // `aria-valuetext`. Deixar um para tras faz o cartao dizer duas coisas.
  const emTratamento = Boolean(resultado.emTratamento)
  const momentoDepois = emTratamento ? 'durante o tratamento' : 'depois do tratamento'

  // O thumb nativo nunca encosta na borda: ele para a meia alca de distancia.
  // A linha segue a mesma conta, senao as duas se separam nos extremos.
  const linha = `calc(${ALCA / 2}px + (100% - ${ALCA}px) * ${posicao / 100})`

  return (
    <figure
      // Fora do centro o cartao vira alvo de clique do proprio slide: sem os
      // `pointer-events`, o clique morreria na foto e o `slideToClickedSlide`
      // do Swiper nunca traria este resultado para o meio.
      aria-hidden={!ativo}
      className={cn(
        'relative overflow-hidden rounded-2xl bg-areia',
        !ativo && 'pointer-events-none',
      )}
    >
      <div className="relative aspect-[4/5]">
        {antes?.url && (
          <Image
            src={antes.url}
            alt={antes.alt || `${resultado.titulo}, antes do tratamento`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="pointer-events-none object-cover"
            style={enquadramento(antes)}
          />
        )}

        {depois?.url && (
          <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${posicao}%)` }}>
            <Image
              src={depois.url}
              alt={depois.alt || `${resultado.titulo}, ${momentoDepois}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="pointer-events-none object-cover"
              style={enquadramento(depois)}
            />
          </div>
        )}

        <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-porcelana/90 px-3 py-1.5 text-sm text-tinta backdrop-blur-sm">
          Antes
        </span>
        {/*
          A pilula da direita troca de rotulo e de cor no caso em andamento,
          para nao afirmar "Depois" sobre uma foto de meio de tratamento.

          **Ela precisa ser opaca.** As duas pilulas normais usam
          `bg-porcelana/90`, e `text-caramelo` sobre esse fundo translucido, com
          foto escura por baixo, da 3.70:1 e reprova. Em `bg-caramelo` cheio com
          `text-porcelana` sao 4.64:1, acima do piso de 4.5. Trocou o token,
          refaca a conta: a folga ali e de 0.14.
        */}
        <span
          className={cn(
            'pointer-events-none absolute right-4 top-4 rounded-full px-3 py-1.5 text-sm backdrop-blur-sm',
            emTratamento ? 'bg-caramelo text-porcelana' : 'bg-porcelana/90 text-tinta',
          )}
        >
          {emTratamento ? 'Em tratamento' : 'Depois'}
        </span>

        <input
          type="range"
          min={0}
          max={100}
          value={posicao}
          onChange={(evento) => setPosicao(Number(evento.target.value))}
          aria-label={`Comparar antes e ${emTratamento ? 'durante' : 'depois'}: ${resultado.titulo}`}
          aria-valuetext={`${Math.round(posicao)}% da foto ${emTratamento ? 'em tratamento' : 'de depois'}`}
          // So `aria-hidden` na figure nao tira do foco. Sem isso o Tab entra
          // na divisa de um cartao que a pessoa nao esta vendo.
          tabIndex={ativo ? undefined : -1}
          className="comparador-divisa"
        />

        {/*
          Linha e alca. Ficam **depois** do input no DOM para o seletor de foco
          alcancar elas, e sao `pointer-events-none` para nao roubar o arrasto.
        */}
        <div
          aria-hidden
          data-alca
          className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-porcelana"
          style={{ left: linha }}
        >
          <span className="comparador-alca absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-porcelana shadow-[0_6px_20px_-6px_rgba(46,33,26,0.65)]">
            <ChevronLeft className="h-4 w-4 text-cacau" />
            <ChevronRight className="-ml-1 h-4 w-4 text-cacau" />
          </span>
        </div>

        {/*
          Painel de baixo. O veu escuro nao e enfeite: o texto cai sobre foto de
          paciente, que muda a cada resultado, e so ele garante contraste do
          porcelana seja qual for a imagem.
        */}
        {/*
          O painel de baixo **recebe ponteiro de proposito**, ao contrario das
          fotos e das pilulas.

          A divisa cobre o cartao inteiro, entao dentro do carrossel sobrava so
          a fresta do vizinho para arrastar de um resultado para outro: medi
          24px de cada lado no celular, abaixo de qualquer alvo de toque
          aceitavel. Como este painel nao tem nada clicavel, ele vira a area de
          arraste do carrossel sem tirar nada da divisa.
        */}
        <figcaption className="absolute inset-x-3 bottom-3 rounded-xl bg-tinta/55 px-4 py-4 text-center backdrop-blur-md">
          <p className="font-display text-sm text-porcelana/85">
            Resultados reais acompanhados na prática
          </p>

          <p className="mt-2 text-base text-porcelana">{resultado.titulo}</p>

          {/* O painel mostrava tambem o nome do tratamento vinculado, com um
              icone de brilho. Saiu a pedido do cliente. O campo `tratamento`
              continua na colecao: ele serve para organizar a biblioteca no
              painel, so nao aparece mais no cartao.

              A guarda e ternaria, e nao `&&`: com `meses` em zero o `&&`
              imprimiria um "0" solto dentro do painel. */}
          {resultado.meses ? (
            <p className="mt-3 flex items-center justify-center gap-2 text-sm text-porcelana">
              <CalendarDays aria-hidden className="h-4 w-4 text-caramelo-claro" />
              {resultado.meses} {resultado.meses === 1 ? 'mês' : 'meses'} de tratamento
            </p>
          ) : null}
        </figcaption>
      </div>
    </figure>
  )
}

/**
 * O carrossel na forma do **skiper47 do skiper-ui**, escolhido pelo cliente.
 *
 * Livre para uso pessoal e comercial, com **atribuicao ao Skiper UI** pedida
 * pela licenca da versao gratuita. Autor: @gurvinder-singh02, https://gxuri.me.
 *
 * O que veio igual da referencia: `effect: coverflow` com `rotate: 0` e
 * `stretch: 0`, `depth: 100`, `modifier: 2.5` e `centeredSlides`. Como a
 * rotacao e zero, o coverflow aqui nao gira nada: ele so empurra os vizinhos no
 * eixo Z, e a perspectiva transforma isso em escala. E dai que sai o cartao do
 * meio maior.
 *
 * Tres coisas mudaram, e cada uma tem motivo:
 *
 * 1. **`slidesPerView` bem acima do 2.43 do original**, que era exatamente o
 *    numero que fazia aparecerem so dois e meio. Aqui a fila continua ate a
 *    borda do container, com o par das pontas cortado e esmaecendo.
 * 2. **`noSwipingSelector` na divisa do comparador.** Cada cartao e um
 *    `input[type=range]` esticado sobre a foto, e arrastar nele e o mesmo gesto
 *    que troca de slide. Sem essa trava os dois brigam e um deles para de
 *    funcionar, principalmente no toque.
 * 3. **`loop` desligado.** O loop do Swiper clona slide no DOM, e aqui slide e
 *    um comparador com duas fotos e um slider com `aria-label` proprio: clonar
 *    cria divisa duplicada e dobra requisicao de imagem.
 *
 * Autoplay tambem fica de fora, como na referencia. Cartao que sai sozinho no
 * meio do arrasto da divisa e hostil.
 */
export function Resultados({ resultados }: { resultados: Resultado[] }) {
  /*
    **O carrossel abre no terceiro caso, e nao no primeiro, a pedido do
    cliente.** Com `centeredSlides`, abrir no primeiro deixa todo o lado
    esquerdo vazio, porque nao ha slide antes dele para ocupar a fila. No
    terceiro ha dois de cada lado, e a fila fica cheia da borda a borda no
    desktop. Com menos de tres casos ele abre no ultimo que existir.

    O `ativo` nasce com o mesmo valor do `initialSlide`, e isso nao e
    redundancia: o `onSlideChange` nao dispara na montagem, entao sem isso o
    cartao interativo seria o primeiro enquanto o do centro e o terceiro.
  */
  const inicial = Math.min(2, Math.max(resultados.length - 1, 0))
  const [ativo, setAtivo] = useState(inicial)
  const [reduzido, setReduzido] = useState(false)

  /*
    Setas e pontinhos vivem **fora** do Swiper, e nao e preferencia de arrumacao.

    O esmaecimento das pontas e uma camada por cima dos slides, e o `.swiper`
    ganha `perspective` do coverflow, o que cria contexto de empilhamento
    proprio. Com os controles la dentro, qualquer veu desenhado pelo pai passa
    por cima deles, e nenhum `z-index` de filho alcanca de volta. Tentei antes
    com `mask-image` no `.swiper` e as setas sairam lavadas junto com as fotos.

    Do lado de fora eles ainda param de cobrir a foto, que e o que a referencia
    faz por cima do cartao.
  */
  const [anterior, setAnterior] = useState<HTMLButtonElement | null>(null)
  const [proximo, setProximo] = useState<HTMLButtonElement | null>(null)
  const [pontos, setPontos] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    const consulta = window.matchMedia('(prefers-reduced-motion: reduce)')
    const aoMudar = () => setReduzido(consulta.matches)
    aoMudar()
    consulta.addEventListener('change', aoMudar)
    return () => consulta.removeEventListener('change', aoMudar)
  }, [])

  if (!resultados.length) return null

  return (
    <section id="resultados" className="py-10 md:py-14">
      <div className="container">
        <Revelar>
          <p className="text-eyebrow font-mono uppercase text-caramelo">Resultados</p>
          <h2 className="mt-4 max-w-2xl font-display text-display-lg text-tinta">
            Compare você mesmo.
          </h2>
          <p className="mt-4 max-w-lg text-tinta-suave">
            Fotos de pacientes reais, publicadas com autorização. O tempo de resposta varia conforme
            a causa da queda e a adesão ao protocolo.
          </p>
        </Revelar>

        {/*
          Um `AnimatedContent` so, em volta do carrossel inteiro, e nunca um por
          cartao. Ele nasce com `visibility: hidden` e so aparece quando o
          ScrollTrigger dispara contra a **janela**: cartao deslocado para fora
          na horizontal nunca intersecta, entao ficaria invisivel para sempre.

          O `scale` vai em 1 pelo mesmo motivo da secao de tratamentos, e aqui
          ainda por um segundo: ancestral escalado durante a animacao bagunca a
          medida que o Swiper tira dos slides.
        */}
        <AnimatedContent className="mt-14" distance={60} scale={1}>
          <div className="resultados-carrossel">
            {/* O `relative` embrulha so o carrossel, e nao a linha de controles
                logo abaixo: o veu e `inset-y-0` e desceria por cima dela. */}
            <div className="relative">
              {/* O veu das pontas. Sao camadas e nao `mask-image` pelo motivo
                  explicado la em cima, no bloco dos controles. */}
              <div aria-hidden className="resultados-veu resultados-veu-esquerda" />
              <div aria-hidden className="resultados-veu resultados-veu-direita" />

              <Swiper
                modules={[EffectCoverflow, Pagination, Navigation, Keyboard, A11y]}
                effect="coverflow"
                centeredSlides
                grabCursor
                loop={false}
                slidesPerView={1.15}
                spaceBetween={16}
                breakpoints={{
                  640: { slidesPerView: 1.6, spaceBetween: 24 },
                  1024: { slidesPerView: 2.2, spaceBetween: 32 },
                  1280: { slidesPerView: 2.9, spaceBetween: 40 },
                }}
                coverflowEffect={{
                  rotate: 0,
                  stretch: 0,
                  depth: 100,
                  modifier: 2.5,
                  slideShadows: false,
                }}
                // Clique num cartao lateral traz ele para o meio. So funciona
                // porque a `figure` fora do centro e `pointer-events-none`.
                slideToClickedSlide
                initialSlide={inicial}
                // A trava do arrasto, descrita no bloco acima.
                noSwipingSelector=".comparador-divisa"
                keyboard={{ enabled: true }}
                pagination={{ el: pontos, clickable: true }}
                navigation={{ prevEl: anterior, nextEl: proximo }}
                speed={reduzido ? 0 : 600}
                onSlideChange={(swiper) => setAtivo(swiper.activeIndex)}
                // O modulo A11y nao esta na referencia. Entrou porque o site e em
                // portugues e sem ele o leitor de tela anuncia tudo em ingles.
                a11y={{
                  prevSlideMessage: 'Resultado anterior',
                  nextSlideMessage: 'Próximo resultado',
                  paginationBulletMessage: 'Ir para o resultado {{index}}',
                  slideLabelMessage: 'Resultado {{index}} de {{slidesLength}}',
                  containerMessage: 'Resultados de antes e depois',
                }}
                className="resultados-swiper"
              >
                {resultados.map((resultado, indice) => (
                  <SwiperSlide key={resultado.id}>
                    <Comparador resultado={resultado} ativo={indice === ativo} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            <div className="mt-8 flex items-center justify-center gap-5">
              <button
                ref={setAnterior}
                type="button"
                aria-label="Resultado anterior"
                className="resultados-seta"
              >
                <ChevronLeft aria-hidden className="h-5 w-5" />
              </button>

              {/* O Swiper escreve os pontinhos aqui dentro. */}
              <div ref={setPontos} className="resultados-pontos" />

              <button
                ref={setProximo}
                type="button"
                aria-label="Próximo resultado"
                className="resultados-seta"
              >
                <ChevronRight aria-hidden className="h-5 w-5" />
              </button>
            </div>
          </div>
        </AnimatedContent>
      </div>
    </section>
  )
}
