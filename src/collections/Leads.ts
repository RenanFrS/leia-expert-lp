import type { CollectionConfig } from 'payload'

import { ehAdmin } from '@/lib/acesso'
import { avisarLeadNovo } from '@/lib/aviso-lead'
import { opcoesDeMotivo } from '@/lib/motivos'

export const Leads: CollectionConfig = {
  slug: 'leads',
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'whatsapp', 'email', 'motivo', 'status', 'createdAt'],
    group: 'Atendimento',
  },
  defaultSort: '-createdAt',
  labels: { singular: 'Lead', plural: 'Leads' },
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return
        await avisarLeadNovo(req.payload, doc)
      },
    ],
  },
  access: {
    // A gravacao vem da rota do formulario, que usa a Local API e ignora access
    // control. Fechar o create aqui bloqueia REST e GraphQL sem afetar o site,
    // e e o que impede alguem de encher a base pulando o Zod e o limite por IP.
    create: () => false,
    read: ({ req }) => ehAdmin(req.user),
    update: ({ req }) => ehAdmin(req.user),
    delete: ({ req }) => ehAdmin(req.user),
  },
  fields: [
    { name: 'nome', type: 'text', required: true },
    { name: 'email', type: 'email' },
    { name: 'whatsapp', type: 'text', required: true },
    { name: 'motivo', type: 'select', required: true, options: opcoesDeMotivo },
    { name: 'mensagem', type: 'textarea' },
    {
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
    {
      name: 'status',
      type: 'select',
      defaultValue: 'novo',
      options: [
        { label: 'Novo', value: 'novo' },
        { label: 'Em contato', value: 'em-contato' },
        { label: 'Agendado', value: 'agendado' },
        { label: 'Perdido', value: 'perdido' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
}
