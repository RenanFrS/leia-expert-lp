import { NextResponse } from 'next/server'
import { generateImportMap } from 'payload'
import config from '@payload-config'

/**
 * Regera `src/app/(payload)/admin/importMap.js`.
 *
 * Existe como rota pelo mesmo motivo da que gera os tipos: o CLI do Payload nao
 * carrega o config neste projeto, entao `payload generate:importmap` falha.
 *
 * **E o arquivo precisa ser commitado.** Ele ja derrubou um deploy inteiro por
 * estar no `.gitignore`: na maquina de quem desenvolve o build passa, e a Vercel
 * clona o repositorio sem ele e quebra com `Can't resolve '../importMap.js'` em
 * tres arquivos do painel.
 *
 * Rode sempre que registrar componente custom no painel. Fora de
 * desenvolvimento a rota responde 404.
 */
export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ erro: 'Disponível apenas em desenvolvimento.' }, { status: 404 })
  }

  await generateImportMap(await config, { force: true, log: true })
  return NextResponse.json({ ok: true, arquivo: 'src/app/(payload)/admin/importMap.js' })
}
