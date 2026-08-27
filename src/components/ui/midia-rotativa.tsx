'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { cn, enquadramento, midia } from '@/lib/utils'
import { posterDeVideo } from '@/lib/poster-video'
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
  sizes: string
  className?: string
}

const ehVideo = (item: Media) => item.mimeType?.startsWith('video/') ?? false

/**
 * Video do hero. Fica em componente proprio porque `autoplay` so vale no
 * carregamento: para respeitar quem pede menos movimento e preciso pausar
 * depois, pela referencia.
 *
 * O `poster` nao e detalhe. O `prioridade` do MidiaRotativa so tem efeito no
 * ramo do `<Image>`, entao com video em primeiro o painel pintaria so a chapa de
 * areia ate o primeiro quadro decodificar. O poster e um quadro do proprio
 * arquivo, servido como imagem, e e ele que segura o lugar nesse intervalo.
 *
 * **`soQuandoVisivel` existe para quem esta abaixo da dobra.** No hero o video
 * comeca junto com a pagina, e e o certo, porque ele ja esta na tela. Num cartao
 * de tratamento nao: sem trava o navegador baixa e toca os arquivos antes de
 * alguem chegar la.
 *
 * **Nao basta segurar o `play()`, tem que segurar o `src`.** Medido: so com o
 * `autoplay` desligado e `preload="metadata"`, com a pagina parada no topo, o
 * Chrome ja tinha 11,7s do primeiro video em buffer. Sem `src` ele nao pede
 * nada, e o `poster` sozinho segura o lugar.
 *
 * Uma vez carregado o `src` fica. Tirar de volta ao sair da tela faria o
 * navegador baixar tudo de novo na proxima rolagem.
 */
function Video({
  src,
  poster,
  reduzido,
  soQuandoVisivel = false,
}: {
  src: string
  poster?: string
  reduzido: boolean
  soQuandoVisivel?: boolean
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const [visivel, setVisivel] = useState(!soQuandoVisivel)
  const [carregado, setCarregado] = useState(!soQuandoVisivel)

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

  useEffect(() => {
    if (visivel) setCarregado(true)
  }, [visivel])

  useEffect(() => {
    const video = ref.current
    if (!video || !carregado) return
    if (reduzido || !visivel) video.pause()
    else void video.play().catch(() => {})
  }, [visivel, carregado, reduzido])

  return (
    <video
      ref={ref}
      // Sem `src` o navegador nao pede byte nenhum. Quem liga e o observador.
      src={carregado ? src : undefined}
      poster={poster}
      // Com a trava ligada quem manda tocar e o efeito acima, depois que o
      // `src` entrou.
      autoPlay={!soQuandoVisivel}
      muted
      loop
      playsInline
      preload="metadata"
      className="h-full w-full object-cover"
    />
  )
}

/**
 * Pilha de fotos e videos que troca em esmaecimento. Cada bloco do hero e um
 * deles, e o painel aceita quantos arquivos a clinica quiser.
 *
 * Sob `prefers-reduced-motion` a troca nao acontece: fica so o primeiro arquivo,
 * e o video pausa.
 */
export function MidiaRotativa({
  itens,
  intervalo,
  prioridade = false,
  soQuandoVisivel = false,
  sizes,
  className,
}: Props) {
  const lista = (itens || [])
    .map((entrada) => midia(entrada.arquivo))
    .filter((item): item is Media => Boolean(item?.url))

  const [atual, setAtual] = useState(0)
  const [reduzido, setReduzido] = useState(false)

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
    <div className={cn('relative h-full w-full', className)}>
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
            <Video
              src={item.url!}
              poster={posterDeVideo(item.url) ?? undefined}
              reduzido={reduzido}
              soQuandoVisivel={soQuandoVisivel}
            />
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
