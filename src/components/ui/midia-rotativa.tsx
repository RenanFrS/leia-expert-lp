'use client'

import { useEffect, useRef, useState } from 'react'
import Image, { getImageProps } from 'next/image'
import { cn, enquadramento, midia } from '@/lib/utils'
import { tocarComReserva } from '@/lib/autoplay'
import { RECORTE_RETRATO, quadroDeVideo, variacaoDeVideo } from '@/lib/poster-video'
import type { Media } from '@/payload-types'

type Entrada = { arquivo: (number | null) | Media; id?: string | null }

type Props = {
  itens?: Entrada[] | null
  /** Segundos que cada arquivo fica na tela. So conta com dois ou mais. */
  intervalo?: number | null
  /** Liga no primeiro arquivo do painel do hero, que e o LCP da pagina. */
  prioridade?: boolean
  /**
   * Segura o video ate o bloco entrar na tela. Ligue abaixo da dobra: sem isso
   * o navegador baixa e toca antes de alguem chegar la.
   */
  soQuandoVisivel?: boolean
  /**
   * No celular, quadro e video saem num recorte retrato 3:4 do centro, em vez do
   * 16:9 inteiro. E do hero, onde o painel do telefone e mais alto que largo.
   */
  retratoNoCelular?: boolean
  sizes: string
  className?: string
}

const ehVideo = (item: Media) => item.mimeType?.startsWith('video/') ?? false

/** A mesma faixa do `sm` do Tailwind: abaixo de 640px o painel do hero e retrato. */
const CELULAR = '(max-width: 639px)'

/** 720x960 cobre o painel de 390px em tela de 2x, que e o telefone comum. */
const VIDEO_RETRATO = `f_auto,q_auto,${RECORTE_RETRATO},w_720`

/**
 * O quadro parado do video, como imagem de verdade, por baixo dele.
 *
 * **Ja foi o atributo `poster`, e saiu por tres motivos medidos no PageSpeed.**
 * O `poster` nao tem carregamento preguicoso, entao os cartoes de tratamento, bem
 * abaixo da dobra, baixavam ~1 MB de quadro na abertura. Ele tambem nao aceita
 * `srcset` nem prioridade: o do hero saia em JPEG de 1600px para um painel de
 * 390px e entrava na fila atras dos videos. Como imagem, o quadro do hero vira
 * o LCP, com `fetchpriority="high"` e o tamanho certo para cada tela, e o dos
 * cartoes so carrega quando chega perto.
 *
 * **No hero ha direcao de arte.** Ate 639px o quadro e o recorte retrato do
 * centro, que e o que o painel mostra ali; acima, o 16:9 inteiro. Por isso o
 * `<picture>` montado com `getImageProps`, e nao o `<Image>`: o `<Image>` so
 * troca de largura, nao de recorte.
 *
 * O `alt` e vazio de proposito: o video e atmosfera e nao carrega informacao, o
 * mesmo criterio do `VideoFundo`.
 */
function Quadro({
  url,
  sizes,
  prioridade,
  retratoNoCelular,
}: {
  url: string
  sizes: string
  prioridade: boolean
  retratoNoCelular: boolean
}) {
  const largo = quadroDeVideo(url)
  const retrato = quadroDeVideo(url, RECORTE_RETRATO)
  if (!largo) return null

  if (!retratoNoCelular || !retrato) {
    return <Image src={largo} alt="" fill sizes={sizes} priority={prioridade} className="object-cover" />
  }

  // O `getImageProps` desta versao do Next nao deriva o `fetchPriority` do
  // `priority`: so tira o `loading="lazy"`. A prioridade alta vai explicita.
  const comum = {
    alt: '',
    fill: true,
    sizes,
    priority: prioridade,
    fetchPriority: prioridade ? 'high' : undefined,
  } as const
  const {
    props: { srcSet: srcSetRetrato },
  } = getImageProps({ ...comum, src: retrato })
  const { props } = getImageProps({ ...comum, src: largo })

  return (
    <picture>
      <source media={CELULAR} srcSet={srcSetRetrato} sizes={sizes} />
      {/* eslint-disable-next-line @next/next/no-img-element -- `<picture>` com direcao de arte, montado pelo `getImageProps` */}
      <img {...props} alt="" className="object-cover" />
    </picture>
  )
}

