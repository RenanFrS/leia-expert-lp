'use client'

import { useEffect, useRef } from 'react'
import { registrarContatoWhatsapp } from '@/lib/analytics'
import { whatsappLink } from '@/lib/utils'
import animacaoWhatsapp from './whatsapp-flutuante.json'

/**
 * **Este e o unico lugar que abre o WhatsApp sem passar pelo `BotaoWhatsapp`**,
 * porque a casca dele e uma animacao Lottie e nao um `Button`.
 *
 * Ele monta o `whatsappLink` na mao, mas **precisa chamar o
 * `registrarContatoWhatsapp`**, e nao o `pushEvento` cru. Quando o clique de
 * WhatsApp virou a conversao do site, sair pelo `pushEvento` deixaria o botao
 * flutuante contando no dataLayer e **nao** disparando conversao no Ads. Como
 * ele e a maior porta de entrada no celular, isso escondia justamente o volume
 * que a campanha precisa enxergar.
 */
export function WhatsappFlutuante({ numero, mensagem }: { numero: string; mensagem?: string | null }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let cancelado = false
    let animacao: import('lottie-web').AnimationItem | undefined

    // Import dinamico: lottie-web mexe no DOM direto e nao pode entrar na
    // renderizacao do servidor. Em desenvolvimento o efeito roda duas vezes
    // (Strict Mode) e a segunda limpeza pode chegar antes desta promise
    // resolver; sem o `cancelado`, isso deixava duas animacoes rodando no
    // mesmo lugar ao mesmo tempo, e era o que travava o botao.
    import('lottie-web').then(({ default: lottie }) => {
      if (cancelado) return
      animacao = lottie.loadAnimation({
        container,
        renderer: 'svg',
        loop: true,
        autoplay: !reduzirMovimento,
        animationData: animacaoWhatsapp,
      })
    })

    return () => {
      cancelado = true
      animacao?.destroy()
    }
  }, [])

  return (
    <a
      href={whatsappLink(numero, mensagem || undefined)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => registrarContatoWhatsapp('botao-flutuante')}
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-40 h-16 w-16 drop-shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caramelo focus-visible:ring-offset-2 focus-visible:rounded-2xl"
    >
      <div ref={containerRef} className="h-full w-full" />
    </a>
  )
}
