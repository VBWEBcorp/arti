'use client'

import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'

import type { Ceramic } from '@/lib/content-defaults'
import { cn } from '@/lib/utils'

export type { Ceramic }

/** Photos utilisables d'une pièce (compat : ancien champ `src` unique éventuel). */
function photosOf(c: Ceramic): string[] {
  const list = Array.isArray(c.images) ? c.images.filter(Boolean) : []
  if (list.length) return list
  const legacy = (c as unknown as { src?: string }).src
  return legacy ? [legacy] : []
}

/** Carte d'une pièce : carousel de photos (si plusieurs) + infos. */
function CeramicCard({ c }: { c: Ceramic }) {
  const photos = photosOf(c)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = photos.length
  const current = count ? ((index % count) + count) % count : 0
  const go = (dir: number) => setIndex((i) => i + dir)

  // Défilement automatique quand la pièce a plusieurs photos.
  // En pause au survol ; désactivé si l'utilisateur préfère peu d'animations.
  useEffect(() => {
    if (count <= 1 || paused) return
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }
    const id = setInterval(() => setIndex((i) => i + 1), 3500)
    return () => clearInterval(id)
  }, [count, paused])

  return (
    <article className="group flex flex-col">
      <div
        className="relative aspect-[3/4] overflow-hidden bg-white shadow-sm"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {count > 0 ? (
          <>
            {/* Piste qui défile horizontalement */}
            <div
              className="absolute inset-0 flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {photos.map((src, i) => (
                <div key={i} className="relative h-full w-full shrink-0">
                  <Image
                    src={src}
                    alt={count > 1 ? `${c.alt} — photo ${i + 1}` : c.alt}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    loading="lazy"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>

            {count > 1 && (
              <>
                {/* Flèches (visibles au survol sur desktop, toujours sur mobile) */}
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Photo précédente"
                  className="absolute left-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-neutral-800 shadow-sm transition-opacity hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Photo suivante"
                  className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-neutral-800 shadow-sm transition-opacity hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <ChevronRight className="size-4" />
                </button>

                {/* Points indicateurs */}
                <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
                  {photos.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-label={`Aller à la photo ${i + 1}`}
                      className={cn(
                        'size-1.5 rounded-full transition-all',
                        i === current ? 'w-4 bg-white' : 'bg-white/60 hover:bg-white/80'
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-beige text-xs text-foreground/40">
            Aucune photo
          </div>
        )}
      </div>
      <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.18em] text-sauge-deep">
        {c.category}
      </p>
      <h3 className="mt-1 font-display text-lg font-medium leading-tight text-neutral-800">
        {c.name}
      </h3>
      <p className="mt-1 text-sm text-foreground/70">{c.price}</p>
    </article>
  )
}

export function CeramicsCatalogue({ items }: { items: Ceramic[] }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Tous')

  const categories = useMemo(
    () => ['Tous', ...Array.from(new Set(items.map((c) => c.category)))],
    [items]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((c) => {
      const matchCategory = category === 'Tous' || c.category === category
      const matchQuery =
        q === '' ||
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      return matchCategory && matchQuery
    })
  }, [items, query, category])

  return (
    <div className="mx-auto max-w-7xl px-6 sm:px-10">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-4xl font-medium text-neutral-700 sm:text-5xl">
          Notre catalogue de pièces
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-foreground/70">
          Une sélection de céramistes français, à retrouver à la boutique.
          Modèles intemporels disponibles toute l&apos;année, complétés de pièces
          de saison, de 15&nbsp;€ à 50&nbsp;€ selon la taille.
        </p>
      </div>

      {/* Recherche */}
      <div className="mx-auto mt-10 max-w-md">
        <div className="relative">
          <Search
            strokeWidth={1.7}
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-foreground/40"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une pièce…"
            aria-label="Rechercher une pièce"
            className="h-11 w-full rounded-sm border border-foreground/15 bg-white pl-11 pr-4 text-sm text-foreground placeholder:text-foreground/40 focus:border-sauge focus:outline-none focus:ring-1 focus:ring-sauge"
          />
        </div>
      </div>

      {/* Filtres par catégorie */}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-light tracking-wide transition-colors',
              category === cat
                ? 'border-sauge bg-sauge text-white'
                : 'border-foreground/15 bg-white text-foreground hover:border-sauge/50'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grille */}
      {filtered.length > 0 ? (
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
          {filtered.map((c, i) => (
            <CeramicCard key={`${c.name}-${i}`} c={c} />
          ))}
        </div>
      ) : (
        <p className="mt-16 text-center text-sm text-foreground/60">
          Aucune pièce ne correspond à votre recherche.
        </p>
      )}

      <p className="mt-12 text-center text-xs text-foreground/50">
        Modèles et prix présentés à titre indicatif. La collection évolue au fil
        des saisons et des arrivages.
      </p>
    </div>
  )
}
