import type { MetadataRoute } from 'next'

import { urlSite } from '@/lib/url-site'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: urlSite,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]
}
