import type { MetadataRoute } from 'next'

import { products } from '@/content/products'
import { site } from '@/content/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: site.url, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${site.url}/catalogue`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${site.url}/composer`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${site.url}/credits`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    ...products.map((p) => ({
      url: `${site.url}/catalogue/${p.slug}`,
      lastModified: new Date(p.createdAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
