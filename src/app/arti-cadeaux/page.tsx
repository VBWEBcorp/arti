import type { Metadata } from 'next'
import Image from 'next/image'

import { ArtiButton } from '@/components/arti/arti-button'

export const metadata: Metadata = {
  title: 'Cartes cadeaux',
  description:
    "Offrez un bon cadeau ARTI : un atelier de peinture sur céramique unique au cœur de Rennes, entre 15€ et 50€.",
  alternates: { canonical: '/arti-cadeaux' },
}

export default function ArtiCadeauxPage() {
  return (
    <section className="bg-white">
      <div className="grid items-stretch gap-0 md:grid-cols-2">
        {/* Visuel à gauche, sauge — coffret + atelier qui se chevauchent */}
        <div className="relative z-20 flex items-center bg-sauge px-6 py-16 sm:px-10 sm:py-20 md:px-0 md:py-28">
          <div className="relative w-full">
            <Image
              src="/brand/cadeau-gift.png"
              alt="Coffret cadeau ARTI"
              width={800}
              height={600}
              priority
              className="ml-auto mr-[6%] h-auto w-[52%] shadow-2xl"
            />
            <Image
              src="/brand/atelier-1.png"
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
              Bon cadeau
            </p>
            <h1 className="mt-4 font-display text-5xl font-medium leading-[1.05] text-neutral-700 sm:text-6xl">
              Offrez une expérience unique à l&apos;un de vos proches !
            </h1>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-foreground/85">
              <p>
                Un atelier de peinture sur céramique est une idée géniale. La
                personne qui recevra cette attention pourra venir vivre un
                moment créatif hors du temps et garder un souvenir grâce à la
                pièce qu&apos;elle aura personnalisée.
              </p>
              <p>
                Vous avez la possibilité de choisir le montant de la pièce de
                votre choix (entre 15&nbsp;€ et 50&nbsp;€).
              </p>
            </div>
            <div className="mt-8">
              <ArtiButton href="/produit/carte-cadeau" variant="sauge">
                Choisir un bon cadeau
              </ArtiButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
