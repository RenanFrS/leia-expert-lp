import type { MetadataRoute } from 'next'

import { urlSite } from '@/lib/url-site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api'] }],
    sitemap: `${urlSite}/sitemap.xml`,
  }
}
