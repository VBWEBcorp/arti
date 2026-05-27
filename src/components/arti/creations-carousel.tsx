'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useRef } from 'react'

type Creation = { src: string; alt: string }

const creations: Creation[] = [
  { src: '/brand/creation-1.png', alt: 'Atelier de peinture sur céramique en groupe chez ARTI' },
  { src: '/brand/creation-2.png', alt: 'Cliente peignant un bol en céramique' },
  { src: '/brand/creation-3.png', alt: 'Peinture délicate d’une tasse au pinceau' },
  { src: '/brand/creation-4.png', alt: 'Enfant décorant une petite pièce en céramique' },
  { src: '/brand/creation-5.png', alt: 'Bol coloré en cours de décoration' },
  { src: '/brand/creation-6.png', alt: 'Pichet en céramique réalisé chez ARTI' },
]

// Liste dupliquée pour une boucle infinie sans coupure visible.
const loop = [...creations, ...creations]

export function CreationsCarousel() {
  const trackRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Défilement automatique, lent et continu.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0
    let last = performance.now()
    // Accumulateur flottant : scrollLeft arrondit, donc on garde la position ici.
    let pos = track.scrollLeft
    const speed = 40 // px / seconde

    const step = (now: number) => {
      const dt = now - last
      last = now
      if (pausedRef.current) {
        // Reste synchronisé pendant la pause / navigation manuelle.
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
    // Met l'auto-défilement en pause le temps de la transition manuelle.
    pausedRef.current = true
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    track.scrollBy({ left: dir * track.clientWidth * 0.5, behavior: 'smooth' })
    resumeTimer.current = setTimeout(() => {
      pausedRef.current = false
    }, 1500)
  }, [])

  return (
    <section className="overflow-hidden bg-beige-light py-20 sm:py-24">
      <h2 className="mb-12 text-center font-display text-5xl font-medium text-foreground sm:text-6xl">
        Vos créations
      </h2>

      <div className="relative">
        <div
          ref={trackRef}
          onMouseEnter={() => (pausedRef.current = true)}
          onMouseLeave={() => (pausedRef.current = false)}
          className="scrollbar-hide flex gap-4 overflow-x-auto px-4"
          role="region"
          aria-label="Galerie des créations"
        >
          {loop.map((c, i) => (
            <div
              key={i}
              aria-hidden={i >= creations.length}
              className="relative aspect-[5/4] w-[80vw] shrink-0 overflow-hidden sm:w-[44vw] lg:w-[24vw]"
            >
              <Image
                src={c.src}
                alt={i < creations.length ? c.alt : ''}
                fill
                sizes="(max-width: 640px) 80vw, (max-width: 1024px) 44vw, 24vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {/* Flèches — petits carrés blancs aux bords */}
        <button
          type="button"
          aria-label="Créations précédentes"
          onClick={() => slide(-1)}
          className="absolute left-0 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-md bg-white text-foreground shadow-md ring-1 ring-foreground/5 transition-colors hover:bg-beige"
        >
          <ChevronLeft className="size-6" strokeWidth={1.6} />
        </button>
        <button
          type="button"
          aria-label="Créations suivantes"
          onClick={() => slide(1)}
          className="absolute right-0 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-md bg-white text-foreground shadow-md ring-1 ring-foreground/5 transition-colors hover:bg-beige"
        >
          <ChevronRight className="size-6" strokeWidth={1.6} />
        </button>
      </div>
    </section>
  )
}
