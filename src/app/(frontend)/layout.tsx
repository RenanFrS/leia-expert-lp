import type { Metadata, Viewport } from 'next'
import { Fraunces, Instrument_Sans, JetBrains_Mono } from 'next/font/google'
import { getPayload } from 'payload'
import config from '@payload-config'

import { Analytics } from '@/components/Analytics'
import { SmoothScroll } from '@/components/SmoothScroll'
import './globals.css'

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const body = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500'],
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const viewport: Viewport = {
  themeColor: '#775642',
  width: 'device-width',
  initialScale: 1,
}

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayload({ config })
  const [seo, clinica] = await Promise.all([
    payload.findGlobal({ slug: 'seo', depth: 1 }).catch(() => null),
    payload.findGlobal({ slug: 'clinica', depth: 0 }).catch(() => null),
  ])

  const titulo = seo?.titulo || 'Tricologia clinica e tratamento capilar | Leia Expert'
  const descricao =
    seo?.descricao ||
    'Clinica de tricologia com tricoscopia digital, diagnostico do couro cabeludo e protocolos para queda capilar e alopecia.'
  const imagem = (seo?.imagemCompartilhamento as { url?: string } | undefined)?.url

  return {
    metadataBase: new URL(siteUrl),
    title: { default: titulo, template: `%s | ${clinica?.nome || 'Leia Expert'}` },
    description: descricao,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      locale: 'pt_BR',
      url: siteUrl,
      siteName: clinica?.nome || 'Leia Expert',
      title: titulo,
      description: descricao,
      images: imagem ? [{ url: imagem, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: titulo,
      description: descricao,
      images: imagem ? [imagem] : undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : undefined,
  }
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayload({ config })
  const rastreamento = await payload.findGlobal({ slug: 'rastreamento', depth: 0 }).catch(() => null)

  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body>
        <a href="#conteudo" className="pular-navegacao">
          Pular para o conteudo
        </a>
        <SmoothScroll />
        {children}
        <Analytics
          config={{
            gtmId: rastreamento?.gtmId || process.env.NEXT_PUBLIC_GTM_ID,
            ga4Id: rastreamento?.ga4Id || process.env.NEXT_PUBLIC_GA4_ID,
            metaPixelId: rastreamento?.metaPixelId || process.env.NEXT_PUBLIC_META_PIXEL_ID,
            googleAdsId: rastreamento?.googleAdsId,
            consentimento: rastreamento?.consentimento ?? true,
          }}
        />
      </body>
    </html>
  )
}
