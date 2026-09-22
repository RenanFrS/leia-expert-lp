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
    {
      name: 'indicacoes',
      type: 'array',
      labels: { singular: 'Indicacao', plural: 'Indicacoes' },
      fields: [{ name: 'texto', type: 'text', required: true }],
    },
    { name: 'ordem', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
