import type { CollectionConfig } from 'payload'

import { ehAds, ehEquipe } from '@/lib/acesso'

export const Faq: CollectionConfig = {
  slug: 'faq',
  admin: {
    useAsTitle: 'pergunta',
    defaultColumns: ['pergunta', 'ordem'],
    group: 'Conteudo',
    // Fora do alcance do papel ads, que so cuida de rastreamento.
    hidden: ({ user }) => ehAds(user),
  },
  labels: { singular: 'Pergunta frequente', plural: 'Perguntas frequentes' },
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
    { name: 'pergunta', type: 'text', required: true },
    { name: 'resposta', type: 'textarea', required: true },
    { name: 'ordem', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
