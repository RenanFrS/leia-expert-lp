/**
 * Monta a URL do quadro parado de um video do Cloudinary, a partir da URL de
 * entrega do proprio video.
 *
 *   .../video/upload/f_auto,q_auto/leia-expert/hero
 *   .../video/upload/so_0,w_1600,q_auto/leia-expert/hero.jpg
 *
 * Serve de `poster` no elemento de video. Sem ele o painel do hero pinta so a
 * chapa de areia ate o primeiro quadro decodificar, porque o `priority` do Next
 * vale para imagem e nao alcanca video.
 *
 * **Este arquivo fica fora do `cloudinary-adapter.ts` de proposito.** Aquele
 * importa o SDK do Cloudinary e le as chaves da conta, e quem consome o poster e
 * o `midia-rotativa.tsx`, que e `'use client'`. Importar o adaptador de la
 * arrastaria o SDK e o segredo para o pacote do navegador. Aqui e so texto, sem
 * dependencia nenhuma.
 */

/**
 * Trecho de transformacao do Cloudinary, do tipo `f_auto,q_auto` ou `w_800`.
 * E como se distingue uma transformacao do comeco do public_id, ja que os dois
 * aparecem no mesmo lugar da URL.
 */
const EH_TRANSFORMACAO = /^[a-z]{1,3}_[^/]+$/

const MARCA_DE_VIDEO = '/video/upload/'

/**
 * Devolve `null` quando a URL nao e de video do Cloudinary, para o componente
 * seguir sem poster em vez de quebrar.
 */
export const posterDeVideo = (url?: string | null, largura = 1600): string | null => {
  if (!url || !url.includes(MARCA_DE_VIDEO)) return null

  const [base, resto] = url.split(MARCA_DE_VIDEO)
  if (!resto) return null

  // A transformacao que ja vem na URL e descartada, nao remendada: ela carrega
  // `f_auto`, que brigaria com a extensao `.jpg` pedida aqui.
  const partes = resto.split('/')
  if (partes.length > 1 && EH_TRANSFORMACAO.test(partes[0])) partes.shift()

  const caminho = partes.join('/').replace(/\.[^./]+$/, '')
  if (!caminho) return null

  // `so_0` e o primeiro quadro, que e justamente o que o video vai mostrar
  // enquanto nao comeca a tocar.
  return `${base}${MARCA_DE_VIDEO}so_0,w_${largura},q_auto/${caminho}.jpg`
}
