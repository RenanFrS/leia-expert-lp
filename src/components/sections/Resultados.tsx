'use client'

import Image from 'next/image'
import { useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'

import { Revelar } from '@/components/Revelar'
import { AnimatedContent } from '@/components/ui/animated-content'
import { enquadramento, midia } from '@/lib/utils'
import type { Resultado } from '@/payload-types'

/** Diametro da alca, em pixel. Precisa casar com o `h-14 w-14` do thumb. */
const ALCA = 56

/**
 * Comparador antes e depois, elemento de assinatura do projeto.
 *
 * **A divisa e o proprio `input[type=range]`**, esticado sobre a foto inteira,
 * e nao uma div com `onPointerMove`. Foi assim que a versao anterior errava em
 * tres frentes de uma vez:
 *
 * 1. sem `setPointerCapture`, o arrasto morria assim que o ponteiro saia da
 *    caixa, entao nao dava para chegar em 0% nem em 100%
 * 2. sem `touch-action`, arrastar no celular rolava a pagina em vez de mover a
 *    divisa
 * 3. o range ficava como uma barra visivel por cima da foto, e ainda roubava o
 *    arrasto de quem pegava perto da base
 *
 * O elemento nativo resolve os tres de graca e ainda traz teclado com setas,
 * Home e End, e o papel de slider para leitor de tela. Nao troque por div.
 */
function Comparador({ resultado }: { resultado: Resultado }) {
  const [posicao, setPosicao] = useState(50)

  const antes = midia(resultado.antes)
  const depois = midia(resultado.depois)
  const tratamento = typeof resultado.tratamento === 'object' ? resultado.tratamento : null

  // O thumb nativo nunca encosta na borda: ele para a meia alca de distancia.
  // A linha segue a mesma conta, senao as duas se separam nos extremos.
  const linha = `calc(${ALCA / 2}px + (100% - ${ALCA}px) * ${posicao / 100})`

  return (
    <figure className="relative overflow-hidden rounded-2xl bg-areia">
      <div className="relative aspect-[4/5]">
        {antes?.url && (
          <Image
            src={antes.url}
            alt={antes.alt || `${resultado.titulo}, antes do tratamento`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            style={enquadramento(antes)}
          />
        )}

        {depois?.url && (
          <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${posicao}%)` }}>
            <Image
              src={depois.url}
              alt={depois.alt || `${resultado.titulo}, depois do tratamento`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
              style={enquadramento(depois)}
            />
          </div>
        )}

        <span
          className="absolute left-4 top-4 rounded-full bg-porcelana/90 px-3 py-1.5 text-sm text-tinta backdrop-blur-sm"
        >
          Antes
        </span>
        <span className="absolute right-4 top-4 rounded-full bg-porcelana/90 px-3 py-1.5 text-sm text-tinta backdrop-blur-sm">
          Depois
        </span>

        <input
          type="range"
          min={0}
          max={100}
          value={posicao}
          onChange={(evento) => setPosicao(Number(evento.target.value))}
          aria-label={`Comparar antes e depois: ${resultado.titulo}`}
          aria-valuetext={`${Math.round(posicao)}% da foto de depois`}
          className="comparador-divisa"
        />

        {/*
          Linha e alca. Ficam **depois** do input no DOM para o seletor de foco
          alcancar elas, e sao `pointer-events-none` para nao roubar o arrasto.
        */}
        <div
          aria-hidden
          data-alca
          className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-porcelana"
          style={{ left: linha }}
        >
          <span className="comparador-alca absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-porcelana shadow-[0_6px_20px_-6px_rgba(46,33,26,0.65)]">
            <ChevronLeft className="h-4 w-4 text-cacau" />
            <ChevronRight className="-ml-1 h-4 w-4 text-cacau" />
          </span>
        </div>

        {/*
          Painel de baixo. O veu escuro nao e enfeite: o texto cai sobre foto de
          paciente, que muda a cada resultado, e so ele garante contraste do
          porcelana seja qual for a imagem.
        */}
        <figcaption className="pointer-events-none absolute inset-x-3 bottom-3 rounded-xl bg-tinta/55 px-4 py-4 text-center backdrop-blur-md">
          <p className="font-display text-sm text-porcelana/85">
            Resultados reais acompanhados na prática
          </p>

          <p className="mt-2 text-base text-porcelana">{resultado.titulo}</p>

          {(resultado.meses || tratamento) && (
            <div className="mt-3 flex flex-col items-center gap-1.5">
              {resultado.meses && (
                <span className="flex items-center gap-2 text-sm text-porcelana">
                  <CalendarDays aria-hidden className="h-4 w-4 text-caramelo-claro" />
                  {resultado.meses} {resultado.meses === 1 ? 'mês' : 'meses'} de tratamento
                </span>
              )}
              {tratamento && (
                <span className="flex items-center gap-2 text-sm text-porcelana">
                  <Sparkles aria-hidden className="h-4 w-4 text-caramelo-claro" />
                  {tratamento.titulo}
                </span>
              )}
            </div>
          )}
        </figcaption>
      </div>
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
            Compare você mesmo.
          </h2>
          <p className="mt-4 max-w-lg text-tinta-suave">
            Fotos de pacientes reais, publicadas com autorização. O tempo de resposta varia conforme o
            diagnóstico e a adesão ao protocolo.
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
