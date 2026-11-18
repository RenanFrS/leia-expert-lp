import type { CollectionConfig } from 'payload'

import { ehAds, ehEquipe } from '@/lib/acesso'

export const Tratamentos: CollectionConfig = {
  slug: 'tratamentos',
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'ordem'],
    group: 'Conteudo',
    // Fora do alcance do papel ads, que so cuida de rastreamento.
    hidden: ({ user }) => ehAds(user),
  },
  labels: { singular: 'Tratamento', plural: 'Tratamentos' },
  access: {
    read: () => true,
    // Conteudo do site: escrita so de administrador e editor. O papel ads entra
    // no painel apenas para as tags, entao nao cria, nao edita e nao apaga nada
    // daqui. A leitura segue aberta porque quem le e o site.
    create: ({ req }) => ehEquipe(req.user),
    update: ({ req }) => ehEquipe(req.user),
    delete: ({ req }) => ehEquipe(req.user),
  },
  defaultSort: 'ordem',
  fields: [
    { name: 'titulo', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Usado na ancora da pagina. Exemplo: queda-capilar' },
    },
    { name: 'resumo', type: 'textarea', required: true, maxLength: 220 },
    { name: 'descricao', type: 'textarea' },
    { name: 'imagem', type: 'upload', relationTo: 'media' },
    // O cartao que gira no topo da pagina nao toca o video do tratamento: mostra
    // um quadro parado dele, e o recorte 16:10 do cartao corta o resto. Video
    // vertical perde em cima e embaixo, entao o primeiro quadro pode cair num
    // rosto em vez do problema. Foi o caso da alopecia areata, cujo video abre no
    // rosto da modelo e so mostra as falhas depois.
    {
      name: 'quadroDoCartao',
      type: 'number',
      label: 'Quadro do cartão do topo, em segundos',
      min: 0,
      admin: {
        step: 0.5,
        description:
          'Só vale quando a mídia é vídeo. O cartão que gira no topo da página mostra uma foto parada do vídeo, tirada neste segundo, e corta as bordas dela. Escolha um momento em que o problema apareça no meio da imagem. Vazio, a foto sai do começo do vídeo.',
      },
    },
    {
      name: 'indicacoes',
      type: 'array',
      labels: { singular: 'Indicacao', plural: 'Indicacoes' },
      fields: [{ name: 'texto', type: 'text', required: true }],
    },
    { name: 'ordem', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
