'use client'

/**
 * Camada unica de eventos. Tudo passa pelo dataLayer, entao a agencia consegue
 * criar tags, gatilhos e conversoes no GTM sem precisar de alteracao no codigo.
 */

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
  }
}

export type EventoNome =
  | 'clique_whatsapp'
  | 'clique_agendar'
  | 'inicio_formulario'
  | 'envio_formulario'
  | 'erro_formulario'
  | 'ver_tratamento'
  | 'abrir_faq'

export const pushEvento = (evento: EventoNome, dados: Record<string, unknown> = {}) => {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event: evento, ...dados })
}

/**
 * Conversao de lead. Dispara no dataLayer e tambem direto no GA4, no Meta e no
 * Google Ads quando esses IDs estao configurados fora do GTM.
 */
export const registrarLead = (dados: {
  motivo?: string
  googleAdsId?: string
  googleAdsLabel?: string
}) => {
  pushEvento('envio_formulario', { motivo: dados.motivo })

  if (typeof window === 'undefined') return

  window.gtag?.('event', 'generate_lead', {
    currency: 'BRL',
    value: 1,
    motivo: dados.motivo,
  })

  window.fbq?.('track', 'Lead', { content_category: dados.motivo })

  if (dados.googleAdsId && dados.googleAdsLabel) {
    window.gtag?.('event', 'conversion', {
      send_to: `${dados.googleAdsId}/${dados.googleAdsLabel}`,
    })
  }
}

/** Le os parametros UTM da URL para gravar a origem junto com o lead. */
export const lerUtms = () => {
  if (typeof window === 'undefined') return {}
  const params = new URLSearchParams(window.location.search)
  const chaves = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const

  const origem: Record<string, string> = { pagina: window.location.pathname }
  chaves.forEach((chave) => {
    const valor = params.get(chave)
    if (valor) origem[chave] = valor
  })

  return origem
}
