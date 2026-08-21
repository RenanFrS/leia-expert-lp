'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { cn, midia } from '@/lib/utils'
import type { Media } from '@/payload-types'

type Entrada = { arquivo: (number | null) | Media; id?: string | null }

type Props = {
  itens?: Entrada[] | null
  /** Segundos que cada arquivo fica na tela. So conta com dois ou mais. */
  intervalo?: number | null
  /** Liga no primeiro arquivo do painel do hero, que e o LCP da pagina. */
  prioridade?: boolean
  sizes: string
  className?: string
}

const ehVideo = (item: Media) => item.mimeType?.startsWith('video/') ?? false

/**
 * Video do hero. Fica em componente proprio porque `autoplay` so vale no
 * carregamento: para respeitar quem pede menos movimento e preciso pausar
 * depois, pela referencia.
 */
function Video({ src, reduzido }: { src: string; reduzido: boolean }) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    if (reduzido) video.pause()
    else void video.play().catch(() => {})
  }, [reduzido])

  return (
    <video
      ref={ref}
      src={src}
      autoPlay
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
export function MidiaRotativa({ itens, intervalo, prioridade = false, sizes, className }: Props) {
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
            <Video src={item.url!} reduzido={reduzido} />
          ) : (
            <Image
              src={item.url!}
              alt={item.alt || ''}
              fill
              sizes={sizes}
              priority={prioridade && indice === 0}
              className="object-cover"
            />
          )}
        </div>
      ))}
    </div>
  )
}
