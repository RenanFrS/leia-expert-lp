import type { CollectionConfig } from 'payload'

export const Faq: CollectionConfig = {
  slug: 'faq',
  admin: { useAsTitle: 'pergunta', defaultColumns: ['pergunta', 'ordem'], group: 'Conteudo' },
  labels: { singular: 'Pergunta frequente', plural: 'Perguntas frequentes' },
  access: { read: () => true },
  defaultSort: 'ordem',
  fields: [
    { name: 'pergunta', type: 'text', required: true },
    { name: 'resposta', type: 'textarea', required: true },
    { name: 'ordem', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
