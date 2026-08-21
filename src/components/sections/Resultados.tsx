'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import { Revelar } from '@/components/Revelar'
import { AnimatedContent } from '@/components/ui/animated-content'
import { midia } from '@/lib/utils'
import type { Resultado } from '@/payload-types'

/**
 * Comparador antes e depois. A alca arrasta a divisa entre as duas fotos, no
 * mesmo gesto de quem compara duas capturas do exame lado a lado.
 */
function Comparador({ resultado }: { resultado: Resultado }) {
  const [posicao, setPosicao] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)

  const antes = midia(resultado.antes)
  const depois = midia(resultado.depois)

  const mover = (clientX: number) => {
    const caixa = containerRef.current?.getBoundingClientRect()
    if (!caixa) return
    const proporcao = ((clientX - caixa.left) / caixa.width) * 100
    setPosicao(Math.min(100, Math.max(0, proporcao)))
  }

  return (
    <figure>
      <div
        ref={containerRef}
        className="relative aspect-[3/4] select-none overflow-hidden rounded-lg bg-areia"
        onPointerMove={(evento) => evento.buttons === 1 && mover(evento.clientX)}
        onPointerDown={(evento) => mover(evento.clientX)}
      >
        {antes?.url && (
          <Image
            src={antes.url}
            alt={antes.alt || `${resultado.titulo}, antes do tratamento`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        )}

        {depois?.url && (
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 0 0 ${posicao}%)` }}
          >
            <Image
              src={depois.url}
              alt={depois.alt || `${resultado.titulo}, depois do tratamento`}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
          </div>
        )}

        <div
          className="pointer-events-none absolute inset-y-0 w-px bg-porcelana"
          style={{ left: `${posicao}%` }}
        >
          <span className="absolute top-1/2 left-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-porcelana bg-tinta/40 backdrop-blur-sm" />
        </div>

        <input
          type="range"
          min={0}
          max={100}
          value={posicao}
          onChange={(evento) => setPosicao(Number(evento.target.value))}
          aria-label={`Comparar antes e depois de ${resultado.titulo}`}
          className="absolute inset-x-0 bottom-3 mx-auto w-[85%] cursor-ew-resize accent-caramelo"
        />

        <span className="absolute left-3 top-3 rounded bg-tinta/70 px-2 py-1 text-[11px] uppercase tracking-wider text-porcelana">
          Antes
        </span>
        <span className="absolute right-3 top-3 rounded bg-cacau/80 px-2 py-1 text-[11px] uppercase tracking-wider text-porcelana">
          Depois
        </span>
      </div>

      <figcaption className="mt-4 flex items-baseline justify-between gap-4">
        <span className="font-display text-lg text-tinta">{resultado.titulo}</span>
        {resultado.meses && (
          <span className="font-mono text-xs text-neutro">{resultado.meses} meses</span>
        )}
      </figcaption>
    </figure>
  )
}

export function Resultados({ resultados }: { resultados: Resultado[] }) {
  if (!resultados.length) return null

  return (
    <section id="resultados" className="py-24 md:py-32">
      <div className="container">
        <Revelar>
          <p className="text-eyebrow font-mono uppercase text-caramelo">Resultados</p>
          <h2 className="mt-4 max-w-2xl font-display text-display-lg text-tinta">
            Arraste a divisa e compare voce mesmo.
          </h2>
          <p className="mt-4 max-w-lg text-tinta-suave">
            Fotos de pacientes reais, publicadas com autorizacao. O tempo de resposta varia conforme o
            diagnostico e a adesao ao protocolo.
          </p>
        </Revelar>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {resultados.map((resultado, indice) => (
            <AnimatedContent key={resultado.id} delay={indice * 0.09} distance={60} scale={0.96}>
              <Comparador resultado={resultado} />
            </AnimatedContent>
          ))}
        </div>
      </div>
    </section>
  )
}
