'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Video de fundo de secao. Ele nao carrega informacao nenhuma, e so atmosfera,
 * entao fica `aria-hidden` e fora do foco.
 *
 * Duas coisas que ele resolve e que um `<video>` solto nao resolveria:
 *
 * 1. **O veu.** Texto sobre video nao tem contraste garantido, porque o quadro
 *    muda o tempo todo e quem escolhe o arquivo nao mede cor. O veu e uma chapa
 *    da cor da propria secao por cima do video, e e ele que segura a legibilidade
 *    no quadro mais claro do arquivo. Mexeu no video, refaz a conta do contraste
 *    contra o pixel mais claro dele, nao contra a media.
 * 2. **`prefers-reduced-motion`.** O `autoplay` so vale no carregamento, entao
 *    respeitar quem pede menos movimento exige pausar depois, pela referencia.
 *    Pausado o video vira uma foto, que e o desfecho certo. E a mesma solucao do
 *    `midia-rotativa.tsx`.
 *
 * A secao que recebe ele precisa de `relative isolate`. O `isolate` nao e
 * enfeite: sem o contexto de empilhamento proprio, a camada em `-z-10` cai atras
 * do fundo de um ancestral e o video simplesmente nao aparece. A cor de fundo da
 * secao continua valendo como reserva enquanto o arquivo carrega, e tambem se ele
 * falhar.
 */

type Props = {
  src: string
  /** Chapa que cai sobre o video. Use a cor da propria secao. */
  veu?: string
  className?: string
}

export function VideoFundo({ src, veu = 'bg-cacau/85', className }: Props) {
  const ref = useRef<HTMLVideoElement>(null)
  const [reduzido, setReduzido] = useState(false)

  useEffect(() => {
    const consulta = window.matchMedia('(prefers-reduced-motion: reduce)')
    const aoMudar = () => setReduzido(consulta.matches)
    aoMudar()
    consulta.addEventListener('change', aoMudar)
    return () => consulta.removeEventListener('change', aoMudar)
  }, [])

  useEffect(() => {
    const video = ref.current
    if (!video) return
    if (reduzido) video.pause()
    else void video.play().catch(() => {})
  }, [reduzido])

  return (
    <div aria-hidden className={cn('absolute inset-0 -z-10 overflow-hidden', className)}>
      <video
        ref={ref}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        tabIndex={-1}
        className="h-full w-full object-cover"
      />
      <div className={cn('absolute inset-0', veu)} />
    </div>
  )
}
