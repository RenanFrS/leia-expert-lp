'use client'

import React, { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Componente do React Bits, mantido perto do original para facilitar
 * atualizacao futura. Tres coisas mudaram em relacao ao codigo publicado:
 *
 * 1. `use client`, porque o original nao traz e aqui o App Router exige.
 * 2. Respeita `prefers-reduced-motion`. O original anima sempre, e o projeto
 *    promete o contrario no README.
 * 3. Saiu a busca por `snap-main-container`, que e um elemento do site do React
 *    Bits. Sem ela o scroller cai em `window`, que e o certo aqui.
 *
 * Ele nasce com `visibility: hidden` e so aparece quando o GSAP roda, entao use
 * apenas abaixo da dobra. Acima dela isso seguraria o LCP e deixaria a tela em
 * branco enquanto a hidratacao nao termina. O hero continua com o `Revelar`.
 */

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

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

    // Quem pediu menos movimento ve o conteudo direto, sem deslocamento.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(el, { visibility: 'visible', opacity: 1, x: 0, y: 0, scale: 1 })
      return
    }

    let scrollerTarget: Element | string | null = container || null
    if (typeof scrollerTarget === 'string') {
      scrollerTarget = document.querySelector(scrollerTarget)
    }

    const axis = direction === 'horizontal' ? 'x' : 'y'
    const offset = reverse ? -distance : distance
    const startPct = (1 - threshold) * 100

    gsap.set(el, {
      [axis]: offset,
      scale,
      opacity: animateOpacity ? initialOpacity : 1,
      visibility: 'visible',
    })

    const tl = gsap.timeline({
      paused: true,
      delay,
      onComplete: () => onComplete?.(),
    })

    tl.to(el, { [axis]: 0, scale: 1, opacity: 1, duration, ease })

    const st = ScrollTrigger.create({
      trigger: el,
      scroller: scrollerTarget || window,
      start: `top ${startPct}%`,
      once: true,
      onEnter: () => tl.play(),
    })

    return () => {
      st.kill()
      tl.kill()
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
