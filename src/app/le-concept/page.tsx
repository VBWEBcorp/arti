import type { Metadata } from 'next'
import Image from 'next/image'

import { ArtiButton } from '@/components/arti/arti-button'
import { ConceptSteps } from '@/components/arti/concept-steps'
import { PresentationHero } from '@/components/arti/presentation-hero'
import { leConceptDefaults } from '@/lib/content-defaults'
import { getPageContent } from '@/lib/page-content'

export const metadata: Metadata = {
  title: 'Le concept',
  description:
    'ARTI est un café céramique à Rennes : découvrez le déroulé d’un atelier de peinture sur céramique, pour qui, et notre sélection gourmande.',
  alternates: { canonical: '/le-concept' },
}

export const dynamic = 'force-dynamic'

export default async function LeConceptPage() {
  const c = await getPageContent('le-concept', leConceptDefaults)

  return (
    <>
      {/* MOT DE PRÉSENTATION (identique à l'accueil) */}
      <PresentationHero content={c.hero} />

      {/* LE CONCEPT (4 étapes, identiques à l'accueil) */}
      <ConceptSteps title="Le Concept" steps={c.steps} />

      {/* POUR QUI ? + INSPIRATIONS PINTEREST */}
      <section className="bg-beige-light py-20 sm:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 sm:px-10 md:grid-cols-2 md:gap-16">
          <div>
            <h2 className="font-display text-5xl font-medium leading-[1.05] text-foreground sm:text-6xl">
              {c.pourQui.title}
            </h2>
            <div className="mt-8 space-y-4 text-sm leading-relaxed text-foreground/85">
              <p>{c.pourQui.paragraph1}</p>
              <p>{c.pourQui.paragraph2}</p>
              <p>{c.pourQui.paragraph3}</p>
              <p>{c.pourQui.paragraph4}</p>
            </div>
            <div className="mt-8">
              <ArtiButton href={c.pourQui.buttonHref} external variant="sauge">
                📌 {c.pourQui.buttonLabel}
              </ArtiButton>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden shadow-lg">
            <Image
              src={c.pourQui.image}
              alt="Atelier de peinture sur céramique chez ARTI"
              fill
              sizes="(max-width: 768px) 100vw, 45vw"
              loading="lazy"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* PARTIE CAFÉ */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 sm:px-10 md:grid-cols-2 md:gap-16">
          <div className="relative order-2 aspect-[4/3] overflow-hidden shadow-lg md:order-1">
            <Image
              src={c.cafe.image}
              alt="Sélection gourmande du café ARTI"
              fill
              sizes="(max-width: 768px) 100vw, 45vw"
              loading="lazy"
              className="object-cover"
            />
          </div>
          <div className="order-1 md:order-2">
            <h2 className="font-display text-5xl font-medium leading-[1.05] text-foreground sm:text-6xl">
              {c.cafe.title}
            </h2>
            <div className="mt-8 space-y-4 text-sm leading-relaxed text-foreground/85">
              <p>{c.cafe.paragraph1}</p>
              <p>{c.cafe.paragraph2}</p>
              <p>{c.cafe.paragraph3}</p>
            </div>
            <div className="mt-8">
              <ArtiButton href={c.cafe.buttonHref} variant="sauge">
                {c.cafe.buttonLabel}
              </ArtiButton>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
