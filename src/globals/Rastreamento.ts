import type { GlobalConfig } from 'payload'

/**
 * Os IDs vivem aqui para que a agencia de marketing consiga trocar container,
 * pixel ou medicao sem depender de deploy. As variaveis de ambiente continuam
 * valendo como valor padrao quando o campo estiver vazio.
 */
export const Rastreamento: GlobalConfig = {
  slug: 'rastreamento',
  label: 'Rastreamento e ads',
  admin: { group: 'Configuracoes' },
  access: { read: () => true },
  fields: [
    {
      name: 'gtmId',
      type: 'text',
      label: 'Google Tag Manager',
      admin: { description: 'Formato GTM-XXXXXXX. E o container principal.' },
    },
    {
      name: 'ga4Id',
      type: 'text',
      label: 'Google Analytics 4',
      admin: { description: 'Formato G-XXXXXXXXXX. Deixe vazio se o GA4 ja dispara pelo GTM.' },
    },
    {
      name: 'metaPixelId',
      type: 'text',
      label: 'Meta Pixel',
      admin: { description: 'Somente numeros. Deixe vazio se o pixel ja dispara pelo GTM.' },
    },
    {
      name: 'googleAdsId',
      type: 'text',
      label: 'Google Ads',
      admin: { description: 'Formato AW-XXXXXXXXX, para conversoes de anuncio.' },
    },
    {
      name: 'googleAdsLabelLead',
      type: 'text',
      label: 'Rotulo de conversao do Google Ads',
      admin: {
        description:
          'Disparado quando alguém abre o WhatsApp por qualquer botão do site. Era o envio do formulário, que não existe mais.',
      },
    },
    {
      name: 'consentimento',
      type: 'checkbox',
      label: 'Pedir consentimento de cookies',
      defaultValue: true,
      admin: {
        description:
          'Com a opcao ligada o site inicia em modo negado e so libera medicao e anuncios apos o aceite, seguindo a LGPD e o Consent Mode v2.',
      },
    },
  ],
}
