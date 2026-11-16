/**
 * Carregador global do `next/image`: quem redimensiona e converte as fotos do
 * site e o Cloudinary, e nao o otimizador da Vercel.
 *
 * **Por que existe.** Toda foto da Media saia por `/_next/image`, apontando para
 * `/api/media/file/...`. Essa rota responde `max-age=0`, entao a Vercel guardava
 * cada versao otimizada so pelo minimo do Next, 60 segundos, e refazia a
 * transformacao na visita seguinte. O plano Hobby da 5 mil transformacoes por
 * mes: elas acabaram em novembro de 2026, e dai em diante toda foto que nao
 * estava em cache voltava **402, OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED**, e
 * sumia da pagina. Cada transformacao ainda acordava uma funcao para buscar o
 * original inteiro no Cloudinary.
 *
 * Agora o `srcset` aponta direto para a CDN do Cloudinary, com `f_auto`,
 * `q_auto` e a largura pedida. A derivada nasce uma vez so e fica guardada la,
 * sem passar pela Vercel nem pelo servidor do Next.
 *
 * Roda no servidor e no navegador, por isso so le variavel publica. O
 * `next.config.mjs` copia o nome da conta e a pasta para elas no build. Sem o
 * nome da conta, a foto volta para a rota do Payload, sem otimizacao mas
 * aparecendo.
 */
import type { ImageLoaderProps } from 'next/image'

import { EH_TRANSFORMACAO, publicIdDe, tipoDoArquivo } from './cloudinary-url'

const NUVEM = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const PASTA = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || 'leia-expert'
const CDN = 'https://res.cloudinary.com/'
const MARCA_DE_ENTREGA = '/upload/'

/** A URL que o Payload grava, relativa ou com o dominio do site na frente. */
const ROTA_DA_MEDIA = /^(?:https?:\/\/[^/]+)?\/api\/media\/file\/([^?#]+)/

/**
 * `c_limit` so reduz: foto menor que a largura pedida sai no tamanho dela, sem
 * ampliar e sem borrar.
 */
const transformacao = (width: number, quality?: number) =>
  `f_auto,${quality ? `q_${quality}` : 'q_auto'},c_limit,w_${width}`

/** Cada trecho do public_id vai codificado, mas a barra da pasta nao. */
const codificar = (publicId: string) => publicId.split('/').map(encodeURIComponent).join('/')

export default function carregadorDeImagem({ src, width, quality }: ImageLoaderProps): string {
  const daMedia = NUVEM ? ROTA_DA_MEDIA.exec(src) : null
  if (daMedia) {
    let filename: string
    try {
      filename = decodeURIComponent(daMedia[1])
    } catch {
      return src
    }

    // Video nunca chega aqui, porque as secoes descartam antes. Se chegar, a
    // rota do Payload ao menos entrega o arquivo em vez de uma URL de imagem
    // que nao existe.
    if (tipoDoArquivo(filename) !== 'image') return src

    return `${CDN}${NUVEM}/image/upload/${transformacao(width, quality)}/${codificar(publicIdDe(filename, PASTA))}`
  }

  // URL que ja e do Cloudinary, como o quadro parado de video que o hero monta.
  // A largura entra como transformacao encadeada, depois das que ja estao la,
  // entao o `so_0` e o corte originais continuam valendo.
  if (src.startsWith(CDN)) {
    const inicio = src.indexOf(MARCA_DE_ENTREGA)
    if (inicio === -1) return src

    const base = src.slice(0, inicio + MARCA_DE_ENTREGA.length)
    const partes = src.slice(inicio + MARCA_DE_ENTREGA.length).split('/')

    let posicao = 0
    while (posicao < partes.length - 1 && EH_TRANSFORMACAO.test(partes[posicao])) posicao++
    partes.splice(posicao, 0, transformacao(width, quality))

    return base + partes.join('/')
  }

  // Arquivo de `public/` ou qualquer outra origem: sai como esta.
  return src
}
