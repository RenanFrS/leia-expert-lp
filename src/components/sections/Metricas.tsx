import { AnimatedContent } from '@/components/ui/animated-content'

import type { Clinica } from '@/payload-types'

type Metrica = NonNullable<Clinica['metricas']>[number]

export function Metricas({ metricas }: { metricas: Metrica[] }) {
  if (!metricas.length) return null

  return (
    <section className="border-y border-tinta/10 bg-areia py-14">
      <div className="container grid grid-cols-2 gap-8 md:grid-cols-4">
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
