import Image from 'next/image'

import { ArtiButton } from '@/components/arti/arti-button'

export function EventsCta() {
  return (
    <section className="relative z-10 bg-beige-deep">
      <div className="grid gap-0 md:grid-cols-2">
        {/* Visuel à gauche : image principale + petite tasse qui déborde en bas sur le blanc */}
        <div className="relative bg-sauge px-6 py-14 sm:px-12 sm:py-16 md:py-20 md:pb-48">
          <div className="relative mx-auto max-w-[440px] pb-36 md:mx-0 md:ml-auto md:pb-0">
            <Image
              src="/brand/creation-1.png"
              alt="Atelier de groupe chez ARTI"
              width={800}
              height={640}
              loading="lazy"
              className="h-auto w-full shadow-xl"
            />
            {/* Petite tasse à motif poisson, décalée vers le bas-gauche */}
            <div className="absolute -bottom-24 left-2 h-44 w-56 overflow-hidden shadow-lg md:-bottom-60 md:-left-56 md:h-64 md:w-80">
              <Image
                src="/brand/event-cup.png"
                alt="Tasse en céramique décorée chez ARTI"
                fill
                sizes="(max-width: 768px) 224px, 320px"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Texte à droite */}
        <div className="flex items-center bg-beige-deep px-6 py-16 sm:px-12 sm:py-20 lg:px-16">
          <div className="max-w-2xl">
            <h2 className="font-display text-4xl font-medium leading-[1.1] text-foreground sm:text-5xl">
              Vous souhaitez organiser un événement ?
            </h2>
            <p className="mt-6 text-justify text-sm leading-relaxed text-foreground/80">
              Que ce soit pour un anniversaire, un mariage, un enterrement de
              vie de jeune fille, ou un événement d&apos;entreprise, Arti est
              l&apos;endroit idéal pour célébrer. Nous proposons des
              réservations pour tous types d&apos;événements. Profitez d&apos;un
              cadre unique où vos invités pourront créer des souvenirs
              inoubliables en décorant leurs propres pièces de céramique tout en
              savourant une boisson. Contactez-nous pour organiser votre
              événement et nous nous occupons de tout pour vous offrir une
              expérience créative et conviviale.
            </p>
            <div className="mt-7">
              <ArtiButton href="/peinture-sur-ceramique-a-rennes" variant="sauge">
                Nous contacter
              </ArtiButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