/**
 * O video em si, por cima do quadro. Fica em componente proprio porque tocar e
 * pausar e pela referencia: e assim que ele respeita quem pede menos movimento
 * e, nos cartoes, para quando sai da tela.
 *
 * **Nenhum video sai com `src` no HTML.** Medido: com `src` e `autoplay` no
 * servidor, o hero e os fundos de video somavam 7,8 MB baixados na abertura, e o
 * do hero entrava na fila junto do proprio quadro que e o LCP. Sem `src` o
 * navegador nao pede byte nenhum. Quem libera e uma de duas travas:
 *
 * - **No hero, o `load` da pagina.** O quadro ja esta na tela e e ele o LCP;
 *   o video so precisa chegar depois, para nao disputar banda com o que pinta
 *   primeiro. A entrega e escolhida nesse instante, pela largura da tela.
 * - **Nos cartoes, a chegada na tela** (`soQuandoVisivel`). Sem trava o
 *   navegador baixa e toca os arquivos antes de alguem chegar la. Medido, so
 *   com `autoplay` desligado e `preload="metadata"`, com a pagina parada no topo,
 *   o Chrome ja tinha 11,7s do primeiro video em buffer.
 *
 * O video nasce transparente e aparece por esmaecimento no primeiro `playing`,
 * entao o quadro segura o lugar ate haver imagem em movimento de verdade. Sob
 * `prefers-reduced-motion` o `src` nem entra: fica o quadro, que e o desfecho
 * certo, e sem baixar o arquivo.
 *
 * Uma vez carregado o `src` fica. Tirar de volta ao sair da tela faria o
 * navegador baixar tudo de novo na proxima rolagem.
 */
