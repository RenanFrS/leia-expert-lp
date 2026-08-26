import Image from 'next/image'
import { Revelar } from '@/components/Revelar'
import { AnimatedContent } from '@/components/ui/animated-content'
import { enquadramento, midia } from '@/lib/utils'
import type { Clinica } from '@/payload-types'

type Props = {
  rotulo?: string | null
  resumo?: string | null
  texto?: string | null
  foto?: Clinica['foto']
  retrato?: Clinica['retrato']
  nomeProfissional?: string | null
  credencial?: string | null
}

export function Sobre({ rotulo, resumo, texto, foto, retrato, nomeProfissional, credencial }: Props) {
  // Sem texto a secao viraria uma faixa vazia com uma foto solta, entao ela
  // simplesmente nao aparece ate o painel estar preenchido.
  if (!texto && !resumo) return null

  const imagem = midia(foto)
  const avatar = midia(retrato)

  return (
    <section id="sobre" className="py-24 md:py-32">
      <div className="container">
        <Revelar>
          <h2 className="max-w-3xl font-display text-display-lg text-tinta">Sobre mim</h2>
        </Revelar>

        <AnimatedContent distance={40} scale={0.98}>
          <figure className="relative mt-10 aspect-[16/10] overflow-hidden rounded-lg bg-areia md:mt-14 md:aspect-[21/9]">
            {imagem?.url && (
              <Image
                src={imagem.url}
                alt={imagem.alt || `${nomeProfissional || 'A profissional'} atendendo na clínica`}
                fill
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="object-cover"
                style={enquadramento(imagem)}
              />
            )}
          </figure>
        </AnimatedContent>

        <AnimatedContent delay={0.1} distance={40}>
          <div className="mt-12 grid gap-8 md:mt-16 md:grid-cols-6 md:gap-x-10">
            {rotulo && (
              <p className="text-eyebrow font-mono uppercase text-caramelo md:col-span-1">{rotulo}</p>
            )}

            <div className="md:col-span-2">
              {resumo && <p className="text-sm leading-relaxed text-neutro">{resumo}</p>}

              {nomeProfissional && (
                <figure className={resumo ? 'mt-8 flex items-center gap-3' : 'flex items-center gap-3'}>
                  {avatar?.url && (
                    <Image
                      src={avatar.url}
                      alt={avatar.alt || nomeProfissional}
                      width={44}
                      height={44}
                      sizes="44px"
                      className="h-11 w-11 rounded-full object-cover"
                      style={enquadramento(avatar)}
                    />
                  )}
                  <figcaption>
                    <p className="font-display text-sm text-tinta">{nomeProfissional}</p>
                    {credencial && <p className="mt-0.5 text-xs text-neutro">{credencial}</p>}
                  </figcaption>
                </figure>
              )}
            </div>

            {/* O leading do token display-md e 1.12, apertado demais para um
                paragrafo de tres linhas. */}
            {texto && (
              <p className="font-display text-display-md leading-[1.25] text-tinta md:col-span-3">
                {texto}
              </p>
            )}
          </div>
        </AnimatedContent>
      </div>
    </section>
  )
}
