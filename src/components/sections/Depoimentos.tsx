import { Star } from 'lucide-react'
import { Revelar } from '@/components/Revelar'
import { AnimatedContent } from '@/components/ui/animated-content'
import type { Depoimento } from '@/payload-types'

export function Depoimentos({ depoimentos }: { depoimentos: Depoimento[] }) {
  if (!depoimentos.length) return null

  return (
    <section className="border-y border-tinta/10 bg-areia py-24">
      <div className="container">
        <Revelar>
          {/* Sobre a areia o caramelo cheio nao alcanca contraste, entao aqui escurece. */}
          <p className="text-eyebrow font-mono uppercase text-cacau-escuro">Quem ja tratou</p>
          <h2 className="mt-4 font-display text-display-lg text-tinta">Em primeira pessoa</h2>
        </Revelar>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {depoimentos.map((depoimento, indice) => (
            <AnimatedContent key={depoimento.id} delay={indice * 0.09} distance={60} scale={0.96} className="h-full">
              <blockquote className="h-full rounded-lg border border-tinta/10 bg-porcelana p-7">
                <div className="flex" aria-label={`Nota ${depoimento.nota} de 5`}>
                  {Array.from({ length: depoimento.nota }).map((_, posicao) => (
                    <Star key={posicao} className="h-4 w-4 fill-caramelo text-caramelo" aria-hidden />
                  ))}
                </div>
                <p className="mt-5 text-tinta-suave">{depoimento.texto}</p>
                <footer className="mt-6 font-display text-sm text-tinta">{depoimento.nome}</footer>
              </blockquote>
            </AnimatedContent>
          ))}
        </div>
      </div>
    </section>
  )
}
