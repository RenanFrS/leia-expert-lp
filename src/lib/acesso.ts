/**
 * Regras de papel usadas no access control das colecoes e dos globals.
 *
 * O usuario chega aqui sem tipagem porque o `req.user` do Payload atravessa
 * varios pontos de entrada, por isso o cast local. A lista de papeis e a mesma
 * do campo `papel` em src/collections/Users.ts, e os tres helpers abaixo sao o
 * unico lugar que compara a string.
 */
type Papel = 'admin' | 'editor' | 'ads'

type UsuarioComPapel = { papel?: Papel | string } | null | undefined

const papelDe = (usuario: unknown) => (usuario as UsuarioComPapel)?.papel

export const ehAdmin = (usuario: unknown) => papelDe(usuario) === 'admin'

/**
 * O papel da agencia de anuncios. Ele entra no painel so para cuidar de
 * `Configuracoes > Rastreamento e ads`, entao e mais facil perguntar por ele do
 * que listar tudo o que ele nao pode.
 */
export const ehAds = (usuario: unknown) => papelDe(usuario) === 'ads'

/**
 * Quem cuida do conteudo do site: administrador e editor. E a trava de escrita
 * das colecoes e dos globals que montam a pagina, para o usuario de ads nao
 * encostar em texto, foto nem SEO.
 */
export const ehEquipe = (usuario: unknown) => {
  const papel = papelDe(usuario)
  return papel === 'admin' || papel === 'editor'
}
