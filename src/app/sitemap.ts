import type { MetadataRoute } from 'next'

import { siteConfig } from '@/lib/seo'

const baseUrl = siteConfig.url

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: 'weekly', priority: 1, lastModified: new Date() },
    { url: `${baseUrl}/le-concept`, changeFrequency: 'monthly', priority: 0.9, lastModified: new Date() },
    { url: `${baseUrl}/arti-ceramiques`, changeFrequency: 'monthly', priority: 0.9, lastModified: new Date() },
    { url: `${baseUrl}/peinture-sur-ceramique-a-rennes`, changeFrequency: 'monthly', priority: 0.9, lastModified: new Date() },
    { url: `${baseUrl}/infos-pratiques`, changeFrequency: 'monthly', priority: 0.8, lastModified: new Date() },
    { url: `${baseUrl}/arti-cadeaux`, changeFrequency: 'monthly', priority: 0.8, lastModified: new Date() },
    { url: `${baseUrl}/carte`, changeFrequency: 'monthly', priority: 0.7, lastModified: new Date() },
    { url: `${baseUrl}/kit-a-emporter`, changeFrequency: 'monthly', priority: 0.7, lastModified: new Date() },
    { url: `${baseUrl}/produit/carte-cadeau`, changeFrequency: 'monthly', priority: 0.7, lastModified: new Date() },
    { url: `${baseUrl}/faq`, changeFrequency: 'monthly', priority: 0.6, lastModified: new Date() },
  ]
  return pages
}
