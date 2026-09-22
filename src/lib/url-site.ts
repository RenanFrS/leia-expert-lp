/**
 * A URL publica do site, em um lugar so.
 *
 * **Ela vem sempre sem barra no fim, e isso ja custou o painel de producao.** O
 * `csrf` do Payload compara a lista com o cabecalho `Origin` por string crua, em
 * `extractJWT`, e `Origin` de navegador nunca tem barra: e so esquema mais host.
 * Com `https://leiaexpert.com.br/` gravado na Vercel, toda gravacao do painel
 * caiu fora da lista, o Payload descartou o cookie e o erro chegou na tela como
 * falta de permissao, embora o painel abrisse normalmente. Navegacao nao manda
 * `Origin`, entao so a escrita quebra, o que esconde a causa.
 *
 * A mesma barra saia no `robots.txt`, como `https://leiaexpert.com.br//sitemap.xml`.
 */
export const urlSite = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(
  /\/+$/,
  '',
)

/**
 * As duas formas do dominio, com e sem `www`, para o `cors` e o `csrf`.
 *
 * O redirecionamento 308 da Vercel entre uma e outra resolve navegacao, e **nao**
 * resolve isso: o `fetch` que grava sai com o `Origin` do host que a pessoa tem
 * na barra de endereco, e quem nao estiver na lista perde a sessao. Aceitar as
 * duas deixa o painel funcionando qualquer que seja o primario, e nao afrouxa
 * nada, porque as duas sao o mesmo site.
 */
export const origensDoSite = (() => {
  try {
    const { protocol, host } = new URL(urlSite)
    const irmao = host.startsWith('www.') ? host.slice(4) : `www.${host}`
    return [...new Set([urlSite, `${protocol}//${irmao}`])]
  } catch {
    // URL malformada no ambiente nao pode derrubar o config inteiro.
    return [urlSite]
  }
})()
