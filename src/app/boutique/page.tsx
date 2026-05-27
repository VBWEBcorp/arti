import type { Metadata } from 'next'
import Link from 'next/link'
import { CreditCard, Gift, Heart } from 'lucide-react'

import { ArtiButton } from '@/components/arti/arti-button'
import { InfoCards } from '@/components/arti/info-cards'
import { cn } from '@/lib/utils'

const PRODUCT_URL = '/produit/carte-cadeau'

export const metadata: Metadata = {
  title: 'Boutique',
  description:
    "Offrez un bon cadeau ARTI, de 10 € à 100 €, et faites vivre un atelier de peinture sur céramique au cœur de Rennes.",
  alternates: { canonical: '/boutique' },
}

const giftCards = [
  { value: 20, amount: '20 €', note: "Pour découvrir l'atelier" },
  { value: 30, amount: '30 €', note: 'Le plus offert', popular: true },
  { value: 50, amount: '50 €', note: 'Pour une plus grande pièce' },
  { value: 100, amount: '100 €', note: 'Pour se faire vraiment plaisir' },
] as const

const steps = [
  {
    icon: Gift,
    title: 'Choisissez le montant',
    body: 'Sélectionnez la valeur qui vous fait plaisir sur la fiche du bon cadeau.',
  },
  {
    icon: CreditCard,
    title: 'Payez en ligne',
    body: 'Paiement sécurisé, puis le code vous est envoyé aussitôt par email.',
  },
  {
    icon: Heart,
    title: 'Offrez l’expérience',
    body: 'Votre proche réserve son atelier de peinture sur céramique quand il le souhaite.',
  },
] as const

export default function BoutiquePage() {
  return (
    <>
      {/* HERO */}
      <section className="bg-beige py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center sm:px-10">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-sauge-deep">
            La boutique
          </p>
          <h1 className="mt-5 font-display text-6xl font-medium leading-[1.02] text-foreground sm:text-7xl">
            Offrez un bon cadeau ARTI
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-foreground/80">
            Un moment créatif hors du temps à partager. Choisissez un montant,
            réglez en ligne, et recevez aussitôt le bon à transmettre à votre proche.
          </p>
        </div>
      </section>

      {/* GRILLE BONS CADEAUX */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {giftCards.map((card) => {
              const popular = 'popular' in card && card.popular
              return (
                <article
                  key={card.amount}
                  className={cn(
                    'group relative flex flex-col items-center p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]',
                    popular
                      ? 'bg-sauge text-white'
                      : 'border border-foreground/10 bg-beige-light text-foreground'
                  )}
                >
                  {popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-terracotta px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                      Populaire
                    </span>
                  )}
                  <p className="font-display text-7xl font-medium leading-none">{card.amount}</p>
                  <p
                    className={cn(
                      'mt-4 min-h-[2.5rem] text-sm leading-relaxed',
                      popular ? 'text-white/90' : 'text-foreground/70'
                    )}
                  >
                    {card.note}
                  </p>
                  <ArtiButton
                    href={`${PRODUCT_URL}?montant=${card.value}`}
                    variant={popular ? 'outline-light' : 'sauge'}
                    className="mt-7 w-full"
                  >
                    Offrir ce bon
                  </ArtiButton>
                </article>
              )
            })}
          </div>

          {/* Montants disponibles — mentionnés une seule fois */}
          <p className="mt-8 text-center text-sm text-foreground/60">
            Disponible de 10 € à 100 €, par tranches de 10 €.{' '}
            <Link
              href={PRODUCT_URL}
              className="font-medium text-sauge-deep underline-offset-4 hover:underline"
            >
              Voir tous les montants
            </Link>
          </p>
        </div>
      </section>

      {/* COMMENT OFFRIR */}
      <section className="bg-beige-deep py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          <h2 className="text-center font-display text-5xl font-medium text-foreground sm:text-6xl">
            Comment offrir un bon cadeau&nbsp;?
          </h2>
          <div className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
            {steps.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex flex-col items-center text-center">
                <span className="flex size-16 items-center justify-center rounded-full bg-sauge text-white">
                  <Icon strokeWidth={1.6} className="size-7" />
                </span>
                <h3 className="mt-6 font-display text-3xl font-medium text-foreground">{title}</h3>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-foreground/75">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INFOS */}
      <InfoCards />
    </>
  )
}
