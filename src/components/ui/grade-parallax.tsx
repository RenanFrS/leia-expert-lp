'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'

import { cn } from '@/lib/utils'

/** Curso de cada coluna, em porcentagem da altura da grade. Indice = coluna. */
const CURSOS = [0.06, -0.1]

/** Degrau de partida de cada coluna, que e o desencontro vertical da referencia. */
const DEGRAUS = ['lg:mt-0', 'lg:mt-14']

/**
 * Quantas colunas este arquivo sabe mover. Sai do proprio `CURSOS`, que e a
 * lista que precisa casar com a quantidade de `useTransform` daqui.
 *
 * **Nao exporte isso para a galeria.** Ela e server component, e valor importado
 * de um modulo `'use client'` atravessa a fronteira RSC como referencia de
 * cliente, nao como o numero: `Array.from({ length: COLUNAS })` virava array
 * vazio e a distribuicao quebrava com "Cannot read properties of undefined
 * (reading 'push')". A galeria declara a propria constante, e o comentario de la
 * aponta para ca.
 */
const COLUNAS = CURSOS.length

/** Acima daqui o parallax liga. Abaixo, a grade fica parada. */
const CONSULTA_DESKTOP = '(min-width: 1024px)'

/**
 * Move as tres colunas a partir de **uma unica medicao de rolagem**.
 *
 * **Antes cada coluna chamava o proprio `useScroll`, e era dai que vinha o
 * engasgo.** Medido: o transform acompanhava a rolagem sem atraso nenhum, com o
 * melhor ajuste em zero quadros, mas o erro residual era de **3.34px**, maior
 * que os 1.9px que a coluna anda por quadro. Ou seja, nao era atraso, era ruido:
 * cada coluna amostrava a rolagem por conta propria, num momento ligeiramente
 * diferente do quadro, e elas tremiam **umas em relacao as outras**, que e o que
 * mais aparece numa grade lado a lado.
 *
 * Duas coisas corrigem isso:
 *
 * 1. **uma medicao so**, distribuida para as tres colunas, entao elas nao podem
 *    mais divergir entre si. **Foi isso que resolveu**: o residuo caiu de 3.34px
 *    para **0.01px**, com o transform acompanhando a rolagem do quadro seguinte
 * 2. **`will-change: transform`**, que promove a coluna a camada propria e tira
 *    a repintura das fotos do caminho
 *
 * **Abaixo do `lg` nao ha transform nenhum**, e nao so por classe: o `ativo` e
 * lido por `matchMedia`, entao no telefone a mola nem roda. Ele comeca `false`
 * para o servidor e o cliente renderizarem igual.
 */
/**
 * Classes da grade conforme quantas colunas ela tem no celular. Escritas por
 * extenso porque o Tailwind so gera o CSS da classe que encontra literal no
 * fonte: montar por concatenacao faria a regra sumir.
 *
 * **Com uma coluna, a coluna do DOM vira `display: contents`.** O DOM segue com
 * duas colunas, que e o que o `lg` precisa, e o empacotamento reparte os
 * cartoes alternando entre elas. Empilhar as duas numa so mostraria os casos
 * fora de ordem, 1, 3, 5, 7, 9, 2, 4, 6, 8. Sem caixa, os cartoes viram filhos
 * diretos de um flex so, e o `order` que cada `figure` traz da galeria devolve a
 * sequencia do painel. No `lg` a coluna volta a ser caixa e o `order` la dentro
 * ja e crescente, entao nada muda ali.
 */
const LAYOUT = {
  1: {
    grade: 'flex flex-col gap-3 md:gap-4 lg:grid lg:grid-cols-2 lg:gap-5',
    coluna: 'contents lg:flex lg:flex-col lg:gap-5',
  },
  2: {
    grade: 'grid grid-cols-2 gap-3 md:gap-4 lg:gap-5',
    coluna: 'flex flex-col gap-3 md:gap-4 lg:gap-5',
  },
} as const

export function GradeParallax({
  colunas,
  colunasNoCelular = 2,
}: {
  colunas: React.ReactNode[]
  /** Uma coluna abaixo do `lg`, para cartao largo. O `lg` e sempre duas. */
  colunasNoCelular?: 1 | 2
}) {
  const ref = useRef<HTMLDivElement>(null)
  const menosMovimento = useReducedMotion()
  const [desktop, setDesktop] = useState(false)

  useEffect(() => {
    const consulta = window.matchMedia(CONSULTA_DESKTOP)
    const aoMudar = () => setDesktop(consulta.matches)
    aoMudar()
    consulta.addEventListener('change', aoMudar)
    return () => consulta.removeEventListener('change', aoMudar)
  }, [])

  // Do momento em que o topo da grade entra por baixo da tela ate a base sair
  // por cima, que e a janela inteira de rolagem util.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })

  /*
    **Nao ha mola aqui, e isso foi medido, nao suposto.**

    A tentativa obvia de consertar tremor de parallax e passar o progresso por um
    `useSpring`. Tentado e descartado: com `stiffness: 180`, o transform so
    passava a acompanhar bem a rolagem **dez quadros atras**, ou seja 166ms de
    atraso, com a coluna nadando visivelmente atras da pagina. O residuo caia de
    3.34px para 1.28px, mas trocava um defeito por outro pior.

    Sem mola nenhuma, e so com a medicao unica, o residuo cai para **0.01px no
    quadro seguinte**, com minimo claro em 1 quadro. O tremor era inteiro de
    amostragem, e nao havia o que suavizar depois de resolver a causa.
  */
  const progresso = scrollYProgress

  const ativo = desktop && !menosMovimento

  // Os dois `useTransform` sao criados sempre, e nao dentro de um map sobre os
  // filhos: `COLUNAS` e constante do modulo, entao a contagem de hooks nunca
  // muda, mas deixar isso implicito num map convidaria a quebrar a regra depois.
  const y0 = useTransform(progresso, [0, 1], [`${CURSOS[0] * 100}%`, `${-CURSOS[0] * 100}%`])
  const y1 = useTransform(progresso, [0, 1], [`${CURSOS[1] * 100}%`, `${-CURSOS[1] * 100}%`])
  const deslocamentos = [y0, y1]

  return (
    <div
      ref={ref}
      /*
        Duas colunas no `lg`, e no celular a quantidade que a secao pedir. O
        mapa `LAYOUT` explica o caso de uma coluna.

        O parallax e desligado abaixo do `lg` por `matchMedia`, entao a coluna em
        `display: contents` nunca recebe transform: elemento sem caixa nao teria
        onde aplica-lo.
      */
      className={LAYOUT[colunasNoCelular].grade}
    >
      {colunas.map((coluna, indice) => (
        <motion.div
          key={indice}
          className={cn(LAYOUT[colunasNoCelular].coluna, DEGRAUS[indice])}
          style={
            ativo && deslocamentos[indice]
              ? { y: deslocamentos[indice], willChange: 'transform' }
              : undefined
          }
        >
          {coluna}
        </motion.div>
      ))}
    </div>
  )
}
