'use client'

import { useRef, type ReactNode } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'

import { cn } from '@/lib/utils'

/**
 * Parallax de rolagem, na tecnica do skiper30 do skiper-ui: mede o quanto o
 * elemento ja atravessou a tela e converte isso em deslocamento vertical. Quem
 * recebe distancias diferentes anda em velocidades diferentes, e e dai que sai
 * a sensacao de profundidade.
 *
 * Duas coisas mudaram em relacao ao componente publicado:
 *
 * 1. Ele nao instancia Lenis. O `src/components/SmoothScroll.tsx` ja mantem a
 *    instancia global da pagina, e uma segunda brigaria com ela pela rolagem.
 *    O `useScroll` le a rolagem nativa da janela, que e justamente o que o
 *    Lenis move, entao os dois conversam sem adaptador.
 * 2. Respeita `prefers-reduced-motion`, como o resto da animacao do projeto.
 *
 * A `distancia` vai em porcentagem da altura do proprio elemento, entao o
 * efeito escala sozinho entre celular e desktop, sem media query.
 */

type Props = {
  children: ReactNode
  /** Deslocamento em cada ponta, em porcentagem da altura do elemento. */
  distancia?: string
  /** Inverte o sentido, para blocos vizinhos nao deslizarem para o mesmo lado. */
  reverso?: boolean
  /**
   * Liga o modo sobreposto, para midia dentro de um container recortado: a
   * camada vira absoluta e mais alta que o container, e a sobra e o que impede
   * o deslocamento de abrir fresta nas pontas. Sem isso a camada fica no fluxo
   * normal, que e o certo para texto.
   */
  preencher?: boolean
  className?: string
}

export function CamadaParallax({
  children,
  distancia = '10%',
  reverso = false,
  preencher = false,
  className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const menosMovimento = useReducedMotion()

  // Do momento em que o topo do elemento entra por baixo da tela ate a base
  // dele sair por cima, que e a janela inteira de rolagem util.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })

  const inicio = reverso ? `-${distancia}` : distancia
  const fim = reverso ? distancia : `-${distancia}`
  const y = useTransform(scrollYProgress, [0, 1], [inicio, fim])

  return (
    // No modo sobreposto o medidor precisa cobrir o container inteiro. Se ele
    // ficasse no fluxo, com a camada absoluta por unico filho, teria altura
    // zero e o `useScroll` mediria um ponto em vez da figura.
    <div ref={ref} className={cn(preencher && 'absolute inset-0', className)}>
      {/* No modo sobreposto a camada e posicionada, entao ela tambem serve de
          referencia para um `Image` com `fill` la dentro. */}
      <motion.div
        className={preencher ? 'absolute inset-x-0 -top-[15%] h-[130%]' : undefined}
        style={{ y: menosMovimento ? 0 : y }}
      >
        {children}
      </motion.div>
    </div>
  )
}
