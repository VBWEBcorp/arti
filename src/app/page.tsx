import type { Metadata } from 'next'
import Image from 'next/image'

import { ArtiButton } from '@/components/arti/arti-button'
import { ConceptSteps } from '@/components/arti/concept-steps'
import { CreationsCarousel } from '@/components/arti/creations-carousel'
import { EventsCta } from '@/components/arti/events-cta'
import { InfoCards } from '@/components/arti/info-cards'
import { Reviews } from '@/components/arti/reviews'
import {
  localBusinessJsonLd,
  organizationJsonLd,
  webPageJsonLd,
  webSiteJsonLd,
} from '@/components/seo/json-ld'
import { homeDefaults } from '@/lib/content-defaults'
import { getPageContent } from '@/lib/page-content'
import { siteConfig } from '@/lib/seo'

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
  const { hero } = await getPageContent('home', homeDefaults)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HERO — Bienvenue chez ARTI */}
      <section className="bg-white">
        <div className="grid items-stretch gap-0 md:grid-cols-2">
          {/* Colonne gauche : bloc sauge + photo insérée qui déborde légèrement */}
          <div className="relative z-20 flex items-center bg-sauge px-6 py-12 sm:px-10 sm:py-16 md:px-0 md:py-24">
            <div className="mx-auto w-full max-w-[600px] md:mx-0 md:ml-[16%] md:w-[82%] md:max-w-none md:translate-x-[6%]">
              <Image
                src={hero.image}
                alt="Intérieur du café ARTI à Rennes"
                width={1000}
                height={900}
                priority
                className="h-auto w-full shadow-2xl"
              />
            </div>
          </div>

          {/* Colonne droite : fond blanc + texte */}
          <div className="flex items-center bg-white px-6 py-16 sm:px-12 md:py-24 lg:pl-28 lg:pr-16">
            <div className="max-w-xl">
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-sauge-deep">
                {hero.eyebrow}
              </p>
              <h1 className="mt-5 font-display text-6xl font-medium leading-[1.05] text-foreground lg:text-7xl">
                {hero.title}
              </h1>
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-foreground/85 text-justify">
                <p>{hero.paragraph1}</p>
                <p>{hero.paragraph2}</p>
              </div>
              <div className="mt-8">
                <ArtiButton href={hero.buttonHref} variant="sauge">
                  {hero.buttonLabel}
                </ArtiButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LE CONCEPT (4 étapes) */}
      <ConceptSteps />

      {/* VOS CRÉATIONS */}
      <CreationsCarousel />

      {/* NOTRE ÉQUIPE */}
      <section className="bg-white">
        <div className="grid items-stretch md:grid-cols-[2fr_3fr]">
          {/* Photo collée au bord gauche, pleine hauteur */}
          <div className="relative min-h-[320px] md:min-h-[480px]">
            <Image
              src="/brand/equipe.png"
              alt="L'équipe ARTI"
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
                Notre équipe
              </h2>
              <div className="mt-8 space-y-4 text-justify text-sm leading-relaxed text-foreground/85">
                <p>
                  Chez Arti, Chloé, Anne et Jasmine vous accueilleront lors de
                  vos ateliers pour vous faire vivre un moment créatif et
                  relaxant !
                </p>
                <p>
                  Nous mettons tout notre cœur à vous accompagner dans la
                  réalisation de votre pièce, que vous veniez peindre pour le
                  plaisir, pour offrir ou simplement pour vous détendre. Nous
                  aimons partager nos conseils et nos idées pour que chaque
                  atelier soit une belle expérience, pleine de bonne humeur et
                  de créativité.
                </p>
                <p>
                  Chez nous, pas besoin d&apos;être artiste : on vous guide pas
                  à pas, toujours avec le sourire !
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AVIS CLIENTS */}
      <Reviews />

      {/* ÉVÉNEMENTS */}
      <EventsCta />

      {/* INFOS (3 cartes Adresse / Contact / Horaires) — pt large pour le débordement de la tasse */}
      <InfoCards className="md:pt-40" />
    </>
  )
}
