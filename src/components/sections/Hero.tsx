import { ArrowUpRight, Star } from 'lucide-react'
import { BotaoAgendar } from '@/components/BotaoAgendar'
import { Revelar } from '@/components/Revelar'
import { MidiaRotativa } from '@/components/ui/midia-rotativa'
import type { Clinica } from '@/payload-types'

type Props = {
  nome: string
  chamada?: string | null
  motivos: { titulo: string; slug: string }[]
  painel?: Clinica['heroPainel']
  blocoEsquerda?: Clinica['heroBlocoEsquerda']
  blocoDireita?: Clinica['heroBlocoDireita']
  intervalo?: number | null
}

/**
 * Bloco menor do canto superior direito. Sao dois, e cada um aceita mais de um
 * arquivo, alternando em esmaecimento como o painel grande.
 */
function BlocoMenor({
  itens,
  intervalo,
}: {
  itens?: Clinica['heroBlocoEsquerda']
  intervalo?: number | null
}) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-areia lg:aspect-auto lg:h-[168px] lg:w-[156px]">
      <MidiaRotativa itens={itens} intervalo={intervalo} sizes="(max-width: 1024px) 45vw, 160px" />
    </div>
  )
}

export function Hero({ nome, chamada, motivos, painel, blocoEsquerda, blocoDireita, intervalo }: Props) {
  return (
    <section id="topo" className="pt-28 pb-16 md:pt-32 md:pb-20">
      <div className="container">
        {/*
          A silhueta do hero e um painel de midia com tres recortes. Cada recorte
          e um bloco de fundo porcelana com um canto arredondado voltado para
          dentro, o que faz a midia parecer entalhada em volta do conteudo.

          No celular isso nao se sustenta, porque nao sobra largura para conteudo
          ao lado de midia. Ali a pilha e direta: titulo, painel, blocos menores
          e o CTA, na ordem do print.
        */}
        <div className="relative isolate flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-0">
          <div className="lg:max-w-[46rem] lg:justify-self-start lg:rounded-br-[28px] lg:bg-porcelana lg:pb-9 lg:pr-12">
            <Revelar>
              <p className="text-eyebrow font-mono uppercase text-caramelo">Tricologia clinica</p>
              <h1 className="mt-5 font-display text-display-xl text-tinta">
                Antes de tratar o cabelo, a gente entende o couro cabeludo.
              </h1>
              <p className="mt-5 max-w-lg text-lg text-tinta-suave">
                {chamada ||
                  `Na ${nome}, cada protocolo comeca por um exame de tricoscopia. O tratamento certo depende do diagnostico certo.`}
              </p>

              <div className="mt-6 flex items-center gap-2">
                <div className="flex" aria-hidden>
                  {Array.from({ length: 5 }).map((_, indice) => (
                    <Star key={indice} className="h-4 w-4 fill-caramelo text-caramelo" />
                  ))}
                </div>
                <span className="text-sm text-tinta-suave">Avaliacoes reais de pacientes no Google</span>
              </div>
            </Revelar>
          </div>

          {/*
            O painel e o LCP da pagina. No celular ele entra na pilha; no lg vira
            o fundo que os recortes entalham.
          */}
          <div className="order-2 h-[300px] overflow-hidden rounded-[28px] bg-areia sm:h-[380px] lg:absolute lg:inset-0 lg:-z-10 lg:order-none lg:h-auto">
            <MidiaRotativa
              itens={painel}
              intervalo={intervalo}
              prioridade
              sizes="(max-width: 1024px) 100vw, 1200px"
            />
          </div>

          <div className="order-3 grid grid-cols-2 gap-4 lg:order-none lg:flex lg:gap-5 lg:self-start lg:rounded-bl-[28px] lg:bg-porcelana lg:pb-9 lg:pl-12">
            <BlocoMenor itens={blocoEsquerda} intervalo={intervalo} />
            <BlocoMenor itens={blocoDireita} intervalo={intervalo} />
          </div>

          {/* Faixa vazia: e por ela que o painel aparece entre os recortes. */}
          <div className="hidden lg:col-span-2 lg:block lg:h-[260px]" />

          <div className="order-4 lg:order-none lg:justify-self-start lg:rounded-tr-[28px] lg:bg-porcelana lg:pr-12 lg:pt-9">
            <BotaoAgendar local="hero" size="lg" especular className="w-full lg:w-auto">
              Agendar avaliacao
              <ArrowUpRight className="h-4 w-4" />
            </BotaoAgendar>
          </div>
        </div>

        {/*
          As pilulas substituem o antigo CTA secundario de ver tratamentos: cada
          uma leva direto para o tratamento correspondente, o que ainda cria link
          interno para as ancoras da pagina.
        */}
        {motivos.length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-2">
            {motivos.map((motivo) => (
              <li key={motivo.slug}>
                <a
                  href={`#${motivo.slug}`}
                  className="inline-flex rounded-full border border-tinta/12 bg-areia/50 px-4 py-2 text-sm text-tinta-suave transition-colors hover:border-cacau hover:text-cacau"
                >
                  {motivo.titulo}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
