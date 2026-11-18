'use client'

import { useEffect } from 'react'
import type Lenis from 'lenis'

/**
 * Smooth scroll com Lenis. Respeita a preferencia de movimento reduzido do
 * sistema e nao interfere na rolagem por teclado.
 *
 * **O Lenis vem por `import()` dentro do efeito**, e nao no topo do arquivo.
 * Este componente mora no layout, entao o import estatico punha a biblioteca no
 * pacote de toda pagina, na frente da hidratacao. Assim ela chega num pedaco
 * proprio, depois, e ate la a rolagem e a nativa, que funciona igual.
 */
export function SmoothScroll() {
  useEffect(() => {
    const prefereMenosMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefereMenosMovimento) return

    // O Strict Mode roda o efeito duas vezes em desenvolvimento, e a limpeza pode
    // chegar antes de o `import()` resolver. Sem o `cancelado`, ficariam duas
    // instancias do Lenis brigando pela mesma rolagem.
    let cancelado = false
    let lenis: Lenis | undefined
    let frame = 0

    // Ancoras internas passam a usar a rolagem suave do Lenis. Antes de ele
    // chegar, o clique segue o caminho nativo.
    const aoClicar = (evento: MouseEvent) => {
      if (!lenis) return
      const alvo = (evento.target as HTMLElement).closest('a[href^="#"]')
      if (!alvo) return
      const id = alvo.getAttribute('href')
      if (!id || id === '#') return
      const destino = document.querySelector(id)
      if (!destino) return
      evento.preventDefault()
      lenis.scrollTo(destino as HTMLElement, { offset: -80 })
    }

    import('lenis').then(({ default: Lenis }) => {
      if (cancelado) return

      const instancia = new Lenis({
        duration: 1.05,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.6,
      })
      lenis = instancia

      const animar = (tempo: number) => {
        instancia.raf(tempo)
        frame = requestAnimationFrame(animar)
      }
      frame = requestAnimationFrame(animar)
    })

    document.addEventListener('click', aoClicar)

    return () => {
      cancelado = true
      document.removeEventListener('click', aoClicar)
      cancelAnimationFrame(frame)
      lenis?.destroy()
    }
  }, [])

  return null
}
