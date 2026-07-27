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

// Vrais avis Google d'ARTI Café Céramique (note globale 4,9/5 · 95 avis).
const reviews: Review[] = [
  {
    name: 'Imen FC',
    when: 'il y a 2 mois',
    initial: 'I',
    color: 'bg-[#1A73E8]',
    text: "Nous y avons passé une super matinée ! Les filles sont très sympas, beaucoup de choix en termes de céramique et c'était plutôt calme quand nous y sommes allées ! C'était parfait !",
  },
  {
    name: 'Marine Lebreton',
    when: 'il y a 1 mois',
    initial: 'ML',
    color: 'bg-[#7E57C2]',
    text: "Première fois dans cette expérience d'art, personnel très gentil et à l'écoute de nos questions.",
  },
  {
    name: 'Sarah Galon',
    when: 'il y a 6 mois',
    initial: 'SG',
    color: 'bg-[#5C6BC0]',
    text: "Une expérience créative et conviviale dans un lieu vraiment unique ! L'atelier est super cosy et inspirant, parfait pour se détendre et s'exprimer.",
  },
  {
    name: 'J. Duverger',
    when: 'il y a 7 mois',
    initial: 'JD',
    color: 'bg-[#26A69A]',
    text: "Complètement Arti-addict ! Depuis que j'ai découvert ce café, j'y entraîne tous mes ami·es et m'y retrouve toutes les deux semaines.",
  },
  {
    name: 'Ines Le Gal',
    when: 'il y a 7 mois',
    initial: 'IL',
    color: 'bg-[#E89A6A]',
    text: "Une super activité ! Le lieu est magnifique : très bien décoré, cosy, avec de jolies pièces.",
  },
  {
    name: 'Angel Ange',
    when: 'il y a 4 mois',
    initial: 'A',
    color: 'bg-[#D04A78]',
    text: "Un moment exquis. L'activité est géniale et les filles sont d'une gentillesse… ça donne envie de revenir faire d'autres œuvres très vite ! Merci pour cet agréable moment ❤️",
  },
  {
    name: 'Marion',
    when: 'il y a 1 an',
    initial: 'M',
    color: 'bg-[#6A8FE8]',
    text: "Ma sœur et moi avons passé un super après-midi. On oublie tout, on se déconnecte et on se détend dans un très beau lieu apaisant décoré avec beaucoup de goût.",
  },
  {
    name: 'Mathilde Thoma',
    when: 'il y a 1 an',
    initial: 'MT',
    color: 'bg-[#00897B]',
    text: "Je suis absolument ravie de mon expérience chez Arti Café Céramique ! L'endroit est magnifique, l'ambiance est à la fois cosy et inspirante.",
  },
  {
    name: 'Anne',
    when: 'il y a 1 an',
    initial: 'A',
    color: 'bg-[#8E24AA]',
    text: "J'ai adoré ! Arti offre une énergie douce et apaisante qui invite à la détente et surtout, à l'inspiration. Un endroit parfait pour se ressourcer.",
  },
  {
    name: 'Ninon Chapin',
    when: 'il y a 6 mois',
    initial: 'NC',
    color: 'bg-[#3949AB]',
    text: "Le café céramique est génial. Nous avons passé un super moment en famille dans cet endroit cosy. Le personnel est vraiment à l'écoute et aux petits soins. Je recommande fortement.",
  },
  {
    name: 'Isabelle Commien',
    when: 'il y a 10 mois',
    initial: 'IC',
    color: 'bg-[#039BE5]',
    text: "Je recommande le café céramique Arti pour un moment créatif dans la sérénité. Le lieu et l'équipe sont très agréables. Un beau moment intergénérationnel.",
  },
  {
    name: 'Léna Bohant',
    when: 'il y a 1 an',
    initial: 'LB',
    color: 'bg-[#43A047]',
    text: "Il est difficile de critiquer cet endroit, alors qu'il est un vrai lieu de sérénité, de bienveillance et de créativité. Nous avons été très bien accueillis.",
  },
  {
    name: 'Lily-Rose Le Maout',
    when: 'il y a 7 mois',
    initial: 'LL',
    color: 'bg-[#FB8C00]',
    text: "Très bonne ambiance, les filles sont accueillantes et souriantes. Petit clin d'œil à Jasmine qui est adorable et qui a su nous épauler tout au long de l'atelier !",
  },
  {
    name: 'Charlène Attal',
    when: 'il y a 1 an',
    initial: 'CA',
    color: 'bg-[#C0392B]',
    text: "J'ai passé 2 heures de pure détente chez Arti Café avec mes deux filles de 6 et 9 ans, et nous avons toutes les trois adoré cette expérience !",
  },
  {
    name: 'Maéva Turpin',
    when: 'il y a 1 an',
    initial: 'MT',
    color: 'bg-[#5E35B1]',
    text: "Une visite de plus chez Arti café, et toujours un grand plaisir ! L'ambiance, le choix de céramiques qui évolue au fil du temps, et l'accueil au top.",
  },
  {
    name: 'Camille Poitte',
    when: 'il y a 1 an',
    initial: 'CP',
    color: 'bg-[#1A73E8]',
    text: "Très bonne première expérience de peinture sur céramique ! Les explications sont claires et concises et le choix des céramiques est plutôt large ! 2h hors du temps.",
  },
  {
    name: 'Apolline Lesage',
    when: 'il y a 10 mois',
    initial: 'AL',
    color: 'bg-[#7E57C2]',
    text: "Super expérience !! La personne qui nous a accueillies était au top, disponible pour répondre aux questions et nous donner des conseils. L'ambiance est très sympa.",
  },
  {
    name: 'Fiona Hbrt',
    when: 'il y a 10 mois',
    initial: 'FH',
    color: 'bg-[#26A69A]',
    text: "Nous avons passé un très bon moment entre filles en famille à Arti Café. Le cadre est agréable et paisible, la playlist excellente et à un volume modéré.",
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

        {/* Note globale Google */}
        <div className="mt-6 flex flex-col items-center gap-2">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-5xl font-medium leading-none text-foreground">4,9</span>
            <span className="text-lg text-foreground/45">/ 5</span>
          </div>
          <div className="flex items-center gap-1 text-[#F5B544]">
            {Array.from({ length: 5 }).map((_, s) => (
              <Star key={s} className="size-5 fill-current" strokeWidth={0} />
            ))}
          </div>
          <p className="flex items-center gap-2 text-sm text-foreground/60">
            <GoogleG className="size-4" />
            <span>
              <strong className="font-semibold text-foreground/80">95 avis</strong> sur Google
            </span>
          </p>
        </div>
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
