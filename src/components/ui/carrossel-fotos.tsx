'use client'

import Image from 'next/image'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

export type FotoDoCarrossel = {
  id: string | number
  url: string
  alt: string
  /** O `enquadramento` da propria foto, que ja vem resolvido de quem chama. */
  estilo?: CSSProperties
}

type Props = {
  fotos: FotoDoCarrossel[]
  sizes: string
  /** Rotulo do conjunto para leitor de tela. */
  rotulo: string
  /** Segundos entre uma foto e outra. Travado entre 2 e 30, como no hero. */
  intervalo?: number
  /**
   * Conteudo preso ao pe da foto, embaixo dos pontinhos. No Sobre e o cartao de
   * vidro com o nome. Ele nao troca junto com a foto.
   */
  rodape?: ReactNode
}

/** Deslocamento horizontal minimo, em pixel, para um arraste virar troca. */
const LIMIAR_ARRASTE = 40

/**
 * Carrossel de fotos, hoje so no cartao vertical da secao Sobre.
 *
 * **Ele nao reaproveita o `MidiaRotativa`**, que so alterna a midia: aqui ha
 * pontinhos, arraste e um rodape fixo, e o indice atual precisa morar num
 * componente que enxerga os tres.
 *
 * **Nao ha parallax, e isso e decisao.** Enquanto a secao era uma faixa larga,
 * a foto vivia num `CamadaParallax preencher`, uma camada 30% mais alta que a
 * figura, com 15% escondidos em cima e mais o curso da rolagem. No cartao
 * vertical o rosto fica no alto da foto, e essa faixa escondida cortava o
 * cabelo em qualquer ponto de foco: medido em 1440, o topo da cabeca saia da
 * figura. Sem a camada, o `object-position` do ponto de foco e exato.
 *
 * O resto segue o contrato dos outros dois carrosseis do site:
 *
 * - troca em esmaecimento, com as fotos empilhadas na mesma caixa
 * - **pausa** com o ponteiro em cima e com foco dentro, como o
 *   `carrossel-tratamentos.tsx`: conteudo que anda sozinho precisa poder parar
 * - **`prefers-reduced-motion` desliga o giro**, mas pontinhos e arraste
 *   continuam, porque sao pedidos da propria pessoa
 * - com menos de duas fotos nao ha pontinho, giro nem arraste
 *
 * **Pontinhos e `rodape` dividem um bloco so, preso ao pe da figura**: os
 * pontinhos em cima, centralizados, e o rodape embaixo. Assim os pontinhos ficam
 * logo acima do vidro qualquer que seja a altura dele, que varia com o tamanho do
 * nome e da tela. Com posicao absoluta separada, um cobriria o outro.
 *
 * **O arraste e por ponteiro, com `touch-action: pan-y`.** O `pan-y` deixa o
 * navegador cuidar da rolagem vertical da pagina por cima da foto e entrega so o
 * gesto horizontal para ca. Sem ele, quem rolasse a pagina com o dedo em cima da
 * foto ficaria preso.
 */
