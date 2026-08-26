/**
 * Convencao de endereco do Cloudinary, sem SDK e sem segredo.
 *
 * Vive separado do `cloudinary-adapter.ts` porque duas pontas precisam da mesma
 * regra: o adaptador, quando sobe e apaga arquivo, e o hero, quando aponta o
 * elemento de video direto para a CDN. Com duas copias, uma delas ia divergir, e
 * errar o `resource_type` aqui e o tipo de engano que derruba midia em silencio.
 */

const EXTENSOES_DE_VIDEO = new Set(['mp4', 'webm', 'mov', 'm4v', 'ogv', 'avi', 'mkv'])

export type TipoCloudinary = 'image' | 'video' | 'raw'

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
export const tipoDoArquivo = (filename: string, mimeType?: string): TipoCloudinary => {
  if (mimeType) {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    return 'raw'
  }

  const extensao = filename.split('.').pop()?.toLowerCase() ?? ''
  return EXTENSOES_DE_VIDEO.has(extensao) ? 'video' : 'image'
}

export const pastaDaBiblioteca = () => process.env.CLOUDINARY_FOLDER || 'leia-expert'

/** O Cloudinary trabalha com public_id sem extensao. */
export const publicIdDe = (filename: string) =>
  `${pastaDaBiblioteca()}/${filename.replace(/\.[^.]+$/, '')}`

/**
 * Endereco publico do arquivo na CDN do Cloudinary.
 *
 * So roda no servidor, porque le `CLOUDINARY_CLOUD_NAME`, que nao tem versao
 * publica. Devolve `null` sem a variavel, para quem chama cair na URL que o
 * Payload ja tinha gravado em vez de montar um endereco quebrado.
 */
export const urlDeEntrega = (filename: string, transformacoes = 'f_auto,q_auto'): string | null => {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME
  if (!cloud) return null

  const tipo = tipoDoArquivo(filename)
  const trecho = transformacoes ? `${transformacoes}/` : ''

  return `https://res.cloudinary.com/${cloud}/${tipo}/upload/${trecho}${publicIdDe(filename)}`
}
