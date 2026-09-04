import type { CollectionConfig } from 'payload'

import { ehAdmin } from '@/lib/acesso'

/**
 * Registro de cada clique que abre o WhatsApp, com a origem de campanha junto.
 *
 * **Ela existe para a regra de medicao continuar de pe depois que o formulario
 * saiu.** Enquanto havia formulario, a UTM era gravada em cada lead, e era isso
 * que permitia cruzar o que o painel de anuncios reporta com o que a clinica
 * realmente recebeu. Sem formulario aquele cruzamento acabaria: o site
 * dispararia o evento e ninguem saberia de qual campanha veio o contato.
 *
 * O que ela entrega e menos do que o lead entregava, e vale saber a diferenca:
 * aqui aparece **quantos contatos cada campanha gerou**, nao quem sao. Nome e
 * telefone so existem dentro da conversa do WhatsApp.
 *
 * **Nao ha dado pessoal aqui.** Data, local do clique, pagina e UTM. O IP e lido
 * na rota so para o limite por minuto e nao e gravado, entao isto nao depende do
 * banner de consentimento.
 *
 * E uma linha por clique, entao ela cresce rapido. Vale combinar uma limpeza
 * periodica com a clinica.
 */
export const Contatos: CollectionConfig = {
  slug: 'contatos',
  admin: {
    useAsTitle: 'local',
    defaultColumns: ['local', 'createdAt'],
    group: 'Atendimento',
    description:
      'Cada clique que abriu o WhatsApp, com a campanha de origem. Preenchido pelo site, não pela mão.',
  },
  labels: { singular: 'Contato', plural: 'Contatos' },
  defaultSort: '-createdAt',
  access: {
    // A gravacao vem da rota, que usa a Local API e ignora access control.
    // Fechar o create aqui bloqueia REST e GraphQL sem afetar o site, e e o que
    // impede alguem de encher a base pulando o limite por IP. Mesmo desenho da
    // colecao Leads.
    create: () => false,
    read: ({ req }) => ehAdmin(req.user),
    update: ({ req }) => ehAdmin(req.user),
    delete: ({ req }) => ehAdmin(req.user),
  },
  fields: [
    {
      name: 'local',
      type: 'text',
      required: true,
      label: 'De onde partiu',
      admin: { description: 'header, tricoscopia, sobre, fechamento, footer, botao-flutuante...' },
    },
    {
      // Mesma forma do grupo `origem` da colecao Leads, de proposito: os dois
      // relatorios precisam ler igual para poderem ser comparados.
      name: 'origem',
      type: 'group',
      label: 'Origem da campanha',
      admin: { description: 'Preenchido automaticamente pelos parametros UTM.' },
      fields: [
        { name: 'utm_source', type: 'text' },
        { name: 'utm_medium', type: 'text' },
        { name: 'utm_campaign', type: 'text' },
        { name: 'utm_content', type: 'text' },
        { name: 'utm_term', type: 'text' },
        { name: 'pagina', type: 'text' },
      ],
    },
  ],
}
