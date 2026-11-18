import type { Payload } from 'payload'

import type { Clinica, Media, Tratamento } from '@/payload-types'

/**
 * Conteudo em avaliacao: troca que a equipe ainda vai aprovar. Aparece nas
 * previas da Vercel e no `pnpm dev`, e nunca no site no ar.
 *
 * Existe porque o banco e um so. A previa de uma branch le o mesmo Neon da
 * producao, entao trocar um video pelo painel troca tambem no site no ar, em ate
 * 5 minutos, antes de alguem aprovar. Com a troca aqui, o painel continua com o
 * que esta no ar e a previa monta a pagina com a troca por cima.
 *
 * Quando aprovarem, grave cada item no painel do jeito descrito acima da lista e
 * tire o item dela. A producao ignora este arquivo mesmo depois do merge, entao
 * quem publica a troca e a gravacao no painel, e nao o deploy.
 */

/**
 * Previa da Vercel ou `pnpm dev`. Em producao e no `pnpm start` local e falso.
 * A comparacao e com `preview`, e nao "diferente de production", para que uma
 * variavel ausente nunca ligue a troca no site no ar.
 */
export const mostraEmAvaliacao =
  process.env.VERCEL_ENV === 'preview' || process.env.NODE_ENV === 'development'

type TrocaDeMidia = {
  /** slug do tratamento */
  slug: string
  /** nome do arquivo na Media; ele ja precisa estar la */
  arquivo: string
  /** segundo do quadro do cartao do topo, o mesmo do campo `quadroDoCartao` */
  quadroDoCartao?: number
}

/**
 * Para aprovar: no painel, em Tratamentos, abra o tratamento do slug, troque a
 * midia pelo arquivo e grave o quadro do cartao.
 */
export const TROCAS_DE_MIDIA: TrocaDeMidia[] = [
  // Pedido de 18/11/2026: o calvo.mp4 mostrava cabelo cheio, sem falha nenhuma.
  // O calvo-nuca.mp4 e a coroa rala vista de cima, no centro do quadro, e aos 7 s
  // ela aparece inteira, ja sem as maos na frente.
  { slug: 'alopecia-calvicie', arquivo: 'calvo-nuca.mp4', quadroDoCartao: 7 },
]

/**
 * Para aprovar: no painel, em Configuracoes, Clinica, aba Hero, acrescente o
 * arquivo no fim do painel. O fim, porque o primeiro arquivo e o LCP.
 */
export const VIDEOS_A_MAIS_NO_HERO: string[] = ['testa-entradas.mp4']

const idDaMidia = (arquivo: number | Media) => (typeof arquivo === 'object' ? arquivo.id : arquivo)

/**
 * Devolve os tratamentos e o painel do hero com a troca por cima, quando a
 * pagina e de previa. Fora dela devolve o que recebeu, sem consulta nenhuma.
 */
export async function aplicarEmAvaliacao(
  payload: Payload,
  tratamentos: Tratamento[],
  heroPainel: Clinica['heroPainel'],
): Promise<{ tratamentos: Tratamento[]; heroPainel: Clinica['heroPainel'] }> {
  const arquivos = [...TROCAS_DE_MIDIA.map((troca) => troca.arquivo), ...VIDEOS_A_MAIS_NO_HERO]
  if (!mostraEmAvaliacao || arquivos.length === 0) return { tratamentos, heroPainel }

  const { docs } = await payload.find({
    collection: 'media',
    where: { filename: { in: arquivos } },
    limit: arquivos.length,
    depth: 0,
  })
  const porArquivo = new Map(docs.map((midia) => [midia.filename, midia]))

  // Arquivo que sumiu da Media nao derruba a pagina: a previa so deixa de
  // mostrar a troca. O aviso diz qual foi.
  for (const arquivo of arquivos) {
    if (!porArquivo.has(arquivo)) console.warn(`[em-avaliacao] ${arquivo} nao esta na Media`)
  }

  const tratamentosComTroca = tratamentos.map((tratamento) => {
    const troca = TROCAS_DE_MIDIA.find((item) => item.slug === tratamento.slug)
    const midia = troca ? porArquivo.get(troca.arquivo) : undefined
    if (!troca || !midia) return tratamento
    return {
      ...tratamento,
      imagem: midia,
      quadroDoCartao: troca.quadroDoCartao ?? tratamento.quadroDoCartao,
    }
  })

  const painel = heroPainel ?? []
  const noPainel = new Set(painel.map((item) => idDaMidia(item.arquivo)))
  const aMais = VIDEOS_A_MAIS_NO_HERO.flatMap((arquivo) => {
    const midia = porArquivo.get(arquivo)
    return midia && !noPainel.has(midia.id) ? [{ id: `em-avaliacao-${midia.id}`, arquivo: midia }] : []
  })

  return {
    tratamentos: tratamentosComTroca,
    heroPainel: aMais.length > 0 ? [...painel, ...aMais] : heroPainel,
  }
}
