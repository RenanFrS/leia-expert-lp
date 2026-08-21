'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Revela o conteudo quando ele entra na viewport. Usa IntersectionObserver em
 * vez de biblioteca de animacao para nao pesar no carregamento.
 */
export function Revelar({
  children,
  className,
  atraso = 0,
}: {
  children: React.ReactNode
  className?: string
  atraso?: number
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
      className={cn('transition-all duration-700 ease-out', visivel ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4', className)}
      style={{ transitionDelay: `${atraso}ms` }}
    >
      {children}
    </div>
  )
}
