import type { Metadata } from 'next'
import Image from 'next/image'

import { ArtiButton } from '@/components/arti/arti-button'
import { ConceptCarousel } from '@/components/arti/concept-carousel'
import { leConceptDefaults } from '@/lib/content-defaults'
import { getPageContent } from '@/lib/page-content'

export const metadata: Metadata = {
  title: 'Le concept',
  description:
    'ARTI est un coffee shop et un atelier de peinture sur céramique à Rennes. Découvrez comment se déroule un atelier et notre engagement local.',
  alternates: { canonical: '/le-concept' },
}

export const dynamic = 'force-dynamic'

export default async function LeConceptPage() {
  const c = await getPageContent('le-concept', leConceptDefaults)

  return (
    <>
      {/* HERO */}
      <section className="bg-white">
        <div className="grid items-stretch gap-0 md:grid-cols-2">
          {/* Colonne gauche : visuel principal + photo qui déborde en bas-gauche.
              Mêmes dimensions que la section événements de la page d'accueil. */}
          <div className="relative bg-sauge px-6 py-14 sm:px-12 sm:py-16 md:py-20 md:pb-48">
            <div className="relative mx-auto max-w-[440px] pb-36 md:mx-0 md:ml-auto md:pb-0">
              <Image
                src={c.hero.image}
                alt="Étagère de céramiques chez ARTI"
                width={800}
                height={800}
                priority
                className="h-auto w-full shadow-xl"
              />
              {/* Devanture, décalée vers le bas-gauche */}
              <div className="absolute -bottom-24 left-2 h-44 w-56 overflow-hidden shadow-lg md:-bottom-60 md:-left-56 md:h-64 md:w-80">
                <Image
                  src={c.hero.imageSecondary}
                  alt="Devanture du café ARTI à Rennes"
                  fill
                  sizes="(max-width: 768px) 224px, 320px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Colonne droite : fond blanc + texte */}
          <div className="flex items-center bg-white px-6 py-16 sm:px-12 md:py-28 lg:pl-24 lg:pr-20">
            <div className="max-w-[620px]">
              <h1 className="font-display text-5xl font-medium leading-[1.12] text-foreground sm:text-[3.4rem]">
                {c.hero.title}
              </h1>
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-foreground/85">
                <p>{c.hero.paragraph1}</p>
                <p>{c.hero.paragraph2}</p>
              </div>
              <div className="mt-8">
                <ArtiButton href={c.hero.buttonHref} variant="sauge">
                  {c.hero.buttonLabel}
                </ArtiButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTRO concept */}
      <section className="bg-white pt-24 sm:pt-32">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-6 text-center">
          <Image
            src={c.intro.icon}
            alt="Vase ARTI"
            width={180}
            height={180}
            className="h-28 w-auto object-contain sm:h-32"
          />
          <h2 className="mt-8 font-display text-4xl font-medium leading-[1.05] text-neutral-700 sm:text-5xl lg:text-6xl">
            {c.intro.title}
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-neutral-600">
            {c.intro.text}
          </p>
        </div>
      </section>

      {/* 4 ÉTAPES */}
      <section className="bg-white pt-12 pb-20 sm:pt-16 sm:pb-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
            {c.steps.map(({ n, title, icon, body }) => (
              <div key={n} className="flex flex-col items-center text-center">
                <Image
                  src={icon}
                  alt={title}
                  width={200}
                  height={200}
                  className="mb-8 h-32 w-auto object-contain sm:h-36"
                />
                <h3 className="font-sans text-xl font-semibold tracking-tight text-neutral-900">
                  {n}. {title}
                </h3>
                <p className="mt-4 text-justify text-base leading-relaxed text-neutral-500">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE — bloc sauge */}
      <section className="bg-sauge">
        <div className="mx-auto grid max-w-7xl items-center gap-0 md:grid-cols-2">
          <div className="px-6 py-20 sm:px-12 sm:py-24">
            <ConceptCarousel />
          </div>
          <div className="px-6 py-20 text-white sm:px-12 sm:py-24">
            <h2 className="font-display text-5xl font-medium leading-[1.05] text-white sm:text-6xl">
              {c.howItWorks.title}
            </h2>
            <div className="mt-6 max-w-md space-y-4 text-sm leading-relaxed text-white/90">
              <p>{c.howItWorks.paragraph1}</p>
              <p>{c.howItWorks.paragraph2}</p>
              <p>{c.howItWorks.paragraph3}</p>
            </div>
            <div className="mt-7">
              <ArtiButton
                href={c.howItWorks.buttonHref}
                external
                variant="outline-light"
              >
                {c.howItWorks.buttonLabel}
              </ArtiButton>
            </div>
          </div>
        </div>
      </section>

      {/* APERÇU COFFEE SHOP */}
      <section className="bg-white py-24 sm:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 sm:px-10 md:grid-cols-[1fr_2fr] md:gap-16">
          <div>
            <h2 className="font-display text-5xl font-medium leading-[1.05] text-foreground sm:text-6xl">
              {c.apercu.title}
            </h2>
            <div className="mt-8">
              <ArtiButton href={c.apercu.buttonHref} variant="sauge">
                {c.apercu.buttonLabel}
              </ArtiButton>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { src: c.apercu.image1, alt: 'Le comptoir du coffee shop ARTI' },
              { src: c.apercu.image2, alt: 'Étagères de céramiques chez ARTI' },
              { src: c.apercu.image3, alt: 'La salle du coffee shop ARTI' },
            ].map((img, i) => (
              <div
                key={i}
                className="group relative aspect-[3/4] overflow-hidden shadow-lg"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 768px) 30vw, 24vw"
                  loading="lazy"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NOS PARTENAIRES LOCAUX */}
      <section className="bg-beige-deep py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          <h2 className="text-center font-display text-5xl font-medium text-foreground sm:text-6xl">
            {c.partenaires.title}
          </h2>
          <div className="mt-12 grid items-center gap-12 md:grid-cols-2 md:gap-16">
            <div className="space-y-4 text-sm leading-relaxed text-foreground/85">
              <p>{c.partenaires.paragraph1}</p>
              <p>{c.partenaires.paragraph2}</p>
              <p>{c.partenaires.paragraph3}</p>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden shadow-lg">
              <Image
                src={c.partenaires.image}
                alt="Nos partenaires locaux à Rennes"
                fill
                sizes="(max-width: 768px) 100vw, 45vw"
                loading="lazy"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
