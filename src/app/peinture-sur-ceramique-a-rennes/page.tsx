import type { Metadata } from 'next'

import { InfoCards } from '@/components/arti/info-cards'

export const metadata: Metadata = {
  title: 'Groupe & Évènement',
  description:
    "Organisez un événement unique chez ARTI : anniversaire, EVJF, EVG, team-building, afterwork… Atelier de peinture sur céramique à Rennes pour vos moments à partager.",
  alternates: { canonical: '/peinture-sur-ceramique-a-rennes' },
}

export default function GroupeEvenementPage() {
  return (
    <>
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center sm:px-10">
          <h1 className="font-display text-5xl font-medium leading-[1.05] text-neutral-700 sm:text-6xl">
            Envie de partager un moment créatif et convivial ?
          </h1>

          <div className="mt-10 space-y-4 text-left text-sm leading-relaxed text-foreground/85">
            <p>
              Chez ARTI, nous serions ravies de vous accueillir pour organiser
              un événement unique, à votre image.
            </p>
            <p>
              Que ce soit pour un anniversaire, un EVJF, un EVG ou toute autre
              occasion spéciale, nous vous accompagnons pour faire de ce moment
              une expérience agréable, entre rires, gourmandises et créativité.
            </p>
            <p>
              Pour les entreprises, ARTI est aussi un lieu idéal pour renforcer
              les liens d&apos;équipe autrement : team-building, afterwork,
              atelier collaboratif ou même conférence créative&nbsp;!
            </p>
            <p>
              Nous adaptons chaque événement à vos envies : choix des pièces à
              peindre, formules gourmandes, privatisation partielle ou totale du
              café…
            </p>
            <p>
              N&apos;hésitez pas à nous partager vos attentes : nous créerons
              ensemble un devis sur-mesure pour un moment à la fois inspirant et
              authentique.
            </p>
          </div>

          <div className="mt-12 flex justify-center">
            <a
              href="mailto:hello@articafeceramique.fr?subject=Demande%20événement"
              className="inline-flex h-12 items-center justify-center border border-foreground/80 bg-transparent px-8 text-base font-light tracking-wide text-foreground transition-colors hover:bg-foreground hover:text-beige"
            >
              Faire une demande
            </a>
          </div>
        </div>
      </section>

      <InfoCards />
    </>
  )
}
