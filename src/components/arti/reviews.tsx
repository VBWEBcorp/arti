'use client'

import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'

type Review = {
  name: string
  when: string
  initial: string
  color: string
  text: string
}

// Vrais avis Google (widget Trustindex du site articafeceramique.fr).
const reviews: Review[] = [
  {
    name: 'Apolline Lesage',
    when: 'il y a 8 mois',
    initial: 'A',
    color: 'bg-[#1A73E8]',
    text: "Super expérience !! La personne qui nous a accueillies était au top, disponible pour répondre aux questions et nous donner des conseils. L'ambiance est très sympa, on s'y sent bien et tout est réuni pour créer de belles céramiques.",
  },
  {
    name: 'Cynthia LACARRERE',
    when: 'il y a 8 mois',
    initial: 'C',
    color: 'bg-[#7E57C2]',
    text: "Nous avons passé un excellent moment dans ce café céramique. L'accueil est chaleureux et nous nous y sommes bien senties.",
  },
  {
    name: 'Fiona Hbrt',
    when: 'il y a 9 mois',
    initial: 'F',
    color: 'bg-[#5C6BC0]',
    text: "Nous avons passé un très bon moment entre filles en famille à Arti Café. Le cadre est agréable et paisible, la playlist excellente et à un volume modéré, juste ce qu'il faut, la gérante très souriante et d'une grande douceur. Les explications sont claires, le matériel en quantité suffisante.",
  },
  {
    name: 'Lilou PDP',
    when: 'il y a 9 mois',
    initial: 'L',
    color: 'bg-[#26A69A]',
    text: "Super concept, je suis fan du résultat final 🤩 J'ai adoré le moment passé avec mon amie, l'endroit et l'ambiance chaleureuse.",
  },
  {
    name: 'Fanette Herisse',
    when: 'il y a 4 mois',
    initial: 'FH',
    color: 'bg-[#E89A6A]',
    text: 'Parfait. Un moment unique 🙂',
  },
  {
    name: 'Fleur',
    when: 'il y a 7 mois',
    initial: 'F',
    color: 'bg-[#6A8FE8]',
    text: 'Super expérience ! Beaucoup de choix de céramique selon les saisons !',
  },
  {
    name: 'Margaux B',
    when: 'il y a 4 mois',
    initial: 'MB',
    color: 'bg-[#D04A78]',
    text: 'Super expérience de peinture sur céramique, nous recommandons chaudement ! La personne qui nous accueille est extrêmement gentille et disponible. Le café est également très bon.',
  },
]

// Liste dupliquée pour la boucle infinie.
const loop = [...reviews, ...reviews]

function GoogleG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34A21.99 21.99 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z" />
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
    </svg>
  )
}

function VerifiedBadge({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-label="Avis vérifié" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="11" fill="#4285F4" />
      <path d="M7 12.4l3.2 3.2L17 8.8" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Reviews() {
  const trackRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0
    let last = performance.now()
    let pos = track.scrollLeft
    const speed = 30 // px / seconde

    const step = (now: number) => {
      const dt = now - last
      last = now
      if (pausedRef.current) {
        pos = track.scrollLeft
      } else {
        pos += (speed * dt) / 1000
        const half = track.scrollWidth / 2
        if (half > 0 && pos >= half) pos -= half
        track.scrollLeft = pos
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [])

  const slide = useCallback((dir: -1 | 1) => {
    const track = trackRef.current
    if (!track) return
    pausedRef.current = true
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    track.scrollBy({ left: dir * track.clientWidth * 0.5, behavior: 'smooth' })
    resumeTimer.current = setTimeout(() => {
      pausedRef.current = false
    }, 1800)
  }, [])

  return (
    <section className="overflow-hidden bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <p className="text-center text-xs font-medium uppercase tracking-[0.28em] text-sauge-deep">
          Ce qu&apos;ils pensent de nous
        </p>
        <h2 className="mt-4 text-center font-display text-5xl font-medium text-foreground sm:text-6xl">
          Découvrez les avis clients
        </h2>
      </div>

      <div className="relative mt-14">
        <div
          ref={trackRef}
          onMouseEnter={() => (pausedRef.current = true)}
          onMouseLeave={() => (pausedRef.current = false)}
          className="scrollbar-hide flex items-start gap-4 overflow-x-auto px-4"
          role="region"
          aria-label="Avis clients"
        >
          {loop.map((r, i) => (
            <article
              key={i}
              aria-hidden={i >= reviews.length}
              className="flex w-[80vw] shrink-0 flex-col items-center px-4 text-center sm:w-[44vw] lg:w-[23vw]"
            >
              <div className="relative">
                <div
                  className={`flex size-14 items-center justify-center rounded-full ${r.color} font-sans text-base font-semibold text-white`}
                  aria-hidden
                >
                  {r.initial}
                </div>
                <span className="absolute -bottom-1 -right-1 rounded-full bg-white p-[3px] shadow-sm ring-1 ring-foreground/5">
                  <GoogleG className="size-3.5" />
                </span>
              </div>

              <p className="mt-4 font-sans text-sm font-semibold text-foreground">
                {r.name}
              </p>
              <p className="text-xs text-foreground/60">{r.when}</p>

              <div className="mt-2 flex items-center gap-0.5 text-[#F5B544]">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="size-3.5 fill-current" strokeWidth={0} />
                ))}
                <VerifiedBadge className="ml-1 size-4" />
              </div>

              <p className="mt-4 line-clamp-4 text-[13px] leading-relaxed text-foreground/80">
                {r.text}
              </p>
            </article>
          ))}
        </div>

        {/* Flèches */}
        <button
          type="button"
          aria-label="Avis précédents"
          onClick={() => slide(-1)}
          className="absolute left-0 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-md bg-white text-foreground shadow-md ring-1 ring-foreground/5 transition-colors hover:bg-beige"
        >
          <ChevronLeft className="size-6" strokeWidth={1.6} />
        </button>
        <button
          type="button"
          aria-label="Avis suivants"
          onClick={() => slide(1)}
          className="absolute right-0 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-md bg-white text-foreground shadow-md ring-1 ring-foreground/5 transition-colors hover:bg-beige"
        >
          <ChevronRight className="size-6" strokeWidth={1.6} />
        </button>
      </div>
    </section>
  )
}