function Video({
  src,
  srcCelular,
  reduzido,
  soQuandoVisivel,
}: {
  src: string
  srcCelular?: string | null
  reduzido: boolean
  soQuandoVisivel: boolean
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const [visivel, setVisivel] = useState(!soQuandoVisivel)
  const [paginaCarregada, setPaginaCarregada] = useState(false)
  const [fonte, setFonte] = useState<string>()
  const [tocando, setTocando] = useState(false)

  useEffect(() => {
    if (soQuandoVisivel) return
    if (document.readyState === 'complete') {
      setPaginaCarregada(true)
      return
    }
    const aoCarregar = () => setPaginaCarregada(true)
    window.addEventListener('load', aoCarregar, { once: true })
    return () => window.removeEventListener('load', aoCarregar)
  }, [soQuandoVisivel])

  useEffect(() => {
    if (!soQuandoVisivel) return
    const video = ref.current
    if (!video) return

    const observador = new IntersectionObserver(
      ([entrada]) => setVisivel(entrada.isIntersecting),
      { threshold: 0.2 },
    )

    observador.observe(video)
    return () => observador.disconnect()
  }, [soQuandoVisivel])

  const liberado = soQuandoVisivel ? visivel : paginaCarregada

  useEffect(() => {
    if (fonte || !liberado || reduzido) return
    const noCelular = Boolean(srcCelular) && window.matchMedia(CELULAR).matches
    setFonte(noCelular && srcCelular ? srcCelular : src)
  }, [fonte, liberado, reduzido, src, srcCelular])

  // O `tocarComReserva` cobre o iPhone em Modo de Pouca Energia, que recusa o
  // `play()` sem gesto: o video comeca no primeiro toque da pessoa na pagina.
  // Ate la ele segue transparente, e o quadro continua na tela.
  useEffect(() => {
    const video = ref.current
    if (!video || !fonte) return
    if (reduzido || !visivel) {
      video.pause()
      return
    }
    return tocarComReserva(video)
  }, [fonte, visivel, reduzido])

  return (
    <video
      ref={ref}
      src={fonte}
      muted
      loop
      playsInline
      preload="metadata"
      tabIndex={-1}
      onPlaying={() => setTocando(true)}
      className={cn(
        'absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-suave motion-reduce:transition-none',
        tocando ? 'opacity-100' : 'opacity-0',
      )}
    />
  )
}

/**
 * Pilha de fotos e videos que troca em esmaecimento. Cada bloco do hero e um
 * deles, e o painel aceita quantos arquivos a clinica quiser.
 *
 * Sob `prefers-reduced-motion` a troca nao acontece: fica so o primeiro arquivo,
 * e o video fica no quadro parado.
 */
export function MidiaRotativa({
  itens,
  intervalo,
  prioridade = false,
  soQuandoVisivel = false,
  retratoNoCelular = false,
  sizes,
  className,
}: Props) {
  const lista = (itens || [])
    .map((entrada) => midia(entrada.arquivo))
    .filter((item): item is Media => Boolean(item?.url))

  const [atual, setAtual] = useState(0)
  const [reduzido, setReduzido] = useState(false)
  const caixa = useRef<HTMLDivElement>(null)
  // Com `soQuandoVisivel`, o quadro do video tambem espera: so entra a 400px da
  // tela. O `loading="lazy"` sozinho nao segurava, porque o Chrome pede imagem
  // preguicosa a ate 1250px da tela, e o primeiro cartao de tratamento fica a
  // menos que isso do pe do hero no celular: os quadros entravam na abertura,
  // junto do LCP.
  const [perto, setPerto] = useState(!soQuandoVisivel)

  useEffect(() => {
    if (perto) return
    const alvo = caixa.current
    if (!alvo) return
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) setPerto(true)
      },
      { rootMargin: '400px 0px' },
    )
    observador.observe(alvo)
    return () => observador.disconnect()
  }, [perto])

  useEffect(() => {
    const consulta = window.matchMedia('(prefers-reduced-motion: reduce)')
    const aoMudar = () => setReduzido(consulta.matches)
    aoMudar()
    consulta.addEventListener('change', aoMudar)
    return () => consulta.removeEventListener('change', aoMudar)
  }, [])

  useEffect(() => {
    if (lista.length < 2 || reduzido) return
    const segundos = Math.min(Math.max(intervalo || 5, 2), 30)
    const relogio = setInterval(() => setAtual((posicao) => (posicao + 1) % lista.length), segundos * 1000)
    return () => clearInterval(relogio)
  }, [lista.length, intervalo, reduzido])

  // Sem arquivo o bloco vira uma chapa de areia, do mesmo jeito que os cards de
  // tratamento, para a pagina nao desmontar antes de a clinica subir a midia.
  if (!lista.length) return <div className={cn('h-full w-full bg-areia', className)} aria-hidden />

  return (
    <div ref={caixa} className={cn('relative h-full w-full', className)}>
      {lista.map((item, indice) => (
        <div
          key={item.id}
          aria-hidden={indice !== atual}
          className={cn(
            'absolute inset-0 transition-opacity duration-1000 ease-suave motion-reduce:transition-none',
            indice === atual ? 'opacity-100' : 'opacity-0',
          )}
        >
          {ehVideo(item) ? (
            <>
              {perto && (
                <Quadro
                  url={item.url!}
                  sizes={sizes}
                  prioridade={prioridade && indice === 0}
                  retratoNoCelular={retratoNoCelular}
                />
              )}
              <Video
                src={item.url!}
                srcCelular={retratoNoCelular ? variacaoDeVideo(item.url, VIDEO_RETRATO) : null}
                reduzido={reduzido}
                soQuandoVisivel={soQuandoVisivel}
              />
            </>
          ) : (
            <Image
              src={item.url!}
              alt={item.alt || ''}
              fill
              sizes={sizes}
              priority={prioridade && indice === 0}
              className="object-cover"
              style={enquadramento(item)}
            />
          )}
        </div>
      ))}
    </div>
  )
}
