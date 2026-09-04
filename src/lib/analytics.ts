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
    /**
     * Conversao do Google Ads, publicada pelo `Analytics.tsx` no carregamento.
     *
     * Ela vive no window, e nao em prop, porque quem precisa dela e o clique de
     * WhatsApp, e esse botao aparece em seis secoes diferentes: levar o rotulo
     * por prop obrigaria a atravessar a pagina inteira com dois campos de
     * rastreamento so para o botao poder disparar a conversao.
     */
    leiaAds?: { id?: string | null; label?: string | null }
  }
}

/**
 * Os quatro eventos de formulario sairam daqui quando o formulario saiu do site:
 * `clique_agendar`, `inicio_formulario`, `envio_formulario` e `erro_formulario`.
 * Evento tipado sem emissor e o mesmo buraco que o `ver_tratamento` ja teve, com
 * a agencia lendo no relatorio um evento que a pagina nunca produz. Nao
 * reintroduza nenhum deles sem que exista de novo um lugar que dispare.
 */
export type EventoNome = 'clique_whatsapp' | 'ver_tratamento' | 'abrir_faq'

export const pushEvento = (evento: EventoNome, dados: Record<string, unknown> = {}) => {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event: evento, ...dados })
}

/**
 * **Porta unica de todo clique que abre o WhatsApp.** Nao chame `pushEvento`
 * direto para isso, nem em componente que monte o `wa.me` na mao.
 *
 * Ela faz tres coisas de uma vez, e as tres precisam andar juntas:
 *
 * 1. empurra `clique_whatsapp` no dataLayer, para a agencia montar tag e gatilho
 *    no GTM sem tocar em codigo
 * 2. dispara a conversao direto no GA4, no Meta e no Google Ads. **Isto era o
 *    papel do envio do formulario.** Com o formulario fora do ar, o clique
 *    passou a ser a conversao: sem isso a conta de anuncios ficaria sem sinal
 *    nenhum para otimizar
 * 3. grava o clique com a UTM da visita, o que substitui a origem que antes era
 *    gravada em cada lead
 *
 * Vale saber o que isso custa em precisao: **clique nao e conversa aberta**. O
 * numero daqui e maior do que o de pessoas que realmente escreveram para a
 * clinica, e a agencia precisa saber disso ao comparar com o painel de anuncios.
 *
 * Os dois chamadores sao o `components/BotaoWhatsapp.tsx` e o
 * `components/sections/WhatsappFlutuante.tsx`, que nao usa o botao porque tem
 * casca propria de Lottie.
 */
export const registrarContatoWhatsapp = (local: string) => {
  pushEvento('clique_whatsapp', { local })

  if (typeof window === 'undefined') return

  window.gtag?.('event', 'generate_lead', { currency: 'BRL', value: 1, local })
  window.fbq?.('track', 'Lead', { content_category: local })

  const ads = window.leiaAds
  if (ads?.id && ads?.label) {
    window.gtag?.('event', 'conversion', { send_to: `${ads.id}/${ads.label}` })
  }

  registrarContatoNoPainel(local)
}

/**
 * Manda o clique para `/api/registrar-contato`, com a UTM junto.
 *
 * **O endereco nao e `/api/contatos` de proposito**: aquele caminho pertence ao
 * REST da colecao, e uma rota nossa ali sombreia o endpoint do Payload. O porque
 * completo esta no comentario da rota.
 *
 * **Por `sendBeacon`, e nao por `fetch` comum.** O clique navega para o WhatsApp
 * logo em seguida, e requisicao normal e cancelada quando a pagina sai. O
 * beacon e entregue pelo navegador mesmo depois da navegacao, que e exatamente
 * o caso de uso dele.
 *
 * Falha em silencio de proposito: perder o registro de origem e ruim, impedir a
 * pessoa de abrir a conversa seria muito pior.
 */
const registrarContatoNoPainel = (local: string) => {
  const corpo = JSON.stringify({ local, origem: lerUtms() })

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/registrar-contato', new Blob([corpo], { type: 'application/json' }))
      return
    }

    // Reserva para navegador sem sendBeacon. O `keepalive` e o que faz a
    // requisicao sobreviver a saida da pagina.
    void fetch('/api/registrar-contato', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: corpo,
      keepalive: true,
    }).catch(() => {})
  } catch {
    /* sem registro de origem, o clique ja foi contado no dataLayer */
  }
}

/**
 * Le os parametros UTM da URL, que sao gravados junto de cada contato.
 *
 * Servia ao formulario e hoje serve ao registro de clique. E o que sustenta a
 * regra de medicao: sem isso, o painel mostra quantos contatos houve mas nao de
 * qual campanha vieram.
 */
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
