import type { CollectionConfig } from 'payload'

export const Depoimentos: CollectionConfig = {
  slug: 'depoimentos',
  admin: { useAsTitle: 'nome', defaultColumns: ['nome', 'nota', 'publicado'], group: 'Conteudo' },
  labels: { singular: 'Depoimento', plural: 'Depoimentos' },
  access: { read: () => true },
  fields: [
    { name: 'nome', type: 'text', required: true },
    { name: 'texto', type: 'textarea', required: true, maxLength: 400 },
    { name: 'nota', type: 'number', required: true, min: 1, max: 5, defaultValue: 5 },
    { name: 'tratamento', type: 'relationship', relationTo: 'tratamentos' },
    { name: 'publicado', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
  ],
}
