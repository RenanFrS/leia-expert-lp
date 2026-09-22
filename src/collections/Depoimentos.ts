import type { CollectionConfig } from 'payload'

import { ehAds, ehEquipe } from '@/lib/acesso'

export const Depoimentos: CollectionConfig = {
  slug: 'depoimentos',
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'nota', 'avaliacoes', 'publicado'],
    group: 'Conteudo',
    // Fora do alcance do papel ads, que so cuida de rastreamento.
    hidden: ({ user }) => ehAds(user),
  },
  labels: { singular: 'Depoimento', plural: 'Depoimentos' },
  access: {
    read: () => true,
    // Conteudo do site: escrita so de administrador e editor. O papel ads entra
    // no painel apenas para as tags, entao nao cria, nao edita e nao apaga nada
    // daqui. A leitura segue aberta porque quem le e o site.
    create: ({ req }) => ehEquipe(req.user),
    update: ({ req }) => ehEquipe(req.user),
    delete: ({ req }) => ehEquipe(req.user),
  },
  fields: [
    { name: 'nome', type: 'text', required: true },
    { name: 'texto', type: 'textarea', required: true, maxLength: 700 },
    { name: 'nota', type: 'number', required: true, min: 1, max: 5, defaultValue: 5 },
    {
      name: 'avaliacoes',
      type: 'number',
      label: 'Quantidade de avaliações do perfil',
      admin: { description: 'Numero de avaliacoes que essa pessoa ja fez no Google, mostrado ao lado do nome.' },
    },
    {
      name: 'guiaLocal',
      type: 'checkbox',
      label: 'Guia Local',
      defaultValue: false,
      admin: { description: 'Marque se o perfil da pessoa no Google exibe o selo "Guia Local".' },
    },
    {
      name: 'tempoTexto',
      type: 'text',
      label: 'Tempo relativo',
      admin: {
        description:
          'Texto livre, copiado do Google, como "6 meses atras" ou "um ano atras". Nao e calculado a partir de uma data, porque o Google so mostra tempo relativo.',
      },
    },
    {
      name: 'foto',
      type: 'upload',
      relationTo: 'media',
      label: 'Foto do perfil',
      admin: {
        description:
          'Opcional. Sem foto, o card mostra um circulo colorido com a inicial do nome, igual ao proprio Google faz quando a pessoa nao tem foto.',
      },
    },
    {
      name: 'fotos',
      type: 'array',
      label: 'Fotos anexadas a avaliacao',
      labels: { singular: 'Foto', plural: 'Fotos' },
      admin: { description: 'Fotos de antes e depois que a pessoa anexou na avaliacao do Google. Opcional.' },
      fields: [{ name: 'arquivo', type: 'upload', relationTo: 'media', required: true }],
    },
    { name: 'tratamento', type: 'relationship', relationTo: 'tratamentos' },
    { name: 'publicado', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
  ],
}
