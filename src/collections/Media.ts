import type { CollectionConfig } from 'payload'

/**
 * Hosts que o Payload pode chamar para reler um arquivo da propria Media.
 *
 * Ele precisa disso ao recortar: como a colecao usa `disableLocalStorage`, nao
 * existe copia em disco, entao o `generateFileData` rebusca o original pela `url`
 * do documento antes de passar o corte para o sharp.
 *
 * Essa rebusca passa pelo `safeFetch`, que resolve o host e recusa qualquer IP
 * fora da faixa unicast. Em desenvolvimento a URL cai em `localhost`, que resolve
 * para loopback, e o recorte morre com `Blocked unsafe attempt`. Em producao, com
 * dominio publico, passaria.
 */
const hostsDoSite = (): string[] => {
  const lista: string[] = []

  try {
    const { hostname } = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
    if (hostname) lista.push(hostname)
  } catch {
    // URL malformada no ambiente nao pode derrubar a colecao inteira.
  }

  if (process.env.NODE_ENV !== 'production') lista.push('localhost', '127.0.0.1')

  return [...new Set(lista)]
}

export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Conteudo' },
  labels: { singular: 'Midia', plural: 'Midias' },
  access: { read: () => true },
  upload: {
    mimeTypes: ['image/*', 'video/*'],
    // O Cloudinary entrega os tamanhos sob demanda pela propria URL.
    disableLocalStorage: true,

    // Precisa ser `true` literal. A interface do painel testa
    // `uploadConfig?.focalPoint === true`, entao deixar de fora, mesmo valendo
    // `true` por padrao no restante do Payload, esconde o controle de foco.
    focalPoint: true,

    // Ja e o padrao. Fica explicito ao lado do foco porque os dois andam juntos:
    // o recorte apara o arquivo, o foco manda no enquadramento dentro de cada
    // caixa do site.
    crop: true,

    /**
     * Liberacao restrita para a rebusca descrita em `hostsDoSite`.
     *
     * **Nao troque por `skipSafeFetch: true`.** O painel aceita colar URL de
     * arquivo, pelo `pasteURL`, que vem ligado por padrao. Liberacao ampla junto
     * com esse campo vira SSRF a partir do painel: bastaria colar um endereco
     * interno para o servidor ir busca-lo.
     *
     * A porta fica de fora de proposito, porque o `isURLAllowed` pula chave sem
     * valor e o `pnpm dev` troca de porta sozinho quando a 3000 esta ocupada.
     */
    skipSafeFetch: hostsDoSite().map((hostname) => ({
      hostname,
      pathname: '/api/media/file/**',
    })),
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Texto alternativo',
      admin: { description: 'Descreva a imagem para leitores de tela e para o Google.' },
    },
    { name: 'legenda', type: 'text' },
  ],
}
