import type { Metadata } from 'next'
import { CalendarHeart, Clock, Mail, Phone } from 'lucide-react'

import { ContactForm } from '@/components/arti/contact-form'
import { FaqAccordion } from '@/components/arti/faq-accordion'
import { InfoCards } from '@/components/arti/info-cards'
import { siteConfig } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Infos pratiques',
  description:
    "ARTI — 10 rue Poullain Duparc à Rennes (Métro République). Horaires, contact, accès, FAQ et formulaire pour nous écrire.",
  alternates: { canonical: '/infos-pratiques' },
}

const faqItems = [
  {
    q: 'Les ateliers de peinture sur céramique sont-ils adaptés aux enfants ?',
    a: "Il n'y a pas d'âge requis pour venir faire un atelier, nous sommes ouverts aux grands comme aux petits ! Cependant, nous recommandons l'atelier à partir de 5-6 ans. L'activité n'est pas compliquée mais les 2H00 d'atelier peuvent être un peu longues pour les tout-petits.",
  },
  {
    q: 'Est-ce que les animaux sont acceptés ?',
    a: 'Oui, les chiens de petites / moyennes taille et calmes sont les bienvenus au café !',
  },
  {
    q: "Combien de temps dure l'activité ?",
    a: "L'atelier de peinture sur céramique dure 2H00. Nous te recommandons d'arriver 5-10 mins avant afin de choisir ta pièce et prendre le temps de t'installer.",
  },
  {
    q: 'Comment préparer ma venue chez Arti ?',
    a: "Avant l'atelier, nous t'invitons à trouver des inspirations. Pour cela, nous avons créé une page Pinterest avec plein d'idées pour t'inspirer.",
  },
  {
    q: "Quel est le prix d'un atelier ?",
    a: "Le prix de l'atelier est déterminé par la pièce que tu choisiras le jour J. Chez Arti, les modèles vont de 15 à 50€. Les boissons et pâtisseries sont à régler à part.",
  },
  {
    q: "Est-ce possible de prendre une boisson sans faire l'atelier ?",
    a: 'Bien sûr ! Deux places à côté du comptoir sont réservées aux personnes souhaitant juste prendre une boisson / goûter sans faire l\'atelier.',
  },
]

export default function InfosPratiquesPage() {
  return (
    <>
      {/* HERO + carte */}
      <section className="bg-white pt-16 pb-20 sm:pt-20 sm:pb-24">
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          <p className="text-center text-xs font-medium uppercase tracking-[0.28em] text-sauge-deep">
            Où nous trouver ?
          </p>
          <h1 className="mt-4 text-center font-display text-5xl font-medium text-foreground sm:text-6xl">
            Infos Pratiques
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-foreground/80">
            Nous sommes situés dans le centre-ville de Rennes, 10 rue Poullain
            Duparc à côté de République. Cliquez sur la carte ci-dessous pour
            venir nous rencontrer.
          </p>

          <div className="mt-10 overflow-hidden shadow-[var(--shadow-lg)] ring-1 ring-foreground/5">
            <iframe
              title="Carte ARTI Rennes"
              src="https://www.google.com/maps?q=10+rue+Poullain+Duparc+Rennes&output=embed"
              className="block h-[320px] w-full sm:h-[420px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* 3 cards Adresse / Contact / Horaires */}
      <InfoCards />

      {/* FAQ */}
      <section id="faq" className="bg-beige-light py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-6 sm:px-10">
          <p className="text-center text-xs font-medium uppercase tracking-[0.28em] text-sauge-deep">
            Les questions souvent posées
          </p>
          <h2 className="mt-3 text-center font-display text-5xl font-medium text-foreground sm:text-6xl">
            La FAQ
          </h2>
          <div className="mt-10">
            <FaqAccordion items={faqItems} />
          </div>
        </div>
      </section>

      {/* RÉSERVER / CONTACT */}
      <section id="reserver" className="scroll-mt-24 bg-white py-20 sm:py-24">
        <div className="mx-auto grid max-w-6xl items-start gap-10 px-6 sm:px-10 md:grid-cols-2 md:gap-16">
          {/* Intro + contact direct */}
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-sauge-deep">
              Réserver
            </p>
            <h2 className="mt-3 font-display text-5xl font-medium leading-[1.05] text-foreground sm:text-6xl">
              Réservez votre atelier
            </h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-foreground/80">
              Envie de venir peindre votre céramique&nbsp;? Écrivez-nous via le
              formulaire et nous reviendrons vers vous rapidement pour convenir
              d&apos;un créneau. Vous pouvez aussi nous joindre directement.
            </p>

            <ul className="mt-8 space-y-4 text-sm">
              <li className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sauge/20 text-sauge-deep">
                  <Phone strokeWidth={1.7} className="size-5" />
                </span>
                <a
                  href={`tel:${siteConfig.phone.replace(/\s/g, '')}`}
                  className="font-medium text-foreground underline-offset-4 transition-colors hover:text-sauge-deep hover:underline"
                >
                  {siteConfig.phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sauge/20 text-sauge-deep">
                  <Mail strokeWidth={1.7} className="size-5" />
                </span>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="font-medium text-foreground underline-offset-4 transition-colors hover:text-sauge-deep hover:underline"
                >
                  {siteConfig.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sauge/20 text-sauge-deep">
                  <Clock strokeWidth={1.7} className="size-5" />
                </span>
                <span className="leading-relaxed text-foreground/80">
                  Du mercredi au dimanche — voir les horaires détaillés plus haut.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sauge/20 text-sauge-deep">
                  <CalendarHeart strokeWidth={1.7} className="size-5" />
                </span>
                <span className="leading-relaxed text-foreground/80">
                  Atelier de 2h00 — pensez à arriver 5-10 min avant pour choisir
                  votre pièce.
                </span>
              </li>
            </ul>
          </div>

          {/* Formulaire */}
          <ContactForm />
        </div>
      </section>
    </>
  )
}
