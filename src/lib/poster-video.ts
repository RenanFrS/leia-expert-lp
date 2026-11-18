/**
 * Monta, a partir da URL de entrega de um video do Cloudinary, outras entregas do
 * mesmo arquivo: o quadro parado e o video noutro recorte.
 *
 *   .../video/upload/f_auto,q_auto/leia-expert/hero
 *   .../video/upload/so_0,w_1600,q_auto/leia-expert/hero.jpg          (posterDeVideo)
 *   .../video/upload/so_0,c_fill,ar_3:4,g_center/leia-expert/hero.jpg (quadroDeVideo)
 *   .../video/upload/f_auto,q_auto,c_fill,ar_3:4,g_center,w_720/leia-expert/hero
 *
 * O quadro e o que segura o lugar do video enquanto ele nao toca. Sem ele o
 * painel do hero pintaria so a chapa de areia ate o primeiro quadro decodificar.
 *
 * **Este arquivo fica fora do `cloudinary-adapter.ts` de proposito.** Aquele
 * importa o SDK do Cloudinary e le as chaves da conta, e quem consome o quadro e
 * o `midia-rotativa.tsx`, que e `'use client'`. Importar o adaptador de la
 * arrastaria o SDK e o segredo para o pacote do navegador. Aqui e so texto, sem
 * dependencia nenhuma, e por isso o cliente consegue derivar as entregas sozinho
 * a partir da URL que o servidor ja montou.
 */

// A regra que separa transformacao de public_id mora em `cloudinary-url.ts`,
// que tambem e so texto, porque o carregador do `next/image` usa a mesma.
import { EH_TRANSFORMACAO } from './cloudinary-url'

const MARCA_DE_VIDEO = '/video/upload/'

/**
 * Recorte retrato do centro do quadro, o do hero no celular. O painel do
 * telefone tem 3:4 e, com o video 16:9 em `object-cover`, ja mostrava so os 42%
 * do meio da largura. O recorte manda exatamente essa area, e mais nada.
 */
export const RECORTE_RETRATO = 'c_fill,ar_3:4,g_center'

/**
 * Entrega dos videos de fundo de secao no celular. A secao ali e alta e
 * estreita, entao o recorte e 9:16 do centro, e nao o 16:9 de 1600px do desktop,
 * que tinha as laterais cortadas pelo `object-cover` e baixadas a toa. O
 * `q_auto:eco` e o mesmo do desktop: o video vive atras de veu de 85% a 90%.
 * Medido: 1,3 MB contra 3,6 MB no fundo da tricoscopia, e 0,7 MB contra 1,4 MB
 * no dos depoimentos.
 *
 * **Video grande demora a ganhar transformacao nova.** O Cloudinary responde
 * `423` ate terminar de processar, e o video fica de fora nesse meio tempo (a
 * secao segue com a cor de fundo). Trocou o arquivo ou esta transformacao, peca
 * a URL uma vez antes do deploy.
 */
export const VIDEO_FUNDO_CELULAR = 'f_auto,q_auto:eco,c_fill,ar_9:16,g_center,w_540'

/**
 * Separa a URL em endereco da conta e caminho do arquivo, descartando a
 * transformacao que ja vier nela. Ela e descartada, nao remendada: carrega
 * `f_auto`, que brigaria com a extensao `.jpg` do quadro.
 */
const partesDoVideo = (url?: string | null) => {
  if (!url || !url.includes(MARCA_DE_VIDEO)) return null

  const [base, resto] = url.split(MARCA_DE_VIDEO)
  if (!resto) return null

  const partes = resto.split('/')
  if (partes.length > 1 && EH_TRANSFORMACAO.test(partes[0])) partes.shift()

  const caminho = partes.join('/').replace(/\.[^./]+$/, '')
  if (!caminho) return null

  return { base, caminho }
}

/**
 * Segundo do quadro no formato do `so_` do Cloudinary. Vazio, negativo ou o que
 * nao for numero vira `0`, o primeiro quadro. Fica com no maximo duas casas: o
 * painel aceita fracao, e `so_8.4999` seria outra URL para o mesmo quadro, e
 * outra transformacao contada na conta.
 *
 * Segundo alem do fim do video nao quebra: medido, o Cloudinary devolve o ultimo
 * quadro, com 200.
 */
const inicioDoQuadro = (segundo?: number | null) =>
  typeof segundo === 'number' && Number.isFinite(segundo) && segundo > 0 ? Number(segundo.toFixed(2)) : 0

/**
 * Quadro parado ja na largura final, para quem usa a URL como esta, sem passar
 * pelo carregador do `next/image`. Devolve `null` quando a URL nao e de video do
 * Cloudinary, para o componente seguir sem quadro em vez de quebrar.
 *
 * Quem usa e o cartao do carrossel do hero, que nunca toca o video, entao o
 * quadro nao precisa ser o primeiro: o `segundo` escolhe o momento que melhor
 * mostra o problema. Ele vem do campo `quadroDoCartao` da colecao Tratamentos.
 */
export const posterDeVideo = (
  url?: string | null,
  largura = 1600,
  segundo?: number | null,
): string | null => {
  const partes = partesDoVideo(url)
  if (!partes) return null

  return `${partes.base}${MARCA_DE_VIDEO}so_${inicioDoQuadro(segundo)},w_${largura},q_auto/${partes.caminho}.jpg`
}

/**
 * Quadro parado **sem largura nem qualidade**, para entrar no `next/image`. O
 * carregador encadeia `f_auto,q_auto,c_limit,w_<largura>` depois do que ja esta
 * na URL, entao o corte vale primeiro, na resolucao cheia, e o `srcset` sai
 * inteiro dali. Medido no hero: 27 KB em WebP no celular, contra 97 KB do JPEG
 * de 1600px que o atributo `poster` baixava.
 */
export const quadroDeVideo = (url?: string | null, recorte?: string): string | null => {
  const partes = partesDoVideo(url)
  if (!partes) return null

  const transformacao = recorte ? `so_0,${recorte}` : 'so_0'
  return `${partes.base}${MARCA_DE_VIDEO}${transformacao}/${partes.caminho}.jpg`
}

/**
 * O mesmo video noutra entrega. Serve ao hero no celular, que toca o recorte
 * retrato em 720x960: 1,6 MB, contra 3,1 MB do 1920x1080 inteiro, e com a mesma
 * area na tela.
 */
export const variacaoDeVideo = (url: string | null | undefined, transformacoes: string): string | null => {
  const partes = partesDoVideo(url)
  if (!partes) return null

  return `${partes.base}${MARCA_DE_VIDEO}${transformacoes}/${partes.caminho}`
}
