import type { CollectionConfig } from 'payload'

import { ehAdmin, ehAds } from '@/lib/acesso'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: { tokenExpiration: 60 * 60 * 8, maxLoginAttempts: 5, lockTime: 10 * 60 * 1000 },
  admin: {
    useAsTitle: 'nome',
    group: 'Sistema',
    // O papel ads nao gerencia ninguem, entao a colecao sai do menu dele. A
    // pagina da propria conta continua valendo, que e onde ele troca a senha.
    hidden: ({ user }) => ehAds(user),
  },
  labels: { singular: 'Usuario', plural: 'Usuarios' },
  access: {
    // Sem isso o editor abre esta colecao e se promove, o que anularia a trava
    // de leitura dos leads. Editar a si mesmo continua liberado, para trocar
    // nome e senha.
    create: ({ req }) => ehAdmin(req.user),
    // O ads enxerga so o proprio cadastro. A condicao de busca, em vez de um
    // `false`, existe porque o painel precisa ler o documento dele para montar
    // a conta e o menu; negando tudo, ele entra sem conseguir trocar a senha.
    read: ({ req }) => {
      if (!req.user) return false
      if (ehAds(req.user)) return { id: { equals: req.user.id } }
      return true
    },
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
        { label: 'Ads', value: 'ads' },
      ],
      admin: {
        description:
          'Administrador ve os leads e gerencia usuarios. Editor so cuida do conteudo do site. Ads so abre Configuracoes > Rastreamento e ads, para a agencia mexer nas tags sem encostar no conteudo.',
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
