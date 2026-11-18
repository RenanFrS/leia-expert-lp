'use client'

import { useEffect, useRef, useState } from 'react'
import { tocarComReserva } from '@/lib/autoplay'
import { cn } from '@/lib/utils'

/**
 * Video de fundo de secao. Ele nao carrega informacao nenhuma, e so atmosfera,
 * entao fica `aria-hidden` e fora do foco.
 *
 * Tres coisas que ele resolve e que um `<video>` solto nao resolveria:
 *
 * 1. **O veu.** Texto sobre video nao tem contraste garantido, porque o quadro
 *    muda o tempo todo e quem escolhe o arquivo nao mede cor. O veu e uma chapa
 *    da cor da propria secao por cima do video, e e ele que segura a legibilidade
 *    no quadro mais claro do arquivo. Mexeu no video, refaz a conta do contraste
 *    contra o pixel mais claro dele, nao contra a media. O recorte do celular e
 *    um pedaco do mesmo quadro, entao nao cria pixel mais extremo que o do
 *    arquivo inteiro e a conta continua valendo.
 * 2. **`prefers-reduced-motion`.** Quem toca e o `play()`, pela referencia, e
 *    para quem pede menos movimento ele nunca e chamado: o `src` entra, o
 *    primeiro quadro aparece e o video fica parado como uma foto, que e o
 *    desfecho certo. No `midia-rotativa.tsx` o `src` nem entra, porque ali o
 *    quadro ja e imagem; aqui nao ha imagem por baixo.
 * 3. **So perto da tela.** As duas secoes com video ficam bem abaixo da dobra, e
 *    com `src` e `autoplay` no HTML o navegador baixava os dois arquivos na
 *    abertura: medido no PageSpeed, 4,8 MB disputando banda com o hero. Agora o
 *    `src` so entra quando a caixa chega a 300px da tela, e o video pausa quando
 *    sai, em vez de seguir decodificando para ninguem.
 *
 * O video nasce transparente e aparece por esmaecimento quando o primeiro quadro
 * chega. Ate la, e se o arquivo falhar, fica a cor de fundo da secao, que e a
 * mesma do veu.
 *
 * A secao que recebe ele precisa de `relative isolate`. O `isolate` nao e
 * enfeite: sem o contexto de empilhamento proprio, a camada em `-z-10` cai atras
 * do fundo de um ancestral e o video simplesmente nao aparece.
 */

type Props = {
  src: string
  /**
   * Entrega para tela abaixo de 640px. A secao no celular e alta e estreita, e
   * com `object-cover` o 16:9 de 1600px tinha as laterais cortadas e baixadas a
   * toa. Sem ela o celular recebe a mesma do desktop.
   */
  srcCelular?: string | null
  /** Chapa que cai sobre o video. Use a cor da propria secao. */
  veu?: string
  className?: string
}

/** A mesma faixa do `sm` do Tailwind, igual ao `midia-rotativa.tsx`. */
const CELULAR = '(max-width: 639px)'

export function VideoFundo({ src, srcCelular, veu = 'bg-cacau/85', className }: Props) {
  const ref = useRef<HTMLVideoElement>(null)
  const [reduzido, setReduzido] = useState(false)
  const [perto, setPerto] = useState(false)
  const [fonte, setFonte] = useState<string>()
  const [pronto, setPronto] = useState(false)

  useEffect(() => {
    const consulta = window.matchMedia('(prefers-reduced-motion: reduce)')
    const aoMudar = () => setReduzido(consulta.matches)
    aoMudar()
    consulta.addEventListener('change', aoMudar)
    return () => consulta.removeEventListener('change', aoMudar)
  }, [])

  // A folga de 300px da tempo de o primeiro quadro chegar antes de a secao
  // aparecer, sem trazer o arquivo para a abertura da pagina.
  useEffect(() => {
    const video = ref.current
    if (!video) return
    const observador = new IntersectionObserver(([entrada]) => setPerto(entrada.isIntersecting), {
      rootMargin: '300px 0px',
    })
    observador.observe(video)
    return () => observador.disconnect()
  }, [])

  // A entrega e escolhida uma vez so, quando a secao chega perto. Uma vez dentro
  // o `src` fica: tirar de volta faria o navegador baixar tudo de novo.
  useEffect(() => {
    if (fonte || !perto) return
    const noCelular = Boolean(srcCelular) && window.matchMedia(CELULAR).matches
    setFonte(noCelular && srcCelular ? srcCelular : src)
  }, [fonte, perto, src, srcCelular])

  // O `tocarComReserva` cobre o iPhone em Modo de Pouca Energia, que recusa o
  // `play()` sem gesto: o video comeca no primeiro toque da pessoa na pagina.
  useEffect(() => {
    const video = ref.current
    if (!video || !fonte) return
    if (reduzido || !perto) {
      video.pause()
      return
    }
    return tocarComReserva(video)
  }, [fonte, perto, reduzido])

  return (
    <div aria-hidden className={cn('absolute inset-0 -z-10 overflow-hidden', className)}>
      <video
        ref={ref}
        src={fonte}
        muted
        loop
        playsInline
        preload="metadata"
        tabIndex={-1}
        // `loadeddata`, e nao `playing`: sob menos movimento o video nao toca,
        // e o quadro parado ainda precisa aparecer.
        onLoadedData={() => setPronto(true)}
        className={cn(
          'h-full w-full object-cover transition-opacity duration-700 ease-suave motion-reduce:transition-none',
          pronto ? 'opacity-100' : 'opacity-0',
        )}
      />
      <div className={cn('absolute inset-0', veu)} />
    </div>
  )
}
