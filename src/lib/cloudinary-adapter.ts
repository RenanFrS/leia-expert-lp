import { v2 as cloudinary } from 'cloudinary'
import type { Adapter, GeneratedAdapter } from '@payloadcms/plugin-cloud-storage/types'

import { pastaDaBiblioteca, publicIdDe as toPublicId, tipoDoArquivo } from './cloudinary-url'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

// A convencao de public_id e de resource_type mora em `cloudinary-url.ts`,
// porque o hero tambem precisa dela para apontar o video direto para a CDN, e
// duas copias da mesma regra acabariam divergindo.
const folder = pastaDaBiblioteca()

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
      // O endereco do arquivo nao muda quando o conteudo muda: recortar pelo painel
      // sobe por cima do mesmo public_id. Por isso a busca nao pode ser cacheada
      // aqui dentro.
      //
      // Isso **nao** resolve sozinho a foto recortada demorar a aparecer. Medindo o
      // que esta rota recebe, ela pegou 5142 bytes da CDN enquanto a API do
      // Cloudinary ja reportava 2382: quem segura o conteudo velho e o cache de
      // borda do Cloudinary, e o `invalidate` do upload e uma purga assincrona que
      // leva alguns minutos. Nao ha o que fazer deste lado, so esperar.
      const upstream = await fetch(url, { cache: 'no-store' })

      if (!upstream.ok || !upstream.body) {
        return new Response('Arquivo nao encontrado', { status: 404 })
      }

      return new Response(upstream.body, {
        status: 200,
        headers: {
          'Content-Type': upstream.headers.get('content-type') || 'application/octet-stream',
          // Nao pode ser `immutable`. O endereco e estavel mas o conteudo nao:
          // recortar troca os bytes por baixo. Com um ano de cache, o navegador de
          // quem ja tinha visto a foto nunca mais veria o recorte. O custo de
          // revalidar e baixo porque o site publico e servido pelo `next/image`,
          // que guarda o resultado ja otimizado sob a politica dele.
          'Cache-Control': 'public, max-age=0, must-revalidate',
        },
      })
    },
  })
}
