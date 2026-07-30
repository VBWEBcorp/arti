import type { Metadata } from 'next'
import Image from 'next/image'

import { ConceptSteps } from '@/components/arti/concept-steps'
import { CreationsCarousel, type Creation } from '@/components/arti/creations-carousel'
import { EventsCta } from '@/components/arti/events-cta'
import { InfoCards } from '@/components/arti/info-cards'
import { PresentationHero } from '@/components/arti/presentation-hero'
import { Reviews } from '@/components/arti/reviews'
import {
  localBusinessJsonLd,
  organizationJsonLd,
  webPageJsonLd,
  webSiteJsonLd,
} from '@/components/seo/json-ld'
import { connectDB } from '@/lib/db'
import { homeDefaults } from '@/lib/content-defaults'
import { getPageContent } from '@/lib/page-content'
import { siteConfig } from '@/lib/seo'
import { GalleryImage } from '@/models/Gallery'

// « Vos créations » = photos de la Galerie admin (repli sur défauts si vide).
async function getCreations(): Promise<Creation[]> {
  try {
    await connectDB()
    const imgs = await GalleryImage.find({ active: true })
      .sort({ order: 1, createdAt: -1 })
      .lean()
    return imgs
      .map((i) => ({ src: String(i.imageUrl || ''), alt: String(i.title || 'Création ARTI') }))
      .filter((c) => c.src)
  } catch {
    return []
  }
}

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

export const dynamic = 'force-dynamic'

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    webSiteJsonLd(),
    organizationJsonLd(),
    localBusinessJsonLd(),
    webPageJsonLd(siteConfig.name, siteConfig.description, '/'),
  ],
}

export default async function HomePage() {
  const { hero, fondatrice, evenement } = await getPageContent('home', homeDefaults)
  const creations = await getCreations()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* MOT DE PRÉSENTATION */}
      <PresentationHero content={hero} />

      {/* LE CONCEPT (4 étapes) */}
      <ConceptSteps />

      {/* VOS CRÉATIONS (photos de la Galerie admin) */}
      <CreationsCarousel items={creations} />

      {/* MOT DE LA FONDATRICE */}
      <section className="bg-white">
        <div className="grid items-stretch md:grid-cols-[2fr_3fr]">
          {/* Photo collée au bord gauche, pleine hauteur */}
          <div className="relative min-h-[320px] md:min-h-[480px]">
            <Image
              src={fondatrice.image}
              alt="Chloé, fondatrice d'ARTI"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              loading="lazy"
              className="object-cover"
            />
          </div>

          {/* Texte à droite */}
          <div className="flex items-center px-6 py-16 sm:px-12 md:py-20 lg:pl-20 lg:pr-28">
            <div className="max-w-xl">
              <h2 className="font-display text-5xl font-medium leading-[1.05] text-foreground sm:text-6xl">
                {fondatrice.title}
              </h2>
              <div className="mt-8 space-y-4 text-justify text-sm leading-relaxed text-foreground/85">
                <p>{fondatrice.paragraph1}</p>
                <p>{fondatrice.paragraph2}</p>
                <p>{fondatrice.paragraph3}</p>
              </div>
              {fondatrice.signature && (
                <p className="mt-6 font-display text-3xl text-sauge-deep">{fondatrice.signature}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* AVIS CLIENTS */}
      <Reviews />

      {/* ÉVÉNEMENTS */}
      <EventsCta content={evenement} />

      {/* INFOS (3 cartes Adresse / Contact / Horaires) — pt large pour le débordement de la tasse */}
      <InfoCards className="md:pt-40" />
    </>
  )
}
