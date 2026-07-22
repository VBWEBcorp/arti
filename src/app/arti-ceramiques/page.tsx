import type { Metadata } from 'next'
import Image from 'next/image'

import { CeramicsCatalogue } from '@/components/arti/ceramics-catalogue'
import { InfoCards } from '@/components/arti/info-cards'
import { artiCeramiquesDefaults } from '@/lib/content-defaults'
import { getPageContent } from '@/lib/page-content'

export const metadata: Metadata = {
  title: 'Les céramiques',
  description:
    "Découvrez la sélection de céramiques d'ARTI : tasses, bols, assiettes, pichets, vases, théières… Des pièces de céramistes français de 15€ à 50€.",
  alternates: { canonical: '/arti-ceramiques' },
}

export const dynamic = 'force-dynamic'

export default async function ArtiCeramiquesPage() {
  const c = await getPageContent('arti-ceramiques', artiCeramiquesDefaults)

  return (
    <>
      {/* HERO */}
      <section className="bg-white">
        <div className="grid items-stretch gap-0 md:grid-cols-2">
          {/* Visuel à gauche, sauge — deux pièces qui se chevauchent */}
          <div className="relative z-20 flex items-center bg-sauge px-6 py-16 sm:px-10 sm:py-20 md:px-0 md:py-28">
            <div className="relative w-full">
              <Image
                src={c.hero.image1}
                alt="Mugs en céramique chez ARTI"
                width={800}
                height={800}
                priority
                className="ml-auto mr-[6%] h-auto w-[50%] shadow-2xl"
              />
              <Image
                src={c.hero.image2}
                alt="Décoration d'une tasse en céramique chez ARTI"
                width={800}
                height={640}
                className="absolute -bottom-12 left-[12%] w-[44%] shadow-xl sm:-bottom-16"
              />
            </div>
          </div>

          {/* Texte à droite, blanc */}
          <div className="flex items-center bg-white px-6 py-16 sm:px-12 md:py-28 lg:px-20">
            <div className="max-w-md">
              <h1 className="font-display text-5xl font-medium leading-[1.05] text-neutral-700 sm:text-6xl">
                {c.hero.title}
              </h1>
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-foreground/85">
                <p>{c.hero.paragraph1}</p>
                <p>{c.hero.paragraph2}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATALOGUE */}
      <section className="bg-beige-light py-16 sm:py-24">
        <CeramicsCatalogue items={c.catalogue} />
      </section>

      {/* INFOS BAS DE PAGE */}
      <InfoCards />
    </>
  )
}
