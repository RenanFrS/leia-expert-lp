'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Revela o conteudo quando ele entra na viewport. Usa IntersectionObserver em
 * vez de biblioteca de animacao para nao pesar no carregamento, e por isso e o
 * unico dos tres sistemas de animacao que pode aparecer acima da dobra.
 *
 * O padrao e subir. As outras duas existem para o titulo do hero, que forma o
 * recorte sobre a midia:
 *
 * - `cima` e a que vale hoje, com o titulo em forma de notch: ele desce da borda
 *   de cima do painel ate assentar, que e o sentido em que a forma se le.
 * - `esquerda` vem da silhueta anterior, em escada, e ficou porque e barata.
 *
 * **O deslocamento de `cima` e curto de proposito, 24px.** No `lg` o titulo
 * assenta a 96px do topo da secao, encostado no header, que ocupa exatamente
 * esses 96px sem fundo proprio enquanto a pagina esta no topo. Com 48px de curso
 * ele nasceria no meio dos links do menu. Mesmo com 24px a margem e justa:
 * medido, a base do logotipo e a primeira linha do titulo se encontram em 76px
 * no inicio da animacao, quando a opacidade ainda e zero.
 *
 * As classes ficam escritas por extenso num mapa, e nao montadas com template,
 * porque o Tailwind so gera o CSS da classe que encontra literal no fonte.
 */
const OCULTO = {
  baixo: 'opacity-0 translate-y-4',
  cima: 'opacity-0 -translate-y-6',
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
