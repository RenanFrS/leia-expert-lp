import { FaixaInfinita } from '@/components/ui/faixa-infinita'

const TITULO = 'Problemas capilares que tratamos'

/**
 * Faixa em movimento logo abaixo do hero, com os problemas que a clinica trata.
 * Ocupa o lugar da faixa de numeros, a pedido do cliente, e existe para somar a
 * pagina texto com as palavras que as pessoas procuram. Os termos saem do
 * campo `faixaProblemas` da global Clinica, entao a clinica e a agencia trocam
 * sem deploy.
 *
 * O `h2` fica so para leitor de tela: sem ele a faixa sumiria do sumario da
 * pagina e chegaria como uma lista solta entre o hero e os tratamentos.
 */
export function FaixaProblemas({ termos }: { termos: string[] }) {
  const lista = termos.map((termo) => termo.trim()).filter(Boolean)
  if (!lista.length) return null

  return (
    <section
      aria-labelledby="faixa-problemas-titulo"
      className="border-y border-tinta/10 bg-areia py-8 md:py-10"
    >
      <h2 id="faixa-problemas-titulo" className="sr-only">
        {TITULO}
      </h2>
      <FaixaInfinita termos={lista} rotulo={TITULO} />
    </section>
  )
}
