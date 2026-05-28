import type { Metadata } from 'next'
import Image from 'next/image'

import { InfoCards } from '@/components/arti/info-cards'

export const metadata: Metadata = {
  title: 'La carte',
  description:
    "Découvrez la carte des boissons d'ARTI : cafés de spécialité torréfiés en Bretagne, thés, boissons fraîches et gourmandises locales, à savourer pendant votre atelier.",
  alternates: { canonical: '/carte' },
}

type MenuItem = { name: string; desc?: string; price: string }
type MenuCategory = { title: string; note?: string; items: MenuItem[] }

// NB : intitulés et prix indicatifs — à ajuster avec la vraie carte ARTI.
const menu: MenuCategory[] = [
  {
    title: 'Cafés',
    note: 'Torréfiés en Bretagne par Café 1802, à Saint-Thuriau.',
    items: [
      { name: 'Expresso', price: '2,00 €' },
      { name: 'Double expresso', price: '2,80 €' },
      { name: 'Café allongé', price: '2,20 €' },
      { name: 'Cappuccino', price: '3,80 €' },
      { name: 'Café latte', price: '4,00 €' },
      { name: 'Flat white', price: '4,00 €' },
      { name: 'Mocha', desc: 'café & chocolat', price: '4,50 €' },
    ],
  },
  {
    title: 'Thés & chocolats',
    items: [
      { name: 'Thé ou infusion', desc: 'sélection de la maison', price: '3,50 €' },
      { name: 'Matcha latte', price: '4,50 €' },
      { name: 'Chai latte', price: '4,50 €' },
      { name: 'Chocolat chaud', price: '4,00 €' },
    ],
  },
  {
    title: 'Boissons fraîches',
    items: [
      { name: 'Café glacé', price: '4,50 €' },
      { name: 'Matcha glacé', price: '4,80 €' },
      { name: 'Limonade artisanale', price: '4,00 €' },
      { name: 'Jus de fruits', price: '3,80 €' },
      { name: 'Smoothie', price: '5,00 €' },
    ],
  },
  {
    title: 'Gourmandises',
    note: 'Pâtisseries 100 % végétales de Bonœuf, fabriquées près de Rennes.',
    items: [
      { name: 'Cookie Bonœuf', price: '3,50 €' },
      { name: 'Pâtisserie du jour', price: '4,00 €' },
      { name: 'Part de gâteau', price: '4,50 €' },
    ],
  },
]

export default function CartePage() {
  return (
    <>
      {/* HERO */}
      <section className="bg-white">
        <div className="grid items-stretch gap-0 md:grid-cols-2">
          {/* Visuel à gauche, sauge */}
          <div className="relative flex items-center bg-sauge px-6 py-16 sm:px-10 sm:py-20 md:px-0 md:py-28">
            <div className="relative mx-auto w-full max-w-[460px] md:ml-auto md:mr-[8%]">
              <Image
                src="/brand/apercu-2.png"
                alt="Le comptoir du coffee shop ARTI à Rennes"
                width={800}
                height={1000}
                priority
                className="h-auto w-full shadow-2xl"
              />
            </div>
          </div>

          {/* Texte à droite, blanc */}
          <div className="flex items-center bg-white px-6 py-16 sm:px-12 md:py-28 lg:px-20">
            <div className="max-w-md">
              <h1 className="font-display text-5xl font-medium leading-[1.05] text-neutral-700 sm:text-6xl">
                La carte
              </h1>
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-foreground/85">
                <p>
                  Chez Arti, vous retrouverez une jolie sélection de cafés, thés
                  et boissons fraîches, ainsi que des gâteaux pour les
                  gourmands&nbsp;!
                </p>
                <p>
                  Notre café est torréfié en Bretagne, à Saint-Thuriau, par
                  Café&nbsp;1802. Nous avons à cœur de travailler avec des
                  produits locaux, à savourer sur place pendant votre atelier ou
                  le temps d&apos;une pause.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CARTE */}
      <section className="bg-beige-light py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-6 sm:px-10">
          <div className="grid gap-8 md:grid-cols-2 md:gap-x-12 md:gap-y-12">
            {menu.map((cat) => (
              <div key={cat.title} className="bg-white p-8 shadow-sm sm:p-10">
                <h2 className="font-display text-4xl font-medium text-neutral-700">
                  {cat.title}
                </h2>
                {cat.note ? (
                  <p className="mt-2 text-xs leading-relaxed text-foreground/55">
                    {cat.note}
                  </p>
                ) : null}
                <span className="mt-5 block h-px w-12 bg-sauge/40" aria-hidden />
                <ul className="mt-5 space-y-3.5">
                  {cat.items.map((item) => (
                    <li
                      key={item.name}
                      className="flex items-baseline gap-3 text-sm leading-relaxed"
                    >
                      <span className="text-foreground">
                        {item.name}
                        {item.desc ? (
                          <span className="text-foreground/50">
                            {' '}
                            — {item.desc}
                          </span>
                        ) : null}
                      </span>
                      <span
                        className="mx-1 h-px flex-1 translate-y-[-2px] border-b border-dotted border-foreground/25"
                        aria-hidden
                      />
                      <span className="shrink-0 font-medium text-sauge-deep">
                        {item.price}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="mt-10 text-center text-xs text-foreground/50">
            Carte non contractuelle, susceptible d&apos;évoluer selon les saisons
            et les arrivages.
          </p>
        </div>
      </section>

      {/* INFOS BAS DE PAGE */}
      <InfoCards />
    </>
  )
}
