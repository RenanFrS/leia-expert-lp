import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Conteudo' },
  labels: { singular: 'Midia', plural: 'Midias' },
  access: { read: () => true },
  upload: {
    mimeTypes: ['image/*', 'video/*'],
    // O Cloudinary entrega os tamanhos sob demanda pela propria URL.
    disableLocalStorage: true,
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
