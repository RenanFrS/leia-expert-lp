import Image from 'next/image'
import { BadgeCheck } from 'lucide-react'

import { BotaoWhatsapp } from '@/components/BotaoWhatsapp'
import { Revelar } from '@/components/Revelar'
import { AnimatedContent } from '@/components/ui/animated-content'
import { CamadaParallax } from '@/components/ui/camada-parallax'
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
  credenciais?: Clinica['credenciais']
  whatsapp: string
  mensagemWhatsapp?: string | null
}

/**
 * Segue a forma do `about14` do shadcnblocks, escolhido pelo cliente. Ele e Pro
 * e o codigo nao e publico, entao o que existe aqui e reconstrucao com os
 * primitivos do projeto a partir da referencia visual, nao codigo copiado.
 *
 * O conteudo inteiro vem da aba **Sobre** da global Clinica e fala em primeira
 * pessoa. O campo `sobre` e so desta secao: quem alimenta a descricao do
 * `MedicalClinic` nos dados estruturados e a `chamada`, que continua
 * institucional.
 *
 * **A secao foi remontada a pedido do time de trafego**, que pediu para
 * valorizar a apresentacao da profissional. O que mudou e por que:
 *
 * - **O rotulo virou eyebrow acima do titulo.** Ele ficava enterrado dentro da
 *   grade, na primeira coluna, e era o unico lugar do site onde o eyebrow nao
 *   abria a secao. Agora segue o padrao das outras.
 * - **O resumo virou paragrafo de abertura.** Em cinza pequeno, na coluna
 *   estreita, ele lia como nota de rodape, quando e a frase que apresenta a
 *   Leia.
 * - **A assinatura virou cartao.** Retrato, nome, credencial e formacao juntos
 *   num bloco sobre areia, que e o que sustenta autoridade numa pagina de
 *   clinica. Antes eram um retrato de 44px e duas linhas soltas.
 * - **A foto larga ganhou parallax**, o mesmo `CamadaParallax` que a foto do
 *   cartao de tratamento ja usa. Sem dependencia nova.
 * - **Entrou CTA de WhatsApp.** A secao terminava sem saida nenhuma, no meio da
 *   pagina.
 */
export function Sobre({
  rotulo,
  resumo,
  texto,
  foto,
  retrato,
  nomeProfissional,
  credencial,
  credenciais,
  whatsapp,
  mensagemWhatsapp,
}: Props) {
  // Sem texto a secao viraria uma faixa vazia com uma foto solta, entao ela
  // simplesmente nao aparece ate o painel estar preenchido.
  if (!texto && !resumo) return null

  const imagem = midia(foto)
  const avatar = midia(retrato)
  const formacao = credenciais || []

  return (
    <section id="sobre" className="py-24 md:py-32">
      <div className="container">
        <Revelar className="max-w-3xl">
          {rotulo && <p className="text-eyebrow font-mono uppercase text-caramelo">{rotulo}</p>}

          <h2 className="mt-4 font-display text-display-lg text-tinta">Sobre mim</h2>

          {resumo && <p className="mt-5 max-w-2xl text-lg text-tinta-suave">{resumo}</p>}
        </Revelar>

        <AnimatedContent distance={40} scale={0.98}>
          {/* O `preencher` do parallax torna a camada absoluta e mais alta que a
              figura, e essa sobra e o que impede o deslocamento de abrir fresta
              nas pontas. Por isso a figura precisa do `relative overflow-hidden`
              e a imagem entra com `fill`. */}
          <figure className="relative mt-10 aspect-[16/10] overflow-hidden rounded-lg bg-areia md:mt-14 md:aspect-[21/9]">
            {imagem?.url && (
              <CamadaParallax preencher distancia="8%">
                <Image
                  src={imagem.url}
                  alt={imagem.alt || `${nomeProfissional || 'A profissional'} atendendo na clínica`}
                  fill
                  sizes="(max-width: 1200px) 100vw, 1200px"
                  className="object-cover"
                  style={enquadramento(imagem)}
                />
              </CamadaParallax>
            )}
          </figure>
        </AnimatedContent>

        <AnimatedContent delay={0.1} distance={40}>
          <div className="mt-12 grid gap-10 md:mt-16 md:grid-cols-5 md:gap-x-12">
            {/* Cartao da assinatura. Sobre areia o acento e o cacau-escuro em
                texto pequeno, pela regra de contraste da paleta. */}
            {nomeProfissional && (
              <div className="rounded-lg bg-areia p-7 md:col-span-2 md:self-start">
                <figure className="flex items-center gap-4">
                  {avatar?.url && (
                    <Image
                      src={avatar.url}
                      alt={avatar.alt || nomeProfissional}
                      width={64}
                      height={64}
                      sizes="64px"
                      className="h-16 w-16 rounded-full object-cover"
                      style={enquadramento(avatar)}
                    />
                  )}
                  <figcaption>
                    <p className="font-display text-lg text-tinta">{nomeProfissional}</p>
                    {credencial && (
                      <p className="mt-1 text-sm text-cacau-escuro">{credencial}</p>
                    )}
                  </figcaption>
                </figure>

                {formacao.length > 0 && (
                  <ul className="mt-6 space-y-3 border-t border-cacau/20 pt-6">
                    {formacao.map((item) => (
                      <li key={item.id || item.texto} className="flex gap-3 text-sm text-tinta-suave">
                        <BadgeCheck
                          aria-hidden
                          className="mt-0.5 h-4 w-4 shrink-0 text-cacau-escuro"
                        />
                        {item.texto}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="md:col-span-3">
              {/* O leading do token display-md e 1.12, apertado demais para um
                  paragrafo de tres linhas. */}
              {texto && (
                <p className="font-display text-display-md leading-[1.25] text-tinta">{texto}</p>
              )}

              <BotaoWhatsapp
                numero={whatsapp}
                mensagem={mensagemWhatsapp}
                local="sobre"
                className="mt-8 rounded-full"
              >
                Falar comigo no WhatsApp
              </BotaoWhatsapp>
            </div>
          </div>
        </AnimatedContent>
      </div>
    </section>
  )
}
