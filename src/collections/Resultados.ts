import type { CollectionConfig } from 'payload'

export const Resultados: CollectionConfig = {
  slug: 'resultados',
  admin: { useAsTitle: 'titulo', group: 'Conteudo' },
  labels: { singular: 'Resultado', plural: 'Resultados' },
  access: { read: () => true },
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
    { name: 'publicado', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
  ],
}
