import type { MetadataRoute } from 'next'

import { siteConfig } from '@/lib/seo'
import { getBlogSettings, getPublishedPosts, isBlogEnabled } from '@/lib/blog-data'

const baseUrl = siteConfig.url

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  // Blog : index + articles publiés ajoutés automatiquement (auto-indexation).
  // Tolérant aux pannes : si la base est injoignable (ex. build hors-ligne),
  // on renvoie quand même les pages statiques.
  try {
    const settings = await getBlogSettings()
    if (isBlogEnabled(settings)) {
      pages.push({ url: `${baseUrl}/blog`, changeFrequency: 'weekly', priority: 0.7, lastModified: new Date() })
      const posts = await getPublishedPosts()
      for (const post of posts) {
        pages.push({
          url: `${baseUrl}/blog/${post.slug}`,
          changeFrequency: 'monthly',
          priority: 0.6,
          lastModified: new Date(post.updatedAt || post.publishedAt || post.createdAt),
        })
      }
    }
  } catch (error) {
    console.error('Sitemap blog error:', error)
  }

  return pages
}
