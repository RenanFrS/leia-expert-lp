'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Revelar } from '@/components/Revelar'
import { pushEvento } from '@/lib/analytics'

import type { Faq } from '@/payload-types'

export function Duvidas({ perguntas }: { perguntas: Faq[] }) {
  if (!perguntas.length) return null

  return (
    <section id="duvidas" className="py-24 md:py-32">
      <div className="container grid gap-12 md:grid-cols-[0.8fr_1.2fr]">
        <Revelar>
          <p className="text-eyebrow font-mono uppercase text-caramelo">Duvidas frequentes</p>
          <h2 className="mt-4 font-display text-display-lg text-tinta">Antes de agendar</h2>
        </Revelar>

        <Revelar atraso={100}>
          <Accordion
            type="single"
            collapsible
            onValueChange={(valor) => valor && pushEvento('abrir_faq', { pergunta: valor })}
          >
            {perguntas.map((item) => (
              <AccordionItem key={item.id} value={String(item.pergunta)}>
                <AccordionTrigger>{item.pergunta}</AccordionTrigger>
                <AccordionContent>{item.resposta}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Revelar>
      </div>
    </section>
  )
}
