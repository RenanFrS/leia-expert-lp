import type { CollectionConfig } from 'payload'

import { ehAds, ehEquipe } from '@/lib/acesso'

export const Resultados: CollectionConfig = {
  slug: 'resultados',
  admin: {
    useAsTitle: 'titulo',
    group: 'Conteudo',
    // Fora do alcance do papel ads, que so cuida de rastreamento.
    hidden: ({ user }) => ehAds(user),
  },
  labels: { singular: 'Resultado', plural: 'Resultados' },
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
    { name: 'antes', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'depois',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description:
          'Com "Em tratamento" marcado, esta é a foto do meio do tratamento, e o site rotula ela assim.',
      },
    },
    { name: 'meses', type: 'number', label: 'Meses de tratamento' },
    { name: 'tratamento', type: 'relationship', relationTo: 'tratamentos' },

    /*
      Caso ainda em andamento, sem foto de depois.

      O arquivo continua indo no campo `depois`, que segue obrigatorio: o
      checkbox nao muda onde a foto mora, so o que o site afirma sobre ela. Sem
      isso o cartao rotularia de "Depois" uma foto de meio de tratamento, que e
      dizer que o caso terminou quando ele nao terminou.
    */
    {
      name: 'emTratamento',
      type: 'checkbox',
      label: 'Em tratamento',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Marque quando o caso ainda está em andamento e a segunda foto não é o resultado final.',
      },
    },
    /*
      Ordem no carrossel, da esquerda para a direita. Antes a secao saia por
      `-createdAt`, entao a unica forma de reordenar era recadastrar o caso.

      Os valores vao de dez em dez de proposito: encaixar um resultado novo entre
      dois existentes e escolher um numero no meio, sem renumerar a lista toda.
    */
    { name: 'ordem', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
    { name: 'publicado', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
  ],
}