export function CarrosselFotos({ fotos, sizes, rotulo, intervalo = 6, rodape }: Props) {
  const [atual, setAtual] = useState(0)
  const [reduzido, setReduzido] = useState(false)
  const [parado, setParado] = useState(false)
  const inicioArraste = useRef<number | null>(null)

  const total = fotos.length
  const varias = total > 1

  useEffect(() => {
    const consulta = window.matchMedia('(prefers-reduced-motion: reduce)')
    const aoMudar = () => setReduzido(consulta.matches)
    aoMudar()
    consulta.addEventListener('change', aoMudar)
    return () => consulta.removeEventListener('change', aoMudar)
  }, [])

  useEffect(() => {
    if (!varias || reduzido || parado) return
    const segundos = Math.min(Math.max(intervalo, 2), 30)
    const relogio = setInterval(() => setAtual((posicao) => (posicao + 1) % total), segundos * 1000)
    return () => clearInterval(relogio)
  }, [varias, total, intervalo, reduzido, parado])

  // Sem foto o rodape continua: no Sobre ele e o nome da profissional.
  if (!total && !rodape) return null

  const irPara = (indice: number) => setAtual((indice + total) % total)

  return (
    <div
      className="absolute inset-0"
      role={varias ? 'region' : undefined}
      aria-roledescription={varias ? 'carrossel' : undefined}
      aria-label={varias ? rotulo : undefined}
      onMouseEnter={() => setParado(true)}
      onMouseLeave={() => setParado(false)}
      onFocus={() => setParado(true)}
      onBlur={(evento) => {
        if (!evento.currentTarget.contains(evento.relatedTarget as Node)) setParado(false)
      }}
      onPointerDown={(evento) => {
        if (varias) inicioArraste.current = evento.clientX
      }}
      onPointerUp={(evento) => {
        const inicio = inicioArraste.current
        inicioArraste.current = null
        if (inicio === null) return
        const delta = evento.clientX - inicio
        if (Math.abs(delta) < LIMIAR_ARRASTE) return
        // Arrastar para a esquerda traz a proxima, como virar pagina.
        irPara(delta < 0 ? atual + 1 : atual - 1)
      }}
      onPointerCancel={() => {
        inicioArraste.current = null
      }}
      style={varias ? { touchAction: 'pan-y' } : undefined}
    >
      {fotos.map((foto, indice) => {
        const visivel = indice === atual
        return (
          <div
            key={foto.id}
            aria-hidden={!visivel}
            className={cn(
              'absolute inset-0 transition-opacity duration-700 ease-suave motion-reduce:transition-none',
              visivel ? 'opacity-100' : 'opacity-0',
            )}
          >
            <Image
              src={foto.url}
              alt={foto.alt}
              fill
              sizes={sizes}
              // Sem isso o navegador ainda arrasta a imagem como arquivo, e o
              // gesto de trocar de foto vira um fantasma da foto na tela.
              draggable={false}
              className="select-none object-cover"
              style={foto.estilo}
            />
          </div>
        )
      })}

      {(varias || rodape) && (
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 p-3 md:p-4">
          {varias && (
            /*
              **A pilula escura nao e enfeite, e conta de contraste.** As fotos
              da Leia tem fundo branco, e pontinho claro direto sobre branco
              some. A conta dos pontinhos esta logo abaixo e no CLAUDE.md.
            */
            <div className="flex items-center rounded-full bg-tinta/60 px-1.5 backdrop-blur-sm">
              {fotos.map((foto, indice) => (
                <button
                  key={foto.id}
                  type="button"
                  onClick={() => irPara(indice)}
                  aria-current={indice === atual ? 'true' : undefined}
                  aria-label={`Ver foto ${indice + 1} de ${total}`}
                  // O botao e maior que o pontinho de proposito: 24 por 24 de
                  // alvo, o minimo para toque, com o desenho continuando pequeno.
                  // So altura nao bastava: medido, o botao do pontinho redondo saia
                  // com 14px de largura, e a largura minima e quem resolve.
                  className="group flex h-6 min-w-6 items-center justify-center px-1"
                >
                  <span
                    aria-hidden
                    className={cn(
                      'block h-1.5 rounded-full transition-all duration-300',
                      // O inativo fica em 80%, e nao nos 40% dos pontinhos do hero:
                      // aqui a pilula cai sobre foto de fundo branco. Medido contra
                      // o pixel mais claro atras dela, 60% dava 2.75 e reprovava o
                      // 3:1 de controle de interface; 80% da 3.61. O atual da 4.62.
                      // Quem distingue o atual e o formato alongado, nao a cor.
                      indice === atual
                        ? 'w-6 bg-porcelana'
                        : 'w-1.5 bg-porcelana/80 group-hover:bg-porcelana',
                    )}
                  />
                </button>
              ))}
            </div>
          )}
          {rodape && <div className="w-full">{rodape}</div>}
        </div>
      )}
    </div>
  )
}
