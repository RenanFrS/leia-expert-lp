import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { z } from 'zod'
import config from '@payload-config'

const esquema = z.object({
  nome: z.string().min(2, 'Informe seu nome.').max(120),
  email: z.string().email('E mail invalido.').optional().or(z.literal('')),
  whatsapp: z
    .string()
    .min(10, 'Informe um WhatsApp valido com DDD.')
    .max(20)
    .refine((valor) => valor.replace(/\D/g, '').length >= 10, 'Informe um WhatsApp valido com DDD.'),
  motivo: z.enum(['queda-capilar', 'alopecia', 'caspa-dermatite', 'tricoscopia', 'outro']),
  mensagem: z.string().max(1200).optional().or(z.literal('')),
  origem: z.record(z.string()).optional(),
})

// Limite simples por IP, o suficiente para conter envio automatizado.
const janela = new Map<string, { contagem: number; ate: number }>()
const LIMITE = 5
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

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'desconhecido'

  if (excedeuLimite(ip)) {
    return NextResponse.json(
      { erro: 'Muitas tentativas seguidas. Tente de novo em alguns minutos.' },
      { status: 429 },
    )
  }

  let corpo: unknown
  try {
    corpo = await request.json()
  } catch {
    return NextResponse.json({ erro: 'Requisicao invalida.' }, { status: 400 })
  }

  const resultado = esquema.safeParse(corpo)
  if (!resultado.success) {
    return NextResponse.json(
      { erro: resultado.error.issues[0]?.message || 'Confira os campos e tente de novo.' },
      { status: 422 },
    )
  }

  try {
    const payload = await getPayload({ config })
    await payload.create({
      collection: 'leads',
      // A colecao fecha o create para REST e GraphQL. Esta rota e a unica porta
      // de entrada, ja validada pelo Zod e pelo limite por IP acima, entao passa
      // por cima do access control de proposito.
      overrideAccess: true,
      data: {
        ...resultado.data,
        email: resultado.data.email || undefined,
        mensagem: resultado.data.mensagem || undefined,
        status: 'novo',
      },
    })

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (falha) {
    console.error('Falha ao gravar lead', falha)
    return NextResponse.json(
      { erro: 'Nao foi possivel enviar agora. Chame a clinica pelo WhatsApp.' },
      { status: 500 },
    )
  }
}
