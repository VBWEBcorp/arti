import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Calendar } from 'lucide-react'

import { getBlogSettings, getPublishedPosts, isBlogEnabled } from '@/lib/blog-data'

export const dynamic = 'force-dynamic'

const fmtDate = (d?: string | Date) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getBlogSettings()
  if (!isBlogEnabled(settings)) {
    return { title: settings.title, robots: { index: false, follow: false } }
  }
  return {
    title: settings.title,
    description: settings.description,
    alternates: { canonical: '/blog' },
    openGraph: { type: 'website', title: settings.title, description: settings.description },
  }
}

export default async function BlogPage() {
  const settings = await getBlogSettings()
  if (!isBlogEnabled(settings)) notFound()

  const posts = await getPublishedPosts()

  return (
    <>
      {/* En-tête */}
      <section className="relative isolate overflow-hidden bg-beige">
        {settings.heroImage && (
          <div className="absolute inset-0" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={settings.heroImage} alt="" className="size-full object-cover" />
            <div className="absolute inset-0 bg-black/55" />
          </div>
        )}
        <div className="relative mx-auto max-w-3xl px-6 pb-16 pt-28 text-center sm:pb-20 sm:pt-32">
          <p
            className={
              'text-xs font-medium uppercase tracking-[0.28em] ' +
              (settings.heroImage ? 'text-white/70' : 'text-sauge-deep')
            }
          >
            {settings.eyebrow || 'Blog'}
          </p>
          <h1
            className={
              'mt-3 font-display text-5xl font-medium sm:text-6xl ' +
              (settings.heroImage ? 'text-white' : 'text-foreground')
            }
          >
            {settings.title}
          </h1>
          {settings.description && (
            <p
              className={
                'mx-auto mt-5 max-w-xl text-sm leading-relaxed ' +
                (settings.heroImage ? 'text-white/80' : 'text-foreground/75')
              }
            >
              {settings.description}
            </p>
          )}
        </div>
      </section>

      {/* Liste des articles */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          {posts.length === 0 ? (
            <p className="py-16 text-center text-sm text-foreground/55">
              Aucun article pour le moment. Revenez bientôt&nbsp;!
            </p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post._id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-white shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-beige">
                    {post.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-sauge-deep/40">
                        <span className="font-display text-2xl">{settings.eyebrow || 'Blog'}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-3 text-xs text-foreground/50">
                      {post.category && (
                        <span className="rounded-full bg-sauge/15 px-2.5 py-0.5 font-medium text-sauge-deep">
                          {post.category}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" aria-hidden />
                        {fmtDate(post.publishedAt || post.createdAt)}
                      </span>
                    </div>
                    <h2 className="mt-3 font-display text-2xl font-medium leading-tight text-foreground">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-foreground/70">
                        {post.excerpt}
                      </p>
                    )}
                    <span className="mt-4 text-sm font-medium text-sauge-deep">Lire l&apos;article →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
