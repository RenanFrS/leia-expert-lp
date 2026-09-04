import path from 'path'
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { pt } from '@payloadcms/translations/languages/pt'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Tratamentos } from './collections/Tratamentos'
import { Depoimentos } from './collections/Depoimentos'
import { Resultados } from './collections/Resultados'
import { Galeria } from './collections/Galeria'
import { Faq } from './collections/Faq'
import { Leads } from './collections/Leads'
import { Contatos } from './collections/Contatos'
import { Clinica } from './globals/Clinica'
import { Rastreamento } from './globals/Rastreamento'
import { Seo } from './globals/Seo'
import { cloudinaryAdapter } from './lib/cloudinary-adapter'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const emProducao = process.env.NODE_ENV === 'production'
const urlSite = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export default buildConfig({
  // O painel responde em /admin.
  routes: { admin: '/admin' },

  // A moldura do painel em portugues: botoes, mensagens e menu. Os rotulos das
  // colecoes ja vinham escritos em portugues, entao isso completa o resto.
  // O `pt` vem do proprio `@payloadcms/translations`, sem instalar nada.
  i18n: { fallbackLanguage: 'pt', supportedLanguages: { pt } },

  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: ' | Léia Expert',
    },
    components: {},
  },

  collections: [Tratamentos, Resultados, Galeria, Depoimentos, Faq, Leads, Contatos, Media, Users],
  globals: [Clinica, Seo, Rastreamento],

  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },

  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI || '' },
  }),

  // Aviso de lead novo. Sem SMTP_HOST o Payload cai no adaptador padrao, que so
  // registra no log, entao o site sobe igual e o formulario continua gravando.
  // Os tempos limite existem para um SMTP lento nao segurar o envio do formulario.
  email: process.env.SMTP_HOST
    ? nodemailerAdapter({
        defaultFromAddress: process.env.SMTP_FROM || 'nao-responda@leiaexpert.com.br',
        defaultFromName: 'Site Léia Expert',
        transportOptions: {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_PORT === '465',
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
          connectionTimeout: 5000,
          greetingTimeout: 5000,
          socketTimeout: 10000,
        },
      })
    : undefined,

  plugins: [
    cloudStoragePlugin({
      collections: {
        media: { adapter: cloudinaryAdapter() },
      },
    }),
    seoPlugin({
      collections: ['tratamentos'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => `${doc?.titulo} | Léia Expert`,
      generateDescription: ({ doc }) => doc?.resumo,
    }),
  ],

  sharp,
  // Em producao so a url configurada vale. Em desenvolvimento o Next troca de
  // porta sozinho quando a 3000 esta ocupada, e o painel local bateria no csrf.
  cors: emProducao ? [urlSite] : '*',
  csrf: emProducao ? [urlSite] : [],
})
