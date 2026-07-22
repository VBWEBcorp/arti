import type { Metadata } from 'next'

import { ArtiButton } from '@/components/arti/arti-button'
import { FaqAccordion } from '@/components/arti/faq-accordion'
import { faqDefaults } from '@/lib/content-defaults'
import { getPageContent } from '@/lib/page-content'

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    "Toutes les réponses à vos questions sur les ateliers de peinture sur céramique chez ARTI à Rennes : enfants, animaux, durée, prix, entretien…",
  alternates: { canonical: '/faq' },
}

export const dynamic = 'force-dynamic'

export default async function FaqPage() {
  const faq = await getPageContent('faq', faqDefaults)

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-6 text-center sm:px-10">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-sauge-deep">
          {faq.eyebrow}
        </p>
        <h1 className="mt-3 font-display text-5xl font-medium text-foreground sm:text-6xl">
          {faq.title}
        </h1>
        {faq.intro && (
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-foreground/75">
            {faq.intro}
          </p>
        )}

        <div className="mt-12 text-left">
          <FaqAccordion items={faq.items} />
        </div>

        {/* CTA — question restante */}
        <div className="mt-14 border-t border-foreground/10 pt-10">
          <h2 className="font-display text-3xl font-medium text-foreground sm:text-4xl">
            {faq.contactCta.title}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-foreground/70">
            {faq.contactCta.text}
          </p>
          <div className="mt-6 flex justify-center">
            <ArtiButton href={faq.contactCta.buttonHref} variant="sauge">
              {faq.contactCta.buttonLabel}
            </ArtiButton>
          </div>
        </div>
      </div>
    </section>
  )
}
