import type { Metadata } from 'next'
import Image from 'next/image'

import { InfoCards } from '@/components/arti/info-cards'
import { carteDefaults } from '@/lib/content-defaults'
import { getPageContent } from '@/lib/page-content'

export const metadata: Metadata = {
  title: 'La carte',
  description:
    "Découvrez la carte des boissons d'ARTI : cafés de spécialité torréfiés en Bretagne, thés, boissons fraîches et gourmandises locales, à savourer pendant votre atelier.",
  alternates: { canonical: '/carte' },
}

export const dynamic = 'force-dynamic'

export default async function CartePage() {
  const c = await getPageContent('carte', carteDefaults)

  return (
    <>
      {/* HERO */}
      <section className="bg-white">
        <div className="grid items-stretch gap-0 md:grid-cols-2">
          {/* Visuel à gauche, sauge */}
          <div className="relative flex items-center bg-sauge px-6 py-16 sm:px-10 sm:py-20 md:px-0 md:py-28">
            <div className="relative mx-auto w-full max-w-[460px] md:ml-auto md:mr-[8%]">
              <Image
                src={c.hero.image}
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
                {c.hero.title}
              </h1>
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-foreground/85">
                <p>{c.hero.paragraph1}</p>
                <p>{c.hero.paragraph2}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CARTE */}
      <section className="bg-beige-light py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-6 sm:px-10">
          <div className="grid gap-8 md:grid-cols-2 md:gap-x-12 md:gap-y-12">
            {c.menu.map((cat) => (
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
            {c.footnote}
          </p>
        </div>
      </section>

      {/* INFOS BAS DE PAGE */}
      <InfoCards />
    </>
  )
}
