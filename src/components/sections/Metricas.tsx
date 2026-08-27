import { AnimatedContent } from '@/components/ui/animated-content'

import type { Clinica } from '@/payload-types'

type Metrica = NonNullable<Clinica['metricas']>[number]

export function Metricas({ metricas }: { metricas: Metrica[] }) {
  if (!metricas.length) return null

  return (
    <section className="border-y border-tinta/10 bg-areia py-14">
      {/*
        No `md` a faixa vira flex com `justify-between`, e nao grade de quatro
        colunas iguais.

        Com colunas iguais cada bloco encosta a esquerda da sua coluna, e como os
        rotulos tem larguras bem diferentes, de "Nota no Google" a "Visualizacoes
        nas redes", sobrava um vao grande depois de cada rotulo curto e uma
        sobra no fim da faixa. Com `justify-between` o primeiro bloco encosta na
        borda esquerda do container, o ultimo na direita, e a folga se reparte
        por igual entre eles.

        Abaixo do `md` continua a grade de duas colunas: ali `justify-between`
        jogaria os dois blocos de cada linha para as pontas, com um buraco no
        meio.
      */}
      <div className="container grid grid-cols-2 gap-8 md:flex md:justify-between md:gap-10">
        {metricas.map((metrica, indice) => (
          <AnimatedContent key={metrica.rotulo} delay={indice * 0.08} distance={60} scale={0.96}>
            <p className="font-display text-display-md text-cacau">{metrica.valor}</p>
            <p className="mt-2 text-sm text-tinta-suave">{metrica.rotulo}</p>
          </AnimatedContent>
        ))}
      </div>
    </section>
  )
}
