import type { Metadata } from 'next'
import Image from 'next/image'

import { ArtiButton } from '@/components/arti/arti-button'
import { artiCadeauxDefaults } from '@/lib/content-defaults'
import { getPageContent } from '@/lib/page-content'

export const metadata: Metadata = {
  title: 'Cartes cadeaux',
  description:
    "Offrez une carte cadeau ARTI : un moment de peinture sur céramique unique au cœur de Rennes, pour le montant de votre choix. Valable en atelier comme à la boutique.",
  alternates: { canonical: '/arti-cadeaux' },
}

export const dynamic = 'force-dynamic'

export default async function ArtiCadeauxPage() {
  const c = await getPageContent('arti-cadeaux', artiCadeauxDefaults)

  return (
    <section className="bg-white">
      <div className="grid items-stretch gap-0 md:grid-cols-2">
        {/* Visuel à gauche, sauge — coffret + atelier qui se chevauchent */}
        <div className="relative z-20 flex items-center bg-sauge px-6 py-16 sm:px-10 sm:py-20 md:px-0 md:py-28">
          <div className="relative w-full">
            <Image
              src={c.hero.image1}
              alt="Coffret cadeau ARTI"
              width={800}
              height={600}
              priority
              className="ml-auto mr-[6%] h-auto w-[52%] shadow-2xl"
            />
            <Image
              src={c.hero.image2}
              alt="Atelier de peinture sur céramique chez ARTI"
              width={800}
              height={800}
              className="absolute left-[8%] top-[42%] w-[40%] shadow-xl"
            />
          </div>
        </div>

        {/* Texte à droite, blanc */}
        <div className="flex items-center bg-white px-6 py-16 sm:px-12 md:py-28 lg:px-20">
          <div className="max-w-md">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-sauge-deep">
              {c.hero.eyebrow}
            </p>
            <h1 className="mt-4 font-display text-5xl font-medium leading-[1.05] text-neutral-700 sm:text-6xl">
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
  )
}
