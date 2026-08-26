import { readFile, stat } from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Sobe um arquivo que esta em `public/` para a colecao Media, e opcionalmente
 * ja liga ele no painel do hero.
 *
 * Existe como rota, e nao como script, pelo mesmo motivo do `seed` e do
 * `gerar-tipos`: o CLI do Payload nao carrega o config neste projeto, e dentro
 * do Next ele carrega sem problema.
 *
 * Ela tambem resolve o tamanho de graca. Pela Local API o arquivo vai como
 * buffer, em processo, sem atravessar corpo de requisicao nenhum, entao um video
 * de 25 MB nao esbarra em limite de body do Next nem do Payload.
 *
 * Uso: com o pnpm dev no ar,
 * `/api/dev/subir-midia?arquivo=videos/hero.mp4&alt=Descricao&hero=1`.
 * Fora de desenvolvimento a rota responde 404.
 */

const PASTA_PUBLICA = path.join(process.cwd(), 'public')

const TIPOS: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
}

export async function GET(requisicao: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ erro: 'Disponível apenas em desenvolvimento.' }, { status: 404 })
  }

  const parametros = new URL(requisicao.url).searchParams
  const relativo = parametros.get('arquivo')
  const alt = parametros.get('alt')
  const ligarNoHero = parametros.get('hero') === '1'
  const forcar = parametros.get('forcar') === '1'

  if (!relativo) {
    return NextResponse.json(
      { erro: 'Informe o parâmetro arquivo, com o caminho dentro de public. Exemplo: videos/hero.mp4' },
      { status: 400 },
    )
  }

  // O `alt` é obrigatório na coleção Media, então pedir aqui evita um erro de
  // validação bem mais adiante, já com o arquivo enviado ao Cloudinary.
  if (!alt) {
    return NextResponse.json(
      { erro: 'Informe o parâmetro alt. Ele é obrigatório na Mídia e descreve o arquivo para leitor de tela.' },
      { status: 400 },
    )
  }

  // Rota de desenvolvimento continua sendo rota: caminho que sobe de pasta e
  // recusado, senao o parametro viraria leitura de qualquer arquivo da maquina.
  const caminho = path.resolve(PASTA_PUBLICA, relativo)
  if (caminho !== PASTA_PUBLICA && !caminho.startsWith(PASTA_PUBLICA + path.sep)) {
    return NextResponse.json({ erro: 'O caminho precisa ficar dentro de public.' }, { status: 400 })
  }

  const informacao = await stat(caminho).catch(() => null)
  if (!informacao?.isFile()) {
    return NextResponse.json({ erro: `Arquivo não encontrado: ${relativo}` }, { status: 404 })
  }

  const nome = path.basename(caminho)
  const extensao = path.extname(nome).toLowerCase()
  const mimetype = TIPOS[extensao]

  // O mimeType e quem faz o adaptador escolher entre /image/upload/ e
  // /video/upload/ na URL. Chutar aqui daria 404 no arquivo inteiro, entao a
  // rota prefere recusar extensao que ela nao conhece.
  if (!mimetype) {
    return NextResponse.json(
      { erro: `Extensão não reconhecida: ${extensao}. Aceita: ${Object.keys(TIPOS).join(', ')}` },
      { status: 400 },
    )
  }

  const payload = await getPayload({ config })

  const existente = await payload.find({
    collection: 'media',
    where: { filename: { equals: nome } },
    limit: 1,
    overrideAccess: true,
  })

  let documento = existente.docs[0]
  let acao: 'reaproveitado' | 'criado' | 'resubstituido' | 'alt atualizado' = 'reaproveitado'

  // Reaproveitar sem olhar o alt deixaria uma descricao errada gravada para
  // sempre, ja que o caminho normal seria subir de novo. Aqui a segunda chamada
  // com outro alt corrige o texto sem reenviar os bytes.
  if (documento && !forcar && documento.alt !== alt) {
    documento = await payload.update({
      collection: 'media',
      id: documento.id,
      data: { alt },
      overrideAccess: true,
    })
    acao = 'alt atualizado'
  }

  if (documento && forcar) {
    await payload.delete({ collection: 'media', id: documento.id, overrideAccess: true })
    documento = undefined as unknown as typeof documento
    acao = 'resubstituido'
  }

  if (!documento) {
    const dados = await readFile(caminho)

    documento = await payload.create({
      collection: 'media',
      data: { alt },
      file: { data: dados, name: nome, mimetype, size: dados.length },
      overrideAccess: true,
    })

    if (acao !== 'resubstituido') acao = 'criado'
  }

  let painel: string | null = null

  if (ligarNoHero) {
    // Troca o painel inteiro pelo arquivo. A midia que estava la nao e apagada,
    // so deixa de estar ligada, e continua na biblioteca.
    await payload.updateGlobal({
      slug: 'clinica',
      data: { heroPainel: [{ arquivo: documento.id }] },
      overrideAccess: true,
    })
    painel = 'heroPainel passou a ter só este arquivo'
  }

  return NextResponse.json({
    ok: true,
    acao,
    id: documento.id,
    filename: documento.filename,
    mimeType: documento.mimeType,
    tamanho: documento.filesize,
    url: documento.url,
    painel,
  })
}
