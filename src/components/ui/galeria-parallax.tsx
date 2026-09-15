import type { ReactNode } from 'react'

import { GradeParallax } from '@/components/ui/grade-parallax'
import { cn } from '@/lib/utils'

/**
 * Grade de cartoes em colunas que correm em velocidades diferentes, na forma do
 * **skiper30 do skiper-ui**, o Oliver parallax, escolhido pelo cliente.
 *
 * Livre para uso pessoal e comercial, com **atribuicao ao Skiper UI** pedida
 * pela licenca da versao gratuita. Autor: @gurvinder-singh02, https://gxuri.me.
 *
 * **Nao entra dependencia nova.** O framer-motion ja estava no projeto e o Lenis
 * global do `SmoothScroll.tsx` continua sendo o unico: aqui ninguem instancia
 * outro, senao os dois brigam pela rolagem.
 *
 * **Este arquivo e server component.** Quem move as colunas e o
 * `grade-parallax.tsx`, que e cliente e recebe as colunas **ja renderizadas
 * aqui**, como `children`. Assim as fotos continuam saindo do servidor e para o
 * navegador vai so o wrapper que anima.
 *
 * **Ele nao sabe o que ha dentro do cartao, de proposito.** Quem chama entrega o
 * conteudo pronto e a razao de altura dele. E isso que deixa a mesma grade
 * servir dois conteudos bem diferentes sem duplicar regra de layout: o par de
 * antes e depois da secao de resultados e a foto solta da secao A clinica. O que
 * continua sendo dele e o empacotamento, a casca da `figure` e o movimento.
 *
 * Tres decisoes que sustentam a grade:
 *
 * - **Sao duas colunas em qualquer tela.** Ja foram tres no `lg` e duas no
 *   celular, o que exigia um remendo de `display: contents` porque tres nao
 *   dividem por dois. Com duas, a grade e a mesma em toda largura e o remendo
 *   saiu.
 * - **A distribuicao equilibra a altura, e nao e rodizio.** Cada cartao vai para
 *   a coluna mais curta no momento, medindo pela `razao` que ele declara. Como o
 *   custo e altura sobre largura e todas as colunas tem a mesma largura, a conta
 *   sai sem saber largura em pixel nenhuma. Rodizio puro parece equivalente e
 *   nao e: medido com fotos de razao misturada, ele deixava o pe das colunas
 *   variando quase 300px.
 *
 *   **A varredura preserva a ordem do painel**, o que custa um pouco de
 *   equilibrio: ordenar do mais alto para o mais baixo fecharia quase todo o
 *   degrau, mas jogaria fora o campo `ordem`, que e o unico controle da clinica.
 * - **Quem filtra video e quem monta o cartao**, e nao este arquivo. A Media
 *   aceita os dois tipos e o otimizador do Next responde 400, "The requested
 *   resource isn't a valid image", para um `.mp4`. Sem esse cuidado la, uma foto
 *   trocada por video deixaria um buraco na grade sem erro nenhum na tela.
 */

export type CartaoDaGrade = {
  id: string | number
  /**
   * Altura do cartao dividida pela largura dele. E o unico dado que o
   * empacotamento precisa, e e por isso que ele nao depende de saber se o cartao
   * tem uma foto ou duas.
   */
  razao: number
  conteudo: ReactNode
}

/**
 * Em quantas colunas a distribuicao divide os cartoes.
 *
 * **Precisa casar com o `CURSOS` do `grade-parallax.tsx`**, que e quem move cada
 * coluna. A constante e declarada duas vezes de proposito: aquele arquivo e
 * `'use client'`, e importar um valor dele para ca faria ele atravessar a
 * fronteira RSC como referencia de cliente em vez de numero, o que ja quebrou a
 * distribuicao em silencio. Mexeu numa lista, confira a outra.
 */
const COLUNAS = 2

export function GaleriaParallax({
  itens,
  colunasNoCelular = 2,
  className,
}: {
  itens: CartaoDaGrade[]
  /** Uma coluna abaixo do `lg`, para cartao largo como o par lado a lado. */
  colunasNoCelular?: 1 | 2
  className?: string
}) {
  if (!itens.length) return null

  // Empacota na coluna mais curta, mantendo a ordem do painel na varredura.
  const alturas = Array.from({ length: COLUNAS }, () => 0)
  // Cada cartao leva a posicao que tinha na lista. E ela que devolve a ordem do
  // painel quando a grade vira uma coluna so no celular; o motivo esta no
  // `LAYOUT` do `grade-parallax.tsx`.
  const colunas: (CartaoDaGrade & { posicao: number })[][] = Array.from(
    { length: COLUNAS },
    () => [],
  )

  itens.forEach((item, posicao) => {
    const menor = alturas.indexOf(Math.min(...alturas))
    colunas[menor].push({ ...item, posicao })
    alturas[menor] += item.razao
  })

  return (
    // `clip` e nao `hidden` de proposito, para nao criar container de rolagem
    // novo. Mesmo criterio do hero e da secao de tratamentos.
    <div className={cn('overflow-clip', className)}>
      <GradeParallax
        colunasNoCelular={colunasNoCelular}
        colunas={colunas.map((coluna) =>
          coluna.map(({ id, conteudo, posicao }) => (
            <figure
              key={id}
              style={{ order: posicao }}
              /*
                O espacamento voltou para o `gap` da coluna. Ele ja foi `mb` aqui,
                de quando a coluna virava `display: contents` no celular e nao
                formava caixa: sem caixa nao ha `gap`. Com a coluna sendo caixa em
                toda largura, o `gap` volta a valer e some a margem sobrando no
                ultimo cartao.
              */
              className="overflow-hidden rounded-lg bg-areia"
            >
              {conteudo}
            </figure>
          )),
        )}
      />
    </div>
  )
}
