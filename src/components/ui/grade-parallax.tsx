'use client'

import { useEffect, useRef, useState } from 'react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'

import { cn } from '@/lib/utils'

/** Degrau de partida de cada coluna, que e o desencontro vertical da referencia. */
const DEGRAUS = ['lg:mt-0', 'lg:mt-14']

/**
 * Quantas colunas este arquivo sabe mover. Precisa casar com a quantidade de
 * `useTransform` daqui e com o `COLUNAS` da galeria.
 *
 * **Nao exporte isso para a galeria.** Ela e server component, e valor importado
 * de um modulo `'use client'` atravessa a fronteira RSC como referencia de
 * cliente, nao como o numero: `Array.from({ length: COLUNAS })` virava array
 * vazio e a distribuicao quebrava com "Cannot read properties of undefined
 * (reading 'push')". A galeria declara a propria constante, e o comentario de la
 * aponta para ca.
 */
const COLUNAS = DEGRAUS.length

/** Acima daqui o parallax liga. Abaixo, a grade fica parada. */
const CONSULTA_DESKTOP = '(min-width: 1024px)'

/**
 * Move as colunas a partir de **uma unica medicao de rolagem**.
 *
 * **Cada coluna anda so a folga que ela tem dentro da grade, e nunca sai dela.**
 * A grade tem a altura da coluna mais alta; a outra e mais curta pelo degrau e
 * pela conta de cartoes, que com numero impar de casos da um cartao inteiro. Essa
 * diferenca, medida em pixel, e o curso: com o topo da grade na tela a coluna
 * curta fica rente ao topo, com o pe na tela ela fica rente ao pe, e no meio
 * desliza. A mais alta nao se mexe, porque nao tem folga.
 *
 * **Antes o curso era porcentagem fixa da altura, e quebrava dos dois lados.**
 * Com 10% a coluna da direita saia ~214px da caixa: no topo o `overflow-clip`
 * cortava a primeira foto dela, e no meio da rolagem sobrava um buraco embaixo,
 * porque a porcentagem nao sabia que a coluna tinha um cartao a menos. E cada
 * pixel que a coluna passava do pe virava vazio antes da secao seguinte.
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
/*
  **O `items-start` nao e enfeite.** Sem ele a grade estica cada coluna ate a
  altura da mais alta, a folga medida da zero e a coluna curta nao desliza: as
  fotos ficam no topo da caixa esticada e o buraco fica dentro dela, embaixo.
*/
const LAYOUT = {
  1: {
    grade: 'flex flex-col gap-3 md:gap-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-5',
    coluna: 'contents lg:flex lg:flex-col lg:gap-5',
  },
  2: {
    grade: 'grid grid-cols-2 items-start gap-3 md:gap-4 lg:gap-5',
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

  /*
    **Do topo da grade no topo da tela ate o pe da grade no pe da tela.** Antes
    disso o progresso fica em 0, e a coluna curta rente ao topo, que e o que esta
    a vista. Depois fica em 1, rente ao pe. O `useTransform` trava nas pontas,
    entao o alinhamento vale em toda a entrada e em toda a saida.

    Grade mais baixa que a tela inverteria as duas marcas, e por isso a medicao
    abaixo zera o curso nesse caso.
  */
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })

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

  // A folga de cada coluna, em pixel. Vive em motion value, e nao em estado,
  // para a medida nova chegar ao transform sem renderizar a grade de novo.
  const folga0 = useMotionValue(0)
  const folga1 = useMotionValue(0)

  useEffect(() => {
    const grade = ref.current
    if (!ativo || !grade) {
      folga0.set(0)
      folga1.set(0)
      return
    }
    const colunas = [...grade.children] as HTMLElement[]
    const medir = () => {
      // Grade mais baixa que a tela: sem rolagem util, sem movimento.
      const cabe = grade.offsetHeight <= window.innerHeight
      const folgas = colunas.map((coluna) =>
        cabe
          ? 0
          : // `offsetTop` e `offsetHeight` ignoram o `transform`, entao a medida
            // nao muda com a propria coluna em movimento. O `relative` da grade
            // faz dela o `offsetParent`, e o degrau entra no `offsetTop`.
            Math.max(0, grade.offsetHeight - coluna.offsetTop - coluna.offsetHeight),
      )
      folga0.set(folgas[0] ?? 0)
      folga1.set(folgas[1] ?? 0)
    }
    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(grade)
    colunas.forEach((coluna) => observador.observe(coluna))
    window.addEventListener('resize', medir)
    return () => {
      observador.disconnect()
      window.removeEventListener('resize', medir)
    }
  }, [ativo, folga0, folga1])

  // Os dois `useTransform` sao criados sempre, e nao dentro de um map sobre os
  // filhos: `COLUNAS` e constante do modulo, entao a contagem de hooks nunca
  // muda, mas deixar isso implicito num map convidaria a quebrar a regra depois.
  const y0 = useTransform([progresso, folga0], ([p, f]: number[]) => p * f)
  const y1 = useTransform([progresso, folga1], ([p, f]: number[]) => p * f)
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
      // O `relative` faz da grade o `offsetParent` das colunas, que e de onde a
      // medida da folga le o `offsetTop`.
      className={cn('relative', LAYOUT[colunasNoCelular].grade)}
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
