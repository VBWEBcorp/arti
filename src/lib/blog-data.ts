import { cache } from 'react'

import { connectDB } from '@/lib/db'
import { BlogPost, BlogSettings } from '@/models/Blog'
import { visiblePostFilter } from '@/lib/blog-filters'

/**
 * Accès lecture au blog pour les pages publiques (liste, article, sitemap).
 * Mutualisé ici pour un rendu cohérent et déduplique les requêtes dans une même
 * requête HTTP via `cache()`. La gestion (création/édition) reste dans l'admin.
 */

export type BlogPostLean = {
  _id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  category: string
  tags?: string[]
  author: string
  publishedAt?: string | Date
  createdAt: string | Date
  updatedAt?: string | Date
  metaTitle?: string
  metaDescription?: string
}

export type BlogSettingsLean = {
  enabled: boolean
  title: string
  description?: string
  eyebrow?: string
  heroImage?: string
  categories?: string[]
}

const DEFAULT_SETTINGS: BlogSettingsLean = {
  enabled: true,
  title: 'Nos dernières actualités',
  eyebrow: 'Blog',
  description: 'Retrouvez nos conseils, nos projets récents et les tendances du secteur.',
}

/** Paramètres du blog (valeurs par défaut si aucun document n'existe encore). */
export const getBlogSettings = cache(async (): Promise<BlogSettingsLean> => {
  await connectDB()
  const settings = await BlogSettings.findOne().lean<BlogSettingsLean>()
  return settings ? { ...DEFAULT_SETTINGS, ...settings } : DEFAULT_SETTINGS
})

/** Le blog est-il visible sur le site ? (toggle « Visible sur le site » de l'admin) */
export function isBlogEnabled(settings: BlogSettingsLean): boolean {
  return settings.enabled !== false
}

/** Articles publiés et visibles (publishedAt <= maintenant), du plus récent au plus ancien. */
export const getPublishedPosts = cache(async (): Promise<BlogPostLean[]> => {
  await connectDB()
  return BlogPost.find(visiblePostFilter())
    .sort({ publishedAt: -1, createdAt: -1 })
    .lean<BlogPostLean[]>()
})

/** Un article publié par son slug, ou null s'il n'existe pas / pas encore visible. */
export const getPublishedPostBySlug = cache(async (slug: string): Promise<BlogPostLean | null> => {
  await connectDB()
  return BlogPost.findOne({ slug, ...visiblePostFilter() }).lean<BlogPostLean>()
})
