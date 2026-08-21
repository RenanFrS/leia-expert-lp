import type { CollectionConfig } from 'payload'

import { ehAdmin } from '@/lib/acesso'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: { tokenExpiration: 60 * 60 * 8, maxLoginAttempts: 5, lockTime: 10 * 60 * 1000 },
  admin: { useAsTitle: 'nome', group: 'Sistema' },
  labels: { singular: 'Usuario', plural: 'Usuarios' },
  access: {
    // Sem isso o editor abre esta colecao e se promove, o que anularia a trava
    // de leitura dos leads. Editar a si mesmo continua liberado, para trocar
    // nome e senha.
    create: ({ req }) => ehAdmin(req.user),
    read: ({ req }) => Boolean(req.user),
    update: ({ req, id }) => ehAdmin(req.user) || req.user?.id === id,
    delete: ({ req }) => ehAdmin(req.user),
  },
  fields: [
    { name: 'nome', type: 'text', required: true },
    {
      name: 'papel',
      type: 'select',
      required: true,
      // Administrador por padrao porque o primeiro usuario e criado sem ninguem
      // logado. Se caisse em editor, ele nasceria sem acesso aos leads e sem
      // poder se corrigir.
      defaultValue: 'admin',
      options: [
        { label: 'Administrador', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      admin: {
        description:
          'Administrador ve os leads e gerencia usuarios. Editor so cuida do conteudo do site.',
      },
      access: {
        // So administrador muda papel, inclusive o proprio. Nao travo a criacao
        // aqui porque a colecao ja exige admin, e travar quebraria o cadastro do
        // primeiro usuario, que roda sem ninguem logado.
        update: ({ req }) => ehAdmin(req.user),
      },
    },
  ],
}
