import Image from 'next/image'
import { Revelar } from '@/components/Revelar'
import { AnimatedContent } from '@/components/ui/animated-content'
import { midia } from '@/lib/utils'
import type { Tratamento } from '@/payload-types'

export function Tratamentos({ tratamentos }: { tratamentos: Tratamento[] }) {
  if (!tratamentos.length) return null

  return (
    <section id="tratamentos" className="py-24 md:py-32">
      <div className="container">
        <Revelar>
          <p className="text-eyebrow font-mono uppercase text-caramelo">O que tratamos</p>
          <h2 className="mt-4 max-w-2xl font-display text-display-lg text-tinta">
            Cada queixa pede um protocolo diferente.
          </h2>
        </Revelar>

        <div className="mt-16 space-y-20">
          {tratamentos.map((tratamento, indice) => {
            const imagem = midia(tratamento.imagem)

            return (
            <AnimatedContent key={tratamento.id} distance={60} scale={0.96}>
              <article
                id={tratamento.slug}
                className={`grid items-center gap-10 md:grid-cols-2 ${indice % 2 === 1 ? 'md:[&>figure]:order-first' : ''}`}
              >
                <div>
                  <p className="font-mono text-sm text-caramelo">
                    {String(indice + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-3 font-display text-display-md text-tinta">{tratamento.titulo}</h3>
                  <p className="mt-4 max-w-lg text-tinta-suave">{tratamento.resumo}</p>

                  {tratamento.indicacoes && tratamento.indicacoes.length > 0 && (
                    <ul className="mt-6 space-y-2">
                      {tratamento.indicacoes.map((indicacao) => (
                        <li key={indicacao.texto} className="flex gap-3 text-sm text-tinta-suave">
                          <span aria-hidden className="mt-2 h-px w-5 shrink-0 bg-caramelo" />
                          {indicacao.texto}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <figure className="relative aspect-[4/3] overflow-hidden rounded-lg bg-areia">
                  {imagem?.url && (
                    <Image
                      src={imagem.url}
                      alt={imagem.alt || tratamento.titulo}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                      loading={indice === 0 ? 'eager' : 'lazy'}
                    />
                  )}
                </figure>
              </article>
            </AnimatedContent>
            )
          })}
        </div>
      </div>
    </section>
  )
}
