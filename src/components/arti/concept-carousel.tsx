'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

type Slide = { src: string; alt: string }

const slides: Slide[] = [
  { src: '/brand/atelier-1.png', alt: 'Atelier de peinture sur céramique chez ARTI' },
  { src: '/brand/atelier-2.png', alt: 'Pièces en céramique en cours de décoration' },
  { src: '/brand/atelier-3.png', alt: 'Moment créatif à l’atelier ARTI' },
]

export function ConceptCarousel() {
  const trackRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [index, setIndex] = useState(0)

  const scrollToIndex = useCallback((i: number) => {
    const track = trackRef.current
    if (!track) return
    const n = slides.length
    const next = ((i % n) + n) % n
    track.scrollTo({ left: track.clientWidth * next, behavior: 'smooth' })
    setIndex(next)
  }, [])

  // Navigation manuelle : on met l'auto-défilement en pause un court instant.
  const go = useCallback(
    (dir: -1 | 1) => {
      pausedRef.current = true
      if (resumeTimer.current) clearTimeout(resumeTimer.current)
      resumeTimer.current = setTimeout(() => (pausedRef.current = false), 6000)
      scrollToIndex(index + dir)
    },
    [index, scrollToIndex],
  )

  // Défilement automatique.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => {
      if (pausedRef.current) return
      const track = trackRef.current
      if (!track) return
      const next = (Math.round(track.scrollLeft / track.clientWidth) + 1) % slides.length
      track.scrollTo({ left: track.clientWidth * next, behavior: 'smooth' })
      setIndex(next)
    }, 4500)
    return () => clearInterval(id)
  }, [])

  // Synchronise le point actif quand on fait défiler à la main (swipe).
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let t: ReturnType<typeof setTimeout>
    const onScroll = () => {
      clearTimeout(t)
      t = setTimeout(() => setIndex(Math.round(track.scrollLeft / track.clientWidth)), 120)
    }
    track.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      track.removeEventListener('scroll', onScroll)
      clearTimeout(t)
    }
  }, [])

  return (
    <div
      className="relative"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
    >
      <div
        ref={trackRef}
        className="scrollbar-hide flex snap-x snap-mandatory overflow-x-auto shadow-xl"
        role="region"
        aria-roledescription="carrousel"
        aria-label="L’atelier ARTI en images"
      >
        {slides.map((s, i) => (
          <div
            key={s.src}
            className="relative aspect-square w-full shrink-0 snap-center"
            role="group"
            aria-roledescription="diapositive"
            aria-label={`${i + 1} sur ${slides.length}`}
          >
            <Image
              src={s.src}
              alt={s.alt}
              fill
              priority={i === 0}
              sizes="(max-width: 768px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Flèches — petits carrés sombres aux bords de l'image */}
      <button
        type="button"
        aria-label="Image précédente"
        onClick={() => go(-1)}
        className="absolute left-0 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center bg-foreground/85 text-white transition-colors hover:bg-foreground sm:size-10"
      >
        <ChevronLeft className="size-5" strokeWidth={1.8} />
      </button>
      <button
        type="button"
        aria-label="Image suivante"
        onClick={() => go(1)}
        className="absolute right-0 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center bg-foreground/85 text-white transition-colors hover:bg-foreground sm:size-10"
      >
        <ChevronRight className="size-5" strokeWidth={1.8} />
      </button>

      {/* Indicateurs */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((s, i) => (
          <button
            key={s.src}
            type="button"
            aria-label={`Aller à l’image ${i + 1}`}
            aria-current={i === index}
            onClick={() => {
              pausedRef.current = true
              if (resumeTimer.current) clearTimeout(resumeTimer.current)
              resumeTimer.current = setTimeout(() => (pausedRef.current = false), 6000)
              scrollToIndex(i)
            }}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/60 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
