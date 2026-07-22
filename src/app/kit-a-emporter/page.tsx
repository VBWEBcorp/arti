import type { Metadata } from 'next'
import Image from 'next/image'

import { ArtiButton } from '@/components/arti/arti-button'
import { InfoCards } from '@/components/arti/info-cards'
import { kitDefaults } from '@/lib/content-defaults'
import { getPageContent } from '@/lib/page-content'

export const metadata: Metadata = {
  title: 'Le kit à emporter',
  description:
    "Peignez votre céramique chez vous avec le kit à emporter d'ARTI : une pièce, les peintures et le matériel, puis rapportez votre création à l'atelier pour la cuisson.",
  alternates: { canonical: '/kit-a-emporter' },
}

export const dynamic = 'force-dynamic'

export default async function KitAEmporterPage() {
  const c = await getPageContent('kit-a-emporter', kitDefaults)

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
                alt="Mug peint à emporter chez ARTI"
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
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-sauge-deep">
                {c.hero.eyebrow}
              </p>
              <h1 className="mt-4 font-display text-5xl font-medium leading-[1.05] text-neutral-700 sm:text-6xl">
                {c.hero.title}
              </h1>
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-foreground/85">
                <p>{c.hero.paragraph1}</p>
                <p>{c.hero.paragraph2}</p>
              </div>
              <div className="mt-8">
                <ArtiButton href={c.hero.buttonHref} variant="sauge">
                  {c.hero.buttonLabel}
                </ArtiButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CE QUE CONTIENT LE KIT */}
      <section className="bg-beige-light py-20 sm:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 sm:px-10 md:grid-cols-2 md:gap-16">
          <div>
            <h2 className="font-display text-5xl font-medium leading-[1.05] text-foreground sm:text-6xl">
              {c.contient.title}
            </h2>
            <ul className="mt-8 space-y-4 text-sm leading-relaxed text-foreground/85">
              {c.contient.items.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-sauge"
                    aria-hidden
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-foreground/70">
              {c.contient.note}{' '}
              <span className="text-foreground/50">{c.contient.noteSecondary}</span>
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden shadow-lg">
            <Image
              src={c.contient.image}
              alt="Création en céramique peinte chez ARTI"
              fill
              sizes="(max-width: 768px) 100vw, 45vw"
              loading="lazy"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <h2 className="text-center font-display text-5xl font-medium text-neutral-700 sm:text-6xl">
            {c.howItWorks.title}
          </h2>
          <div className="mt-14 grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
            {c.howItWorks.steps.map(({ n, title, icon, body }) => (
              <div key={n} className="flex flex-col items-center text-center">
                <Image
                  src={icon}
                  alt={title}
                  width={200}
                  height={200}
                  className="mb-8 h-32 w-auto object-contain sm:h-36"
                />
                <h3 className="font-sans text-xl font-semibold tracking-tight text-neutral-900">
                  {n}. {title}
                </h3>
                <p className="mt-4 text-justify text-base leading-relaxed text-neutral-500">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INFOS BAS DE PAGE */}
      <InfoCards />
    </>
  )
}
