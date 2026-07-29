import type { Metadata } from 'next'
import Image from 'next/image'

import { InfoCards } from '@/components/arti/info-cards'
import { groupeDefaults } from '@/lib/content-defaults'
import { getPageContent } from '@/lib/page-content'

export const metadata: Metadata = {
  title: 'Groupe & Évènement',
  description:
    "Organisez un événement unique chez ARTI : anniversaire, EVJF, EVG, team-building, afterwork… Atelier de peinture sur céramique à Rennes pour vos moments à partager.",
  alternates: { canonical: '/peinture-sur-ceramique-a-rennes' },
}

export const dynamic = 'force-dynamic'

export default async function GroupeEvenementPage() {
  const c = await getPageContent('groupe-evenement', groupeDefaults)

  return (
    <>
      {/* HERO : photo + texte */}
      <section className="bg-white">
        <div className="grid items-stretch gap-0 md:grid-cols-2">
          {/* Visuel à gauche, sauge */}
          <div className="relative flex items-center bg-sauge px-6 py-16 sm:px-10 sm:py-20 md:px-0 md:py-28">
            <div className="relative mx-auto w-full max-w-[460px] md:ml-auto md:mr-[8%]">
              <Image
                src={c.hero.image}
                alt="Événement de groupe chez ARTI"
                width={800}
                height={1000}
                priority
                className="h-auto w-full shadow-2xl"
              />
            </div>
          </div>

          {/* Texte à droite */}
          <div className="flex items-center bg-white px-6 py-16 sm:px-12 md:py-24 lg:px-20">
            <div className="max-w-md">
              <h1 className="font-display text-5xl font-medium leading-[1.08] text-neutral-700 sm:text-6xl">
                {c.hero.title}
              </h1>
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-foreground/85">
                {c.hero.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <div className="mt-8">
                <a
                  href={c.hero.buttonHref}
                  className="inline-flex h-12 items-center justify-center rounded-sm bg-sauge px-8 text-sm font-medium tracking-wide text-white transition-colors hover:bg-sauge-deep"
                >
                  {c.hero.buttonLabel}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Photos d'événements (éditables) */}
      {Array.isArray(c.photos) && c.photos.filter(Boolean).length > 0 && (
        <section className="bg-beige-light py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-6 sm:px-10">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
              {c.photos.filter(Boolean).map((src, i) => (
                <div key={i} className="relative aspect-[4/5] overflow-hidden shadow-lg">
                  <Image
                    src={src}
                    alt={`Moment de groupe chez ARTI ${i + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, 30vw"
                    loading="lazy"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <InfoCards />
    </>
  )
}
