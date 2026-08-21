import type { GlobalConfig } from 'payload'

export const Seo: GlobalConfig = {
  slug: 'seo',
  label: 'SEO da home',
  admin: { group: 'Configuracoes' },
  access: { read: () => true },
  fields: [
    {
      name: 'titulo',
      type: 'text',
      required: true,
      maxLength: 62,
      admin: { description: 'Ate 60 caracteres. Comece pela palavra chave principal.' },
    },
    {
      name: 'descricao',
      type: 'textarea',
      required: true,
      maxLength: 158,
      admin: { description: 'Ate 155 caracteres. E o texto que aparece no resultado de busca.' },
    },
    {
      name: 'palavrasChave',
      type: 'array',
      label: 'Palavras chave',
      labels: { singular: 'Palavra chave', plural: 'Palavras chave' },
      admin: {
        description:
          'Usadas para orientar os textos das secoes. Nao entram como meta keywords, que o Google ignora desde 2009.',
      },
      fields: [{ name: 'termo', type: 'text', required: true }],
    },
    { name: 'imagemCompartilhamento', type: 'upload', relationTo: 'media', label: 'Imagem de compartilhamento' },
  ],
}
