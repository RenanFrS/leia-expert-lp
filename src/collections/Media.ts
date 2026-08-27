import type { CollectionConfig, PayloadRequest } from 'payload'

import { ehAdmin } from '@/lib/acesso'
import { urlDeEntrega } from '@/lib/cloudinary-url'

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

/** Numero em porcentagem, aceitando so o que faz sentido como area de recorte. */
const percentual = (valor: unknown) => {
  const n = Number(valor)
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : null
}

/**
 * Gera um arquivo novo a partir do recorte pedido, sem encostar no original.
 *
 * **Nao usa sharp de proposito.** Quem recorta e o proprio Cloudinary, por
 * `c_crop` na URL de entrega, e aqui so buscamos os bytes prontos. Isso evita de
 * uma vez a cadeia que tornava o recorte nativo fragil: reler o original pela
 * rota do proprio site, passar pelo `safeFetch`, recortar com sharp e subir por
 * cima do mesmo `public_id`, dependendo de purga de cache para aparecer.
 *
 * Como o arquivo novo tem endereco proprio, ele aparece na hora.
 */
const recortar = async (req: PayloadRequest) => {
  if (!ehAdmin(req.user)) {
    return Response.json({ erro: 'Sem permissão para recortar.' }, { status: 403 })
  }

  const id = req.routeParams?.id
  if (!id) return Response.json({ erro: 'Informe a imagem de origem.' }, { status: 400 })

  const corpo = (await req.json?.()) as Record<string, unknown> | undefined
  const x = percentual(corpo?.x)
  const y = percentual(corpo?.y)
  const largura = percentual(corpo?.largura)
  const altura = percentual(corpo?.altura)

  if (x === null || y === null || largura === null || altura === null) {
    return Response.json({ erro: 'Área de recorte inválida.' }, { status: 400 })
  }
  if (largura === 0 || altura === 0 || x + largura > 100.01 || y + altura > 100.01) {
    return Response.json({ erro: 'A área precisa caber dentro da imagem.' }, { status: 400 })
  }

  const origem = await req.payload.findByID({ collection: 'media', id: Number(id), overrideAccess: true })

  if (!origem?.filename || !origem.mimeType?.startsWith('image/')) {
    return Response.json({ erro: 'Só é possível recortar imagem.' }, { status: 400 })
  }

  // O Cloudinary aceita a area em fracao, que e o formato que o componente
  // manda, entao nao ha conversao para pixel e nada depende das dimensoes que o
  // navegador acha que o arquivo tem. Era esse descompasso que estourava antes.
  const fracao = (n: number) => (n / 100).toFixed(4)
  const corte = `c_crop,x_${fracao(x)},y_${fracao(y)},w_${fracao(largura)},h_${fracao(altura)}`
  const url = urlDeEntrega(origem.filename, `${corte}/f_auto,q_auto`)

  if (!url) return Response.json({ erro: 'Cloudinary não configurado.' }, { status: 500 })

  const resposta = await fetch(url, { cache: 'no-store' })
  if (!resposta.ok) {
    return Response.json({ erro: `O Cloudinary recusou o recorte (${resposta.status}).` }, { status: 502 })
  }

  const dados = Buffer.from(await resposta.arrayBuffer())
  const base = origem.filename.replace(/\.[^.]+$/, '')
  const extensao = resposta.headers.get('content-type')?.includes('png') ? 'png' : 'jpg'

  // O Payload resolve colisao de nome sozinho, acrescentando sufixo, entao dois
  // recortes da mesma foto nao brigam.
  const criada = await req.payload.create({
    collection: 'media',
    data: {
      alt: origem.alt,
      legenda: origem.legenda,
      recortadaDe: origem.id,
      recorte: { x, y, largura, altura },
    },
    file: {
      data: dados,
      name: `${base}-recorte.${extensao}`,
      mimetype: resposta.headers.get('content-type') || 'image/jpeg',
      size: dados.length,
    },
    overrideAccess: true,
  })

  return Response.json({
    ok: true,
    id: criada.id,
    filename: criada.filename,
    largura: criada.width,
    altura: criada.height,
    tamanho: criada.filesize,
  })
}

export const Media: CollectionConfig = {
  slug: 'media',
  endpoints: [{ path: '/:id/recortar', method: 'post', handler: recortar }],
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

    /*
      O recorte nativo fica **desligado de proposito**, e o do projeto vive no
      componente `RecorteImagem`, mais abaixo nesta colecao.

      O nativo sobrescreve o original no Cloudinary, e o endereco do arquivo nao
      muda quando o conteudo muda. Na pratica isso dava duas dores: a foto
      recortada demorava minutos para aparecer, presa no cache de borda, e
      recortar de novo com o painel ainda mostrando a versao velha estourava com
      `extract_area: bad extract area`, porque o navegador mandava as dimensoes
      antigas. O diagnostico inteiro esta no CLAUDE.md.

      O nosso gera um arquivo novo e nao encosta no original, entao nao depende
      de purga nenhuma. Duas ferramentas de recorte, uma destrutiva e outra nao,
      so confundiriam quem usa o painel.

      O botao de editar imagem continua aparecendo, porque a interface o mostra
      com `showCrop || showFocalPoint`, e passa a ter so a aba de foco.
    */
    crop: false,

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

    /*
      Proveniencia do recorte. Sem isso a biblioteca vira um monte de arquivo
      parecido sem ninguem saber de onde veio.

      Os dois ficam somente leitura: quem escreve e o endpoint `/recortar`, e
      editar na mao so criaria registro que nao corresponde ao arquivo.
    */
    {
      name: 'recortadaDe',
      type: 'relationship',
      relationTo: 'media',
      label: 'Recorte de',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Preenchido quando esta imagem nasce de um recorte de outra.',
      },
    },
    {
      name: 'recorte',
      type: 'group',
      label: 'Área recortada',
      admin: {
        readOnly: true,
        condition: (dados) => Boolean(dados?.recortadaDe),
        description: 'Em porcentagem da imagem de origem.',
      },
      fields: [
        { name: 'x', type: 'number' },
        { name: 'y', type: 'number' },
        { name: 'largura', type: 'number' },
        { name: 'altura', type: 'number' },
      ],
    },

    /*
      A ferramenta de recorte. E campo `ui`, entao nao grava nada por si: ele so
      desenha a interface, que chama o endpoint `/recortar` da propria colecao.
    */
    {
      name: 'ferramentaDeRecorte',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/painel/RecorteImagem#RecorteImagem',
        },
      },
    },
  ],
}
