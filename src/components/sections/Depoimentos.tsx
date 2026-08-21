import Image from 'next/image'
import { BadgeCheck, MoreVertical, Star } from 'lucide-react'
import { Revelar } from '@/components/Revelar'
import { AnimatedContent } from '@/components/ui/animated-content'
import { midia } from '@/lib/utils'
import type { Depoimento } from '@/payload-types'

// Paleta oficial do Google, usada so neste componente para o card lembrar uma
// avaliacao real. Nao entra no tailwind.config.ts porque a paleta do projeto e
// fechada com o cliente e essas cores nao servem para mais nada no site.
const GOOGLE_CINZA_TITULO = '#3c4043'
const GOOGLE_CINZA_TEXTO = '#70757a'
const GOOGLE_BORDA = '#dadce0'
const GOOGLE_OURO = '#fbbc04'
const GOOGLE_ESTRELA_VAZIA = '#e8eaed'

// Paleta de circulo de inicial, no mesmo espirito do fallback do proprio
// Google quando o perfil nao tem foto.
const CORES_INICIAL = ['#F44336', '#E91E63', '#9C27B0', '#3F51B5', '#039BE5', '#00897B', '#43A047', '#FB8C00']

const corInicial = (nome: string) => {
  const soma = [...nome].reduce((total, letra) => total + letra.charCodeAt(0), 0)
  return CORES_INICIAL[soma % CORES_INICIAL.length]
}

function LogoGoogle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" className={className} aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.712A5.41 5.41 0 0 1 3.68 9c0-.593.102-1.17.284-1.712V4.956H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.044l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.956L3.964 7.288C4.672 5.162 6.656 3.58 9 3.58z"
      />
    </svg>
  )
}

export function Depoimentos({ depoimentos }: { depoimentos: Depoimento[] }) {
  if (!depoimentos.length) return null

  return (
    <section className="border-y border-tinta/10 bg-areia py-24">
      <div className="container">
        <Revelar>
          {/* Sobre a areia o caramelo cheio nao alcanca contraste, entao aqui escurece. */}
          <p className="text-eyebrow font-mono uppercase text-cacau-escuro">Quem ja tratou</p>
          <h2 className="mt-4 font-display text-display-lg text-tinta">Em primeira pessoa</h2>
          <div
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-porcelana px-3 py-1.5 text-sm"
            style={{ color: GOOGLE_CINZA_TITULO, boxShadow: `inset 0 0 0 1px ${GOOGLE_BORDA}` }}
          >
            <LogoGoogle className="h-4 w-4" />
            Avaliacoes verificadas no Google
          </div>
        </Revelar>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {depoimentos.map((depoimento, indice) => {
            const avatar = midia(depoimento.foto)
            const fotos = (depoimento.fotos || [])
              .map((item) => midia(item.arquivo))
              .filter((item): item is NonNullable<typeof item> => Boolean(item?.url))

            return (
              <AnimatedContent key={depoimento.id} delay={indice * 0.09} distance={60} scale={0.96} className="h-full">
                <article
                  className="relative h-full rounded-lg bg-white p-6"
                  style={{ boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)' }}
                >
                  <MoreVertical
                    className="absolute right-4 top-4 h-4 w-4"
                    style={{ color: GOOGLE_CINZA_TEXTO }}
                    aria-hidden
                  />

                  <div className="flex items-center gap-3 pr-6">
                    {avatar?.url ? (
                      <Image
                        src={avatar.url}
                        alt={avatar.alt || depoimento.nome}
                        width={40}
                        height={40}
                        sizes="40px"
                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-medium text-white"
                        style={{ backgroundColor: corInicial(depoimento.nome) }}
                        aria-hidden
                      >
                        {depoimento.nome.charAt(0).toUpperCase()}
                      </span>
                    )}

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium" style={{ color: GOOGLE_CINZA_TITULO }}>
                        {depoimento.nome}
                      </p>
                      <p className="flex items-center gap-1 text-xs" style={{ color: GOOGLE_CINZA_TEXTO }}>
                        {depoimento.guiaLocal && (
                          <span className="inline-flex items-center gap-0.5">
                            <BadgeCheck className="h-3 w-3" aria-hidden />
                            Guia Local ·
                          </span>
                        )}
                        {depoimento.avaliacoes ? `${depoimento.avaliacoes} avaliacoes` : 'Avaliacao no Google'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex" aria-label={`Nota ${depoimento.nota} de 5`}>
                      {Array.from({ length: 5 }).map((_, posicao) => (
                        <Star
                          key={posicao}
                          className="h-4 w-4"
                          style={{ color: posicao < depoimento.nota ? GOOGLE_OURO : GOOGLE_ESTRELA_VAZIA }}
                          fill="currentColor"
                          aria-hidden
                        />
                      ))}
                    </div>
                    {depoimento.tempoTexto && (
                      <span className="text-xs" style={{ color: GOOGLE_CINZA_TEXTO }}>
                        {depoimento.tempoTexto}
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-sm leading-relaxed" style={{ color: GOOGLE_CINZA_TITULO }}>
                    {depoimento.texto}
                  </p>

                  {fotos.length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-1.5">
                      {fotos.slice(0, 4).map((foto, posicao) => (
                        <div key={posicao} className="relative aspect-square overflow-hidden rounded-md bg-neutral-100">
                          {/* O filtro acima so estreita o item para Media, nao para url dentro dela. */}
                          <Image src={foto.url as string} alt={foto.alt || ''} fill sizes="80px" className="object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              </AnimatedContent>
            )
          })}
        </div>
      </div>
    </section>
  )
}
