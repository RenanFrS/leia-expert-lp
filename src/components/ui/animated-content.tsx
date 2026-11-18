'use client'

import React, { useRef, useEffect } from 'react'

/**
 * Componente do React Bits, mantido perto do original para facilitar
 * atualizacao futura. Quatro coisas mudaram em relacao ao codigo publicado:
 *
 * 1. `use client`, porque o original nao traz e aqui o App Router exige.
 * 2. Respeita `prefers-reduced-motion`. O original anima sempre, e o projeto
 *    promete o contrario no README.
 * 3. Saiu a busca por `snap-main-container`, que e um elemento do site do React
 *    Bits. Sem ela o scroller cai em `window`, que e o certo aqui.
 * 4. **O GSAP e o ScrollTrigger vem por `import()` dentro do efeito**, e nao no
 *    topo do arquivo. Com o import estatico os dois entravam no pacote da home,
 *    na frente da hidratacao, para animar secoes que estao todas bem abaixo da
 *    dobra. Assim chegam num pedaco proprio, logo depois.
 *
 * Ele nasce com `visibility: hidden` e so aparece quando o GSAP roda, entao use
 * apenas abaixo da dobra. Acima dela isso seguraria o LCP e deixaria a tela em
 * branco enquanto a hidratacao nao termina. O hero entra por CSS.
 */

type Gsap = (typeof import('gsap'))['gsap']

interface AnimatedContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  container?: Element | string | null
  distance?: number
  direction?: 'vertical' | 'horizontal'
  reverse?: boolean
  duration?: number
  ease?: string
  initialOpacity?: number
  animateOpacity?: boolean
  scale?: number
  threshold?: number
  delay?: number
  onComplete?: () => void
}

export const AnimatedContent: React.FC<AnimatedContentProps> = ({
  children,
  container,
  distance = 60,
  direction = 'vertical',
  reverse = false,
  duration = 0.7,
  ease = 'power3.out',
  initialOpacity = 0,
  animateOpacity = true,
  scale = 0.96,
  threshold = 0.1,
  delay = 0,
  onComplete,
  className = '',
  ...props
}) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Quem pediu menos movimento ve o conteudo direto, sem deslocamento e sem
    // baixar o GSAP. O elemento nasce so com o `invisible`, sem transformacao
    // nenhuma, entao devolver a visibilidade basta.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.visibility = 'visible'
      return
    }

    let scrollerTarget: Element | string | null = container || null
    if (typeof scrollerTarget === 'string') {
      scrollerTarget = document.querySelector(scrollerTarget)
    }

    const axis = direction === 'horizontal' ? 'x' : 'y'
    const offset = reverse ? -distance : distance
    const startPct = (1 - threshold) * 100

    // A limpeza pode chegar antes de o `import()` resolver, no Strict Mode ou ao
    // sair da pagina. Sem o `cancelado` o gatilho seria criado sobre um elemento
    // que ja saiu da arvore.
    let cancelado = false
    let tl: ReturnType<Gsap['timeline']> | undefined
    let st: { kill: () => void } | undefined

    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelado) return
      gsap.registerPlugin(ScrollTrigger)

      gsap.set(el, {
        [axis]: offset,
        scale,
        opacity: animateOpacity ? initialOpacity : 1,
        visibility: 'visible',
      })

      const linha = gsap.timeline({
        paused: true,
        delay,
        onComplete: () => onComplete?.(),
      })
      tl = linha

      linha.to(el, { [axis]: 0, scale: 1, opacity: 1, duration, ease })

      st = ScrollTrigger.create({
        trigger: el,
        scroller: scrollerTarget || window,
        start: `top ${startPct}%`,
        once: true,
        onEnter: () => linha.play(),
      })
    })

    return () => {
      cancelado = true
      st?.kill()
      tl?.kill()
    }
  }, [
    container,
    distance,
    direction,
    reverse,
    duration,
    ease,
    initialOpacity,
    animateOpacity,
    scale,
    threshold,
    delay,
    onComplete,
  ])

  return (
    <div ref={ref} className={`invisible ${className}`} {...props}>
      {children}
    </div>
  )
}
