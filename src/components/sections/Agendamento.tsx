'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ArrowUpRight, CalendarCheck, ChevronDown, Loader2 } from 'lucide-react'
import { BotaoWhatsapp } from '@/components/BotaoWhatsapp'
import { Button } from '@/components/ui/button'
import { CartaoVidro } from '@/components/ui/cartao-vidro'
import { VideoFundo } from '@/components/ui/video-fundo'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Revelar } from '@/components/Revelar'
import { AnimatedContent } from '@/components/ui/animated-content'
import { lerUtms, pushEvento, registrarLead } from '@/lib/analytics'
import { enquadramento, formatarWhatsapp, midia } from '@/lib/utils'
import type { Clinica } from '@/payload-types'

const motivos = [
  { valor: 'queda-capilar', rotulo: 'Queda capilar' },
  { valor: 'alopecia', rotulo: 'Alopecia' },
  { valor: 'caspa-dermatite', rotulo: 'Caspa e dermatite' },
  { valor: 'tricoscopia', rotulo: 'Consulta e tricoscopia' },
  { valor: 'outro', rotulo: 'Outro assunto' },
]

type Estado = 'parado' | 'enviando' | 'enviado' | 'erro'

type Unidade = NonNullable<Clinica['unidades']>[number]

type Props = {
  googleAdsId?: string | null
  googleAdsLabel?: string | null
  whatsapp: string
  mensagemWhatsapp?: string | null
  email?: string | null
  unidade?: Unidade
  foto?: Clinica['fotoAgendamento']
}

/** Marca de campo obrigatorio. Fica escondida do leitor de tela porque o
 *  `required` do proprio campo ja anuncia isso, e repetir viraria ruido. */
const Obrigatorio = () => (
  <span aria-hidden className="text-caramelo-claro">
    {' '}
    *
  </span>
)

const Rotulo = ({ children }: { children: React.ReactNode }) => (
  <span className="text-eyebrow font-mono uppercase text-neutro">{children}</span>
)

