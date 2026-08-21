import { v2 as cloudinary } from 'cloudinary'
import type { Adapter, GeneratedAdapter } from '@payloadcms/plugin-cloud-storage/types'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

const folder = process.env.CLOUDINARY_FOLDER || 'leia-expert'

/** O Cloudinary trabalha com public_id sem extensao. */
const toPublicId = (filename: string) => `${folder}/${filename.replace(/\.[^.]+$/, '')}`

type TipoCloudinary = 'image' | 'video' | 'raw'

const EXTENSOES_DE_VIDEO = new Set(['mp4', 'webm', 'mov', 'm4v', 'ogv', 'avi', 'mkv'])

/**
 * Decide o resource_type que entra na URL, porque o Cloudinary serve imagem em
 * /image/upload/ e video em /video/upload/, e o endereco errado devolve 404.
 *
 * O mimeType so existe no upload. Na leitura o Payload nao entrega o documento:
 * o `checkFileAccess` so vai ao banco quando o `read` da colecao devolve uma
 * condicao de busca, e a Media libera leitura para todo mundo com `() => true`.
 * Sobra a extensao do arquivo, e ela precisa bastar.
 *
 * O padrao e imagem, nao raw. A Media so aceita imagem e video, entao na duvida
 * imagem acerta quase sempre, enquanto raw erraria em todo arquivo do site.
 */
const tipoDoArquivo = (filename: string, mimeType?: string): TipoCloudinary => {
  if (mimeType) {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    return 'raw'
  }

  const extensao = filename.split('.').pop()?.toLowerCase() ?? ''
  return EXTENSOES_DE_VIDEO.has(extensao) ? 'video' : 'image'
}

export const cloudinaryAdapter = (): Adapter => {
  return (): GeneratedAdapter => ({
    name: 'cloudinary',

    handleUpload: async ({ file }) => {
      const resourceType = tipoDoArquivo(file.filename, file.mimeType)

      await new Promise<void>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            public_id: toPublicId(file.filename),
            resource_type: resourceType,
            // A conta usa Dynamic folders, onde a pasta da biblioteca e um campo
            // separado do public_id. Sem isto o arquivo cairia solto na raiz e a
            // clinica nao acharia nada na Media Library. Nao muda a URL.
            asset_folder: folder,
            overwrite: true,
            invalidate: true,
          },
          (error) => (error ? reject(error) : resolve()),
        )
        stream.end(file.buffer)
      })
    },

    handleDelete: async ({ filename }) => {
      const resourceType = tipoDoArquivo(filename)
      await cloudinary.uploader.destroy(toPublicId(filename), {
        resource_type: resourceType,
        invalidate: true,
      })
    },

    generateURL: ({ filename }) =>
      cloudinary.url(toPublicId(filename), {
        secure: true,
        resource_type: tipoDoArquivo(filename),
        fetch_format: 'auto',
        quality: 'auto',
      }),

    // Os arquivos sao servidos pela CDN do Cloudinary. Este handler mantem o
    // preview do painel funcionando.
    staticHandler: async (req, { params: { filename } }) => {
      const url = cloudinary.url(toPublicId(filename), {
        secure: true,
        resource_type: tipoDoArquivo(filename),
      })
      const upstream = await fetch(url)

      if (!upstream.ok || !upstream.body) {
        return new Response('Arquivo nao encontrado', { status: 404 })
      }

      return new Response(upstream.body, {
        status: 200,
        headers: {
          'Content-Type': upstream.headers.get('content-type') || 'application/octet-stream',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    },
  })
}
