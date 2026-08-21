import type { CollectionConfig } from 'payload'

export const Tratamentos: CollectionConfig = {
  slug: 'tratamentos',
  admin: { useAsTitle: 'titulo', defaultColumns: ['titulo', 'ordem'], group: 'Conteudo' },
  labels: { singular: 'Tratamento', plural: 'Tratamentos' },
  access: { read: () => true },
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
