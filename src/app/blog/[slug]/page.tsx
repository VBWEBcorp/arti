import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar } from 'lucide-react'

import { getBlogSettings, getPublishedPostBySlug, isBlogEnabled } from '@/lib/blog-data'

export const dynamic = 'force-dynamic'

type Params = Promise<{ slug: string }>

const fmtDate = (d?: string | Date) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const [settings, post] = await Promise.all([getBlogSettings(), getPublishedPostBySlug(slug)])
  if (!post || !isBlogEnabled(settings)) return { title: 'Article introuvable', robots: { index: false } }

  const title = post.metaTitle || post.title
  const description = post.metaDescription || post.excerpt
  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title,
      description,
      publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
  }
}

export default async function BlogArticlePage({ params }: { params: Params }) {
  const { slug } = await params
  const [settings, post] = await Promise.all([getBlogSettings(), getPublishedPostBySlug(slug)])
  if (!isBlogEnabled(settings) || !post) notFound()

  return (
    <article className="bg-white pb-20">
      {/* Cover */}
      {post.coverImage && (
        <div className="relative aspect-[21/9] w-full overflow-hidden bg-beige">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.coverImage} alt={post.title} className="size-full object-cover" />
        </div>
      )}

      <div className="mx-auto max-w-2xl px-6 pt-10 sm:px-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-foreground/55 transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden /> Tous les articles
        </Link>

        {/* En-tête article */}
        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-foreground/50">
          {post.category && (
            <span className="rounded-full bg-sauge/15 px-2.5 py-0.5 font-medium text-sauge-deep">
              {post.category}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="size-3" aria-hidden />
            {fmtDate(post.publishedAt || post.createdAt)}
          </span>
          {post.author && <span>par {post.author}</span>}
        </div>

        <h1 className="mt-4 font-display text-4xl font-medium leading-tight text-foreground sm:text-5xl">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="mt-4 text-lg leading-relaxed text-foreground/70">{post.excerpt}</p>
        )}

        <hr className="mt-8 border-foreground/10" />

        {/* Contenu (HTML riche issu de l'éditeur) */}
        <div
          className="mt-8 text-[15px] leading-relaxed text-foreground/80
            [&_a]:text-sauge-deep [&_a]:underline
            [&_blockquote]:my-5 [&_blockquote]:border-l-2 [&_blockquote]:border-sauge [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-foreground/70
            [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-3xl [&_h2]:font-medium [&_h2]:text-foreground
            [&_h3]:mb-2 [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-2xl [&_h3]:text-foreground
            [&_img]:my-6 [&_img]:rounded-xl
            [&_li]:my-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-4
            [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Pied : retour */}
        <div className="mt-12 border-t border-foreground/10 pt-8 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-sauge-deep transition-colors hover:text-sauge"
          >
            <ArrowLeft className="size-4" aria-hidden /> Retour au blog
          </Link>
        </div>
      </div>
    </article>
  )
}