export function Agendamento({
  googleAdsId,
  googleAdsLabel,
  whatsapp,
  mensagemWhatsapp,
  email,
  unidade,
  foto,
}: Props) {
  const [estado, setEstado] = useState<Estado>('parado')
  const [erro, setErro] = useState<string | null>(null)
  const [tocado, setTocado] = useState(false)
  const [autorizado, setAutorizado] = useState(false)

  const imagem = midia(foto)

  const aoInteragir = () => {
    if (tocado) return
    setTocado(true)
    pushEvento('inicio_formulario')
  }

  const enviar = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    setEstado('enviando')
    setErro(null)

    const dados = new FormData(evento.currentTarget)
    const corpo = {
      nome: String(dados.get('nome') || ''),
      email: String(dados.get('email') || ''),
      whatsapp: String(dados.get('whatsapp') || ''),
      motivo: String(dados.get('motivo') || ''),
      mensagem: String(dados.get('mensagem') || ''),
      origem: lerUtms(),
    }

    try {
      const resposta = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo),
      })

      if (!resposta.ok) {
        const detalhe = await resposta.json().catch(() => null)
        throw new Error(detalhe?.erro || 'Nao foi possivel enviar agora.')
      }

      registrarLead({
        motivo: corpo.motivo,
        googleAdsId: googleAdsId || undefined,
        googleAdsLabel: googleAdsLabel || undefined,
      })
      setEstado('enviado')
    } catch (falha) {
      const mensagem = falha instanceof Error ? falha.message : 'Nao foi possivel enviar agora.'
      setErro(mensagem)
      setEstado('erro')
      pushEvento('erro_formulario', { mensagem })
    }
  }

  return (
    // O `isolate` sustenta o video de fundo: sem contexto de empilhamento proprio,
    // a camada em `-z-10` cai atras do fundo de um ancestral e some. O `bg-cacau`
    // continua valendo como reserva enquanto o arquivo carrega.
    <section id="agendar" className="relative isolate bg-cacau py-24 text-porcelana md:py-32">
      {/* O veu vai em `cacau/85` por conta: sobre o pixel mais claro do arquivo,
          porcelana da 5,6 de contraste e porcelana/85 da 4,6, que e o piso do
          texto corrido. Afrouxar o veu comeca a apagar o corpo do texto no quadro
          claro do video. */}
      <VideoFundo src="/backgrounds/background-agendamento.mp4" />

      <div className="container grid gap-12 lg:grid-cols-5 lg:items-stretch lg:gap-14">
        <div className="relative lg:col-span-3">
          <figure className="relative aspect-[3/5] overflow-hidden rounded-lg bg-cacau-escuro sm:aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[620px]">
            {imagem?.url && (
              <Image
                src={imagem.url}
                alt={imagem.alt || 'Atendimento na clínica'}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
                style={enquadramento(imagem)}
              />
            )}
          </figure>

          <CartaoVidro tom="claro" className="absolute inset-x-4 bottom-4 md:inset-x-8 md:bottom-8">
            <dl className="grid grid-cols-2 gap-5 sm:grid-cols-3">
              {email && (
                <div className="col-span-2 sm:col-span-1">
                  <dt>
                    <Rotulo>E mail</Rotulo>
                  </dt>
                  <dd className="mt-1.5 break-words text-sm">
                    <a href={`mailto:${email}`} className="transition-colors hover:text-cacau">
                      {email}
                    </a>
                  </dd>
                </div>
              )}

              <div>
                <dt>
                  <Rotulo>WhatsApp</Rotulo>
                </dt>
                {/* Texto puro de proposito: abrir conversa e sempre pelo botao
                    abaixo, que e quem grava o evento. */}
                <dd className="mt-1.5 text-sm">{formatarWhatsapp(whatsapp)}</dd>
              </div>

              {unidade?.endereco && (
                <div className="col-span-2 sm:col-span-1">
                  <dt>
                    <Rotulo>Endereço</Rotulo>
                  </dt>
                  <dd className="mt-1.5 whitespace-pre-line text-sm">{unidade.endereco}</dd>
                </div>
              )}
            </dl>

            <div className="mt-5 border-t border-tinta/10 pt-5">
              <BotaoWhatsapp
                numero={whatsapp}
                mensagem={mensagemWhatsapp}
                local="card-agendamento"
                className="w-full"
              >
                Agendar consulta
                <ArrowUpRight className="h-4 w-4" />
              </BotaoWhatsapp>
            </div>
          </CartaoVidro>
        </div>

        <div className="lg:col-span-2 lg:flex lg:flex-col lg:justify-center">
          {estado === 'enviado' ? (
            <div>
              <h2 className="font-display text-display-md">Recebemos seu contato</h2>
              <p className="mt-4 text-porcelana/85">
                A equipe responde pelo WhatsApp em horário comercial para confirmar o melhor dia da sua
                consulta.
              </p>
            </div>
          ) : (
            <>
              <Revelar>
                {/* Sobre o cacau so tom claro alcanca contraste, entao o eyebrow perde o caramelo. */}
                <p className="text-eyebrow font-mono uppercase text-porcelana">Agendamento</p>
                <h2 className="mt-4 font-display text-display-lg">Comece pela consulta</h2>
                <p className="mt-4 text-porcelana/85">
                  Preencha os campos e a equipe entra em contato para encontrar o melhor horário. Sem
                  compromisso de fechar tratamento.
                </p>
              </Revelar>

              <AnimatedContent delay={0.1} distance={60} scale={0.96}>
                {/* A cor dos rotulos vem daqui. O Label nao fixa cor porque o
                    formulario cai sobre cacau, onde o cinza sumia. */}
                <form
                  onSubmit={enviar}
                  onFocus={aoInteragir}
                  noValidate
                  className="mt-8 space-y-5 text-porcelana/80"
                >
                  {/* Duas colunas nos campos curtos. Abaixo do `sm` a coluna e
                      estreita demais e eles voltam a empilhar. */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="nome">
                        Nome completo
                        <Obrigatorio />
                      </Label>
                      <Input id="nome" name="nome" required autoComplete="name" placeholder="Como podemos te chamar" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">E mail</Label>
                      <Input id="email" name="email" type="email" autoComplete="email" placeholder="voce@email.com" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">
                        WhatsApp
                        <Obrigatorio />
                      </Label>
                      <Input
                        id="whatsapp"
                        name="whatsapp"
                        required
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="(11) 90000-0000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="motivo">
                        Sobre o que quer falar
                        <Obrigatorio />
                      </Label>
                      {/* `appearance-none` mais a seta desenhada: a seta nativa
                          muda de desenho em cada sistema e destoava do resto do
                          formulario. O `pointer-events-none` no icone mantem o
                          clique chegando no select. */}
                      <div className="relative">
                        <select
                          id="motivo"
                          name="motivo"
                          required
                          defaultValue=""
                          className="flex h-14 w-full appearance-none rounded-xl border border-tinta/15 bg-porcelana px-5 pr-12 text-base text-tinta focus-visible:border-cacau focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cacau/20"
                        >
                          <option value="" disabled>
                            Selecione
                          </option>
                          {motivos.map((motivo) => (
                            <option key={motivo.valor} value={motivo.valor}>
                              {motivo.rotulo}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          aria-hidden
                          className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-neutro"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mensagem">Conte um pouco do seu caso</Label>
                    <Textarea
                      id="mensagem"
                      name="mensagem"
                      rows={5}
                      placeholder="Descrição do seu caso ou dúvidas sobre o tratamento"
                    />
                  </div>

                  <div className="flex items-start gap-3">
                    {/* Marcado, o cacau padrao sumiria contra a secao, entao aqui ele inverte. */}
                    <Checkbox
                      id="autorizacao"
                      checked={autorizado}
                      onCheckedChange={(valor) => setAutorizado(valor === true)}
                      className="mt-0.5 h-5 w-5 border-porcelana/55 data-[state=checked]:border-porcelana data-[state=checked]:bg-porcelana data-[state=checked]:text-cacau-escuro"
                    />
                    <Label id="rotulo-autorizacao" htmlFor="autorizacao" className="text-porcelana/85">
                      Autorizo o contato pelo WhatsApp e o uso dos meus dados para agendamento.
                    </Label>
                  </div>

                  {erro && (
                    <p
                      role="alert"
                      className="rounded-xl bg-porcelana px-4 py-3 text-sm font-medium text-cacau-escuro"
                    >
                      {erro}
                    </p>
                  )}

                  {/* O botao so libera com a autorizacao marcada. O
                      aria-describedby aponta para o rotulo dela, senao o botao
                      desabilitado nao explica o proprio motivo. */}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-4 pt-1">
                    <Button
                      type="submit"
                      variant="destaque"
                      size="lg"
                      especular
                      disabled={!autorizado || estado === 'enviando'}
                      aria-describedby="rotulo-autorizacao"
                      className="w-full rounded-full sm:w-auto"
                    >
                      {estado === 'enviando' ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Enviando
                        </>
                      ) : (
                        <>
                          <CalendarCheck className="h-5 w-5" />
                          Enviar e agendar
                        </>
                      )}
                    </Button>

                    <p className="max-w-xs text-sm text-porcelana/70">
                      Retornamos pelo WhatsApp em horário comercial.
                    </p>
                  </div>

                </form>
              </AnimatedContent>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
