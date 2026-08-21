import type { CollectionConfig } from 'payload'

export const Resultados: CollectionConfig = {
  slug: 'resultados',
  admin: { useAsTitle: 'titulo', group: 'Conteudo' },
  labels: { singular: 'Resultado', plural: 'Resultados' },
  access: { read: () => true },
  fields: [
    { name: 'titulo', type: 'text', required: true },
    { name: 'antes', type: 'upload', relationTo: 'media', required: true },
    { name: 'depois', type: 'upload', relationTo: 'media', required: true },
    { name: 'meses', type: 'number', label: 'Meses de tratamento' },
    { name: 'tratamento', type: 'relationship', relationTo: 'tratamentos' },
    { name: 'publicado', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
  ],
}
