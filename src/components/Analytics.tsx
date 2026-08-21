'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export type ConfigRastreamento = {
  gtmId?: string | null
  ga4Id?: string | null
  metaPixelId?: string | null
  googleAdsId?: string | null
  consentimento?: boolean | null
}

const CHAVE_CONSENTIMENTO = 'leia-consentimento'

/**
 * Consent Mode v2. O site inicia com medicao e anuncios negados e so libera
 * apos o aceite, o que atende a LGPD sem quebrar a modelagem de conversao.
 */
const scriptConsentimentoPadrao = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = window.gtag || gtag;
var salvo = null;
try { salvo = localStorage.getItem('${CHAVE_CONSENTIMENTO}'); } catch (e) {}
gtag('consent', 'default', {
  ad_storage: salvo === 'aceito' ? 'granted' : 'denied',
  ad_user_data: salvo === 'aceito' ? 'granted' : 'denied',
  ad_personalization: salvo === 'aceito' ? 'granted' : 'denied',
  analytics_storage: salvo === 'aceito' ? 'granted' : 'denied',
  functionality_storage: 'granted',
  security_storage: 'granted',
});
gtag('js', new Date());
`

export function Analytics({ config }: { config: ConfigRastreamento }) {
  const { gtmId, ga4Id, metaPixelId, googleAdsId, consentimento } = config
  const [decidido, setDecidido] = useState(true)

  useEffect(() => {
    if (!consentimento) return
    try {
      setDecidido(Boolean(localStorage.getItem(CHAVE_CONSENTIMENTO)))
    } catch {
      setDecidido(true)
    }
  }, [consentimento])

  const responder = (aceito: boolean) => {
    const estado = aceito ? 'granted' : 'denied'
    window.gtag?.('consent', 'update', {
      ad_storage: estado,
      ad_user_data: estado,
      ad_personalization: estado,
      analytics_storage: estado,
    })
    try {
      localStorage.setItem(CHAVE_CONSENTIMENTO, aceito ? 'aceito' : 'recusado')
    } catch {
      /* navegacao privada bloqueia o storage, seguimos sem persistir */
    }
    setDecidido(true)
  }

  return (
    <>
      <Script id="consent-default" strategy="beforeInteractive">
        {scriptConsentimentoPadrao}
      </Script>

      {gtmId && (
        <>
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
              title="Google Tag Manager"
            />
          </noscript>
        </>
      )}

      {(ga4Id || googleAdsId) && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id || googleAdsId}`}
            strategy="afterInteractive"
          />
          <Script id="gtag-config" strategy="afterInteractive">
            {`${ga4Id ? `gtag('config', '${ga4Id}', { send_page_view: true });` : ''}
${googleAdsId ? `gtag('config', '${googleAdsId}');` : ''}`}
          </Script>
        </>
      )}

      {metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');`}
        </Script>
      )}

      {consentimento && !decidido && (
        <div
          role="dialog"
          aria-label="Preferencias de cookies"
          className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-2xl rounded-lg border border-tinta/10 bg-porcelana p-5 shadow-lg md:p-6"
        >
          <p className="text-sm text-tinta-suave">
            Usamos cookies para medir o desempenho do site e melhorar sua experiencia. Voce escolhe se
            quer permitir.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button size="sm" onClick={() => responder(true)}>
              Permitir cookies
            </Button>
            <Button size="sm" variant="outline" onClick={() => responder(false)}>
              Apenas o essencial
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
