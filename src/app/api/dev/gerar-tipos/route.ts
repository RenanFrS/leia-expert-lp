import { NextResponse } from 'next/server'
import { generateTypes } from 'payload/node'
import config from '@payload-config'

/**
 * Regera src/payload-types.ts.
 *
 * Existe como rota, e nao como script, porque o CLI do Payload nao consegue
 * carregar o config neste projeto: ele usa require, e por esse caminho o Node 22
 * nao resolve import sem extensao. Dentro do Next o mesmo config carrega sem
 * problema, entao a rota e o unico lugar onde a geracao funciona.
 *
 * Uso: com o pnpm dev rodando, acesse /api/dev/gerar-tipos. Fora de
 * desenvolvimento a rota responde 404.
 */
export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ erro: 'Disponivel apenas em desenvolvimento.' }, { status: 404 })
  }

  await generateTypes(await config)
  return NextResponse.json({ ok: true, arquivo: 'src/payload-types.ts' })
}
