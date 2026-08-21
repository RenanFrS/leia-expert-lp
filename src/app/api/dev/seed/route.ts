import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

import { popularConteudo } from '@/lib/seed'

/**
 * Popula o conteudo inicial da landing.
 *
 * Existe como rota, e nao como script, porque o config do Payload so carrega
 * dentro do Next. Fora dele o `payload/dist/bin/loadEnv.js` quebra na interop
 * com o @next/env, o mesmo motivo da rota que gera os tipos.
 *
 * Uso: com o pnpm dev no ar, acesse /api/dev/seed. Pode repetir a vontade, o
 * que ja existe e atualizado. Fora de desenvolvimento a rota responde 404.
 */
export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ erro: 'Disponível apenas em desenvolvimento.' }, { status: 404 })
  }

  const payload = await getPayload({ config })
  const registro = await popularConteudo(payload)

  return NextResponse.json({
    ok: true,
    registro,
    aviso: 'Revise métricas, unidades e depoimentos antes de publicar.',
  })
}
