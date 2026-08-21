'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'

/**
 * Smooth scroll com Lenis. Respeita a preferencia de movimento reduzido do
 * sistema e nao interfere na rolagem por teclado.
 */
export function SmoothScroll() {
  useEffect(() => {
    const prefereMenosMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefereMenosMovimento) return

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    })

    let frame = 0
    const animar = (tempo: number) => {
      lenis.raf(tempo)
      frame = requestAnimationFrame(animar)
    }
    frame = requestAnimationFrame(animar)

    // Ancoras internas passam a usar a rolagem suave do Lenis.
    const aoClicar = (evento: MouseEvent) => {
      const alvo = (evento.target as HTMLElement).closest('a[href^="#"]')
      if (!alvo) return
      const id = alvo.getAttribute('href')
      if (!id || id === '#') return
      const destino = document.querySelector(id)
      if (!destino) return
      evento.preventDefault()
      lenis.scrollTo(destino as HTMLElement, { offset: -80 })
    }

    document.addEventListener('click', aoClicar)

    return () => {
      document.removeEventListener('click', aoClicar)
      cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [])

  return null
}
