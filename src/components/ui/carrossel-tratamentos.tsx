'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

import { CartaoVidro } from '@/components/ui/cartao-vidro'
import { pushEvento } from '@/lib/analytics'
import { cn, enquadramento, midia } from '@/lib/utils'
import type { Tratamento } from '@/payload-types'

export type ItemCarrossel = Pick<Tratamento, 'titulo' | 'slug' | 'resumo' | 'imagem'>

type Props = {
  itens: ItemCarrossel[]
  /** Segundos de cada tratamento na tela. Vem do mesmo campo do painel do hero. */
  intervalo?: number | null
  className?: string
}

/**
 * Cartao do hero que percorre os tratamentos sozinho, trocando foto, titulo e
 * resumo em conjunto.
 *
 * O `MidiaRotativa` nao serve aqui: ele alterna so a midia, e aqui a imagem
 * precisa acompanhar o texto do mesmo tratamento. O contrato dele e que foi
 * copiado: mesma trava de 2 a 30 segundos, mesma troca em esmaecimento e o
 * mesmo respeito a `prefers-reduced-motion`, que deixa so o primeiro item.
 *
 * A casca e o `CartaoVidro` escuro porque o cartao cai sobre foto, onde texto
 * solto nao tem contraste garantido.
 */
export function CarrosselTratamentos({ itens, intervalo, className }: Props) {
  const [atual, setAtual] = useState(0)
  const [reduzido, setReduzido] = useState(false)
  // Conteudo que anda sozinho precisa poder parar: para no ponteiro em cima e
  // enquanto alguem estiver navegando por dentro dele pelo teclado.
  const [parado, setParado] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const consulta = window.matchMedia('(prefers-reduced-motion: reduce)')
    const aoMudar = () => setReduzido(consulta.matches)
    aoMudar()
    consulta.addEventListener('change', aoMudar)
    return () => consulta.removeEventListener('change', aoMudar)
  }, [])

  useEffect(() => {
    if (itens.length < 2 || reduzido || parado) return
    const segundos = Math.min(Math.max(intervalo || 5, 2), 30)
    const relogio = setInterval(() => setAtual((posicao) => (posicao + 1) % itens.length), segundos * 1000)
    return () => clearInterval(relogio)
  }, [itens.length, intervalo, reduzido, parado])

  if (!itens.length) return null

  return (
    <div
      ref={ref}
      className={cn('w-full', className)}
      onMouseEnter={() => setParado(true)}
      onMouseLeave={() => setParado(false)}
      onFocus={() => setParado(true)}
      onBlur={(evento) => {
        if (!evento.currentTarget.contains(evento.relatedTarget as Node)) setParado(false)
      }}
    >
      <CartaoVidro tom="escuro" className="p-4">
        {/* Todos os slides na mesma celula da grade. Com posicionamento
            absoluto o cartao teria a altura do slide visivel e pularia a cada
            troca, porque titulo e resumo variam de tamanho. */}
        <div className="grid">
          {itens.map((item, indice) => {
            const imagem = midia(item.imagem)
            const visivel = indice === atual

            return (
              <div
                key={item.slug}
                aria-hidden={!visivel}
                className={cn(
                  '[grid-area:1/1] transition-opacity duration-700 ease-suave motion-reduce:transition-none',
                  visivel ? 'opacity-100' : 'pointer-events-none opacity-0',
                )}
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-areia">
                  {imagem?.url && (
                    <Image
                      src={imagem.url}
                      alt={imagem.alt || item.titulo}
                      fill
                      sizes="(max-width: 1024px) 90vw, 320px"
                      className="object-cover"
                      style={enquadramento(imagem)}
                    />
                  )}
                </div>

                {/* Texto, nao heading: um cabecalho que troca sozinho entraria e sairia
                    do outline da pagina a cada rotacao. */}
                <p className="mt-4 font-display text-xl text-porcelana">{item.titulo}</p>
                <p className="mt-2 line-clamp-2 text-sm text-porcelana/80">{item.resumo}</p>

                <a
                  href={`#${item.slug}`}
                  // So `aria-hidden` nao tira do foco: sem o tabIndex o teclado
                  // entra em link de slide invisivel e leva a pessoa para um
                  // destino que ela nao esta vendo.
                  tabIndex={visivel ? undefined : -1}
                  onClick={() => pushEvento('ver_tratamento', { tratamento: item.slug, local: 'hero' })}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-porcelana underline-offset-4 hover:underline"
                >
                  Mais informações
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            )
          })}
        </div>

        {itens.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {itens.map((item, indice) => (
              <button
                key={item.slug}
                type="button"
                onClick={() => setAtual(indice)}
                aria-current={indice === atual ? 'true' : undefined}
                aria-label={`Ver ${item.titulo}`}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  indice === atual ? 'w-6 bg-porcelana' : 'w-1.5 bg-porcelana/40 hover:bg-porcelana/70',
                )}
              />
            ))}
          </div>
        )}
      </CartaoVidro>
    </div>
  )
}
