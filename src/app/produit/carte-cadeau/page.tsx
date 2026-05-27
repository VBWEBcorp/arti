import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { GiftCardBalance } from '@/components/arti/gift-card-balance'
import { GiftCardPurchase } from '@/components/arti/gift-card-purchase'
import { InfoCards } from '@/components/arti/info-cards'

export const metadata: Metadata = {
  title: 'Carte Cadeau',
  description:
    "Offrez une carte cadeau ARTI de 10 € à 100 € : un atelier de peinture sur céramique au cœur de Rennes. Achat en ligne, code envoyé par email.",
  alternates: { canonical: '/produit/carte-cadeau' },
}

export default function CarteCadeauPage() {
  return (
    <>
      {/* Fil d'ariane */}
      <nav className="bg-beige" aria-label="Fil d'ariane">
        <div className="mx-auto max-w-6xl px-6 py-4 text-xs text-foreground/60 sm:px-10">
          <Link href="/" className="hover:text-foreground">
            Accueil
          </Link>
          <span className="mx-2">/</span>
          <Link href="/boutique" className="hover:text-foreground">
            Boutique
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground/80">Carte Cadeau</span>
        </div>
      </nav>

      {/* Produit : visuel + achat */}
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 sm:px-10 lg:grid-cols-2 lg:gap-16">
          {/* Visuel */}
          <div>
            <div className="relative aspect-square overflow-hidden bg-sauge">
              <Image
                src="/brand/cadeau-gift.png"
                alt="Carte cadeau ARTI"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
            <p className="mt-6 text-xs font-medium uppercase tracking-[0.28em] text-sauge-deep">
              Carte cadeau
            </p>
            <h1 className="mt-2 font-display text-5xl font-medium leading-[1.02] text-foreground sm:text-6xl">
              Carte Cadeau
            </h1>
            <p className="mt-3 font-display text-3xl font-medium text-sauge-deep">
              10,00 € – 100,00 €
            </p>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-foreground/80">
              Un atelier de peinture sur céramique est une idée géniale. La personne qui recevra
              cette attention pourra venir vivre un moment créatif hors du temps et garder un
              souvenir grâce à la pièce qu&apos;elle aura personnalisée.
            </p>
          </div>

          {/* Achat */}
          <div className="lg:pl-4">
            <GiftCardPurchase />
          </div>
        </div>
      </section>

      {/* Vérifier le solde */}
      <section className="bg-beige-deep py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6 text-center sm:px-10">
          <h2 className="font-display text-4xl font-medium text-foreground sm:text-5xl">
            Vous avez déjà une carte&nbsp;?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-foreground/75">
            Vérifiez le solde restant de votre carte cadeau en saisissant son code.
          </p>
          <div className="mt-8">
            <GiftCardBalance />
          </div>
        </div>
      </section>

      <InfoCards />
    </>
  )
}
