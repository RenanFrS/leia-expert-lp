'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Revela o conteudo quando ele entra na viewport. Usa IntersectionObserver em
 * vez de biblioteca de animacao para nao pesar no carregamento, e por isso e o
 * unico dos tres sistemas de animacao que pode aparecer acima da dobra.
 *
 * O padrao e subir. A direcao `esquerda` existe para o titulo do hero, que forma
 * o recorte sobre a midia: ali o movimento vertical empurrava o bloco branco por
 * cima da foto, e o lateral acompanha a leitura da frase.
 *
 * As classes ficam escritas por extenso num mapa, e nao montadas com template,
 * porque o Tailwind so gera o CSS da classe que encontra literal no fonte.
 */
const OCULTO = {
  baixo: 'opacity-0 translate-y-4',
  esquerda: 'opacity-0 -translate-x-12',
} as const

export function Revelar({
  children,
  className,
  atraso = 0,
  direcao = 'baixo',
}: {
  children: React.ReactNode
  className?: string
  atraso?: number
  direcao?: keyof typeof OCULTO
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visivel, setVisivel] = useState(false)

  useEffect(() => {
    const elemento = ref.current
    if (!elemento) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisivel(true)
      return
    }

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisivel(true)
          observador.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' },
    )

    observador.observe(elemento)
    return () => observador.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out',
        visivel ? 'opacity-100 translate-x-0 translate-y-0' : OCULTO[direcao],
        className,
      )}
      style={{ transitionDelay: `${atraso}ms` }}
    >
      {children}
    </div>
  )
}
