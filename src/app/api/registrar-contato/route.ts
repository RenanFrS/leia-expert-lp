import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { z } from 'zod'
import config from '@payload-config'

/**
 * Grava o clique que abriu o WhatsApp, com a UTM da visita.
 *
 * Substitui o que a rota do formulario fazia pela origem: com o formulario fora
 * do ar, esta e a unica porta que liga campanha a contato no painel.
 *
 * O corpo chega por `navigator.sendBeacon`, entao a resposta nao e lida por
 * ninguem: o navegador ja esta saindo da pagina para o WhatsApp quando ela
 * volta. Por isso a rota nunca devolve erro que o site precise tratar.
 *
 * **O nome dela nao pode ser o slug da colecao, e isso custou uma investigacao.**
 * O REST do Payload responde em `/api/<colecao>`, por um catch all em
 * `(payload)/api/[...slug]`. Segmento estatico ganha de catch all no Next, entao
 * um arquivo em `app/api/contatos/route.ts` **sombreia** o endpoint da colecao:
 * como ele so exporta POST, todo GET, PATCH e DELETE daquela colecao passa a
 * responder **405**, e o painel perde as mutacoes dela.
 *
 * Medido: com a rota chamada `contatos`, `GET /api/contatos` devolvia 405,
 * enquanto `/api/galeria` devolvia 200 e `/api/leads` devolvia 403, que e o
 * certo para colecao fechada. **A rota antiga do formulario tinha esse mesmo
 * defeito**, em `/api/leads`, e ninguem notou porque lead quase nunca era
 * editado pelo painel.
 */

const esquema = z.object({
  local: z.string().min(1).max(60),
  origem: z.record(z.string().max(200)).optional(),
})

/*
  Limite por IP, na mesma forma da rota de leads. O teto e mais alto porque log
  de clique e naturalmente mais frequente que envio de formulario: uma pessoa
  pode abrir o WhatsApp pelo header, desistir e abrir de novo pelo rodape.

  O Map vive no processo, entao ele zera a cada cold start. E o suficiente para
  conter automacao boba, que e o que se quer aqui, e nao vale trazer um Redis
  para isso.
*/
const janela = new Map<string, { contagem: number; ate: number }>()
const LIMITE = 20
const JANELA_MS = 10 * 60 * 1000

const excedeuLimite = (ip: string) => {
  const agora = Date.now()
  const registro = janela.get(ip)

  if (!registro || registro.ate < agora) {
    janela.set(ip, { contagem: 1, ate: agora + JANELA_MS })
    return false
  }

  registro.contagem += 1
  return registro.contagem > LIMITE
}

/** Campos que a colecao aceita em `origem`. O resto e descartado. */
const CHAVES_ORIGEM = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'pagina',
] as const

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'desconhecido'

  // 204 e nao 429 de proposito: quem chama e um beacon e nao ha nada do outro
  // lado para reagir ao erro. O que importa e nao gravar.
  if (excedeuLimite(ip)) return new NextResponse(null, { status: 204 })

  let corpo: unknown
  try {
    corpo = await request.json()
  } catch {
    return new NextResponse(null, { status: 204 })
  }

  const resultado = esquema.safeParse(corpo)
  if (!resultado.success) return new NextResponse(null, { status: 204 })

  // A UTM vem da URL da visita, entao e texto de fora: so as chaves conhecidas
  // entram, para o payload nao carregar campo que a colecao nao tem.
  const origem: Record<string, string> = {}
  for (const chave of CHAVES_ORIGEM) {
    const valor = resultado.data.origem?.[chave]
    if (valor) origem[chave] = valor
  }

  try {
    const payload = await getPayload({ config })
    await payload.create({
      collection: 'contatos',
      // A colecao fecha o create para REST e GraphQL. Esta rota e a unica porta,
      // ja passada pelo Zod e pelo limite acima, entao passa por cima do access
      // control de proposito. Mesmo desenho da rota de leads.
      overrideAccess: true,
      data: { local: resultado.data.local, origem },
    })
  } catch (falha) {
    // Engolir a falha e deliberado. O clique no WhatsApp ja aconteceu e a pessoa
    // ja esta saindo da pagina: derrubar isso nao recupera nada e nao ha tela
    // para mostrar erro.
    console.error('Falha ao gravar contato', falha)
  }

  return new NextResponse(null, { status: 204 })
}
