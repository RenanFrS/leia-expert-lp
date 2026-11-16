import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // As fotos saem redimensionadas pelo Cloudinary, e nao pelo otimizador da
  // Vercel, que tem cota pequena no plano Hobby. O motivo esta no proprio
  // carregador. Formato e qualidade vao no `f_auto,q_auto` da URL.
  images: {
    loader: 'custom',
    loaderFile: './src/lib/carregador-imagem.ts',
  },
  // O carregador roda tambem no navegador, que nao enxerga as variaveis do
  // servidor. O nome da conta e a pasta nao sao segredo: aparecem em toda URL
  // da CDN. As chaves da API continuam so no servidor.
  env: {
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    NEXT_PUBLIC_CLOUDINARY_FOLDER: process.env.CLOUDINARY_FOLDER || 'leia-expert',
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/fonts/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ]
  },
}

export default withPayload(nextConfig)
