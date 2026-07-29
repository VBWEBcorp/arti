import type { Metadata } from 'next'

import { ContactForm } from '@/components/arti/contact-form'
import { FaqAccordion } from '@/components/arti/faq-accordion'
import { InfoCards } from '@/components/arti/info-cards'
import { ReservationWidget } from '@/components/arti/reservation-widget'
import { faqDefaults, infosDefaults } from '@/lib/content-defaults'
import { getPageContent } from '@/lib/page-content'

export const metadata: Metadata = {
  title: 'Infos pratiques',
  description:
    "ARTI — 10 rue Poullain Duparc à Rennes (Métro République). Horaires, contact, accès et formulaire pour nous écrire.",
  alternates: { canonical: '/infos-pratiques' },
}

export const dynamic = 'force-dynamic'

export default async function InfosPratiquesPage() {
  const infos = await getPageContent('infos-pratiques', infosDefaults)
  const faq = await getPageContent('faq', faqDefaults)
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(infos.hero.mapQuery)}&output=embed`

  return (
    <>
      {/* HERO + carte */}
      <section className="bg-white pt-16 pb-20 sm:pt-20 sm:pb-24">
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          <p className="text-center text-xs font-medium uppercase tracking-[0.28em] text-sauge-deep">
            {infos.hero.eyebrow}
          </p>
          <h1 className="mt-4 text-center font-display text-5xl font-medium text-neutral-700 sm:text-6xl">
            {infos.hero.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-foreground/80">
            {infos.hero.description}
          </p>

          <div className="mt-10 overflow-hidden shadow-[var(--shadow-lg)] ring-1 ring-foreground/5">
            <iframe
              title="Carte ARTI Rennes"
              src={mapSrc}
              className="block h-[320px] w-full sm:h-[420px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* RÉSERVATION EN LIGNE (module Zenchef) */}
      <section id="reserver" className="scroll-mt-24 bg-white py-16 sm:py-20">
        <ReservationWidget content={infos.reservation} />
      </section>

      {/* 3 cards Adresse / Contact / Horaires */}
      <InfoCards />

      {/* FAQ (même contenu que la page FAQ, éditable au même endroit dans l'admin) */}
      <section className="bg-beige-light py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-6 text-center sm:px-10">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-sauge-deep">
            {faq.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-5xl font-medium text-foreground sm:text-6xl">
            {faq.title}
          </h2>
          {faq.intro && (
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-foreground/75">
              {faq.intro}
            </p>
          )}

          <div className="mt-12 text-left">
            <FaqAccordion items={faq.items} />
          </div>
        </div>
      </section>

      {/* CONTACT (questions / événements) */}
      <section id="contact" className="scroll-mt-24 bg-white pb-20 sm:pb-24">
        <div className="mx-auto max-w-xl px-6 sm:px-10">
          <ContactForm />
        </div>
      </section>
    </>
  )
}
