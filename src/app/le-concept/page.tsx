import type { Metadata } from 'next'
import Image from 'next/image'

import { ArtiButton } from '@/components/arti/arti-button'
import { ImagePlaceholder } from '@/components/arti/image-placeholder'

export const metadata: Metadata = {
  title: 'Le concept',
  description:
    'ARTI est un coffee shop et un atelier de peinture sur céramique à Rennes. Découvrez comment se déroule un atelier et notre engagement local.',
  alternates: { canonical: '/le-concept' },
}

const steps = [
  {
    n: '1',
    title: 'Choisissez',
    icon: '/brand/tasse-icone.png',
    body:
      "En arrivant, l'équipe d'Arti prendra quelques minutes pour vous donner toutes les explications nécessaires sur la peinture, les techniques et le matériel puis c'est parti ! Vous pourrez choisir la céramique de votre choix parmi une large sélection de pièces : bol, tasse, vase, assiette, coquetier…",
  },
  {
    n: '2',
    title: 'Décorez',
    icon: '/brand/pot-icone.png',
    body:
      "A vos pinceaux ! Choisissez vos couleurs et laissez libre court à votre créativité. Si les idées venaient à vous manquer, un carnet d'inspiration sera à votre disposition pour vous permettre de réaliser les plus jolies des créations.",
  },
  {
    n: '3',
    title: 'Patientez',
    icon: '/brand/verre-icone.png',
    body:
      "A la fin de votre atelier, nous récupérons votre pièce afin de l'émailler et la cuire dans notre four à haute température (1 000°C). Cela révèlera les couleurs et la rendra étanche !",
  },
  {
    n: '4',
    title: 'Récupérez',
    icon: '/brand/potettasse-icone.png',
    body:
      'Environ 3 semaines plus tard, vous pourrez passer au café pour découvrir et récupérer votre création.',
  },
] as const

export default function LeConceptPage() {
  return (
    <>
      {/* HERO */}
      <section className="bg-beige">
        <div className="grid items-stretch gap-0 md:grid-cols-2">
          <div className="relative bg-sauge px-6 py-14 sm:px-12 sm:py-20">
            <div className="mx-auto max-w-[460px]">
              <ImagePlaceholder
                label="Étagère céramiques"
                tone="cream"
                aspect="portrait"
                className="shadow-2xl"
              />
              <ImagePlaceholder
                label="Devanture ARTI"
                tone="dark"
                aspect="square"
                className="absolute -bottom-10 -left-2 size-36 shadow-lg sm:-left-4 sm:size-44"
              />
            </div>
          </div>

          <div className="flex items-center bg-beige px-6 py-16 sm:px-12 lg:px-20">
            <div className="max-w-md">
              <h1 className="font-display text-5xl font-medium leading-[1.05] text-foreground sm:text-6xl">
                Arti est un coffee shop et un atelier de peinture sur céramique.
              </h1>
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-foreground/85">
                <p>
                  Vous retrouverez chez ARTI, une jolie sélection de cafés, thés
                  et boissons fraîches ainsi que des gâteaux pour les
                  gourmands&nbsp;!
                </p>
                <p>
                  Notre café est torréfié en Bretagne, à Saint-Thuriau, par
                  Café&nbsp;1802. Nous avons à cœur de travailler avec des
                  produits locaux.
                </p>
              </div>
              <div className="mt-8">
                <ArtiButton href="/boutique" variant="sauge">
                  Voir la carte
                </ArtiButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTRO concept */}
      <section className="bg-white pt-20 sm:pt-24">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
          <Image
            src="/brand/pot-icone.png"
            alt="Vase ARTI"
            width={120}
            height={120}
            className="h-16 w-auto object-contain"
          />
          <h2 className="mt-8 font-display text-5xl font-medium leading-[1.05] text-foreground sm:text-6xl">
            Vous souhaitez découvrir la peinture sur céramique ?
          </h2>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-foreground/80">
            Arti vous propose un moment hors du temps, 2H30 d&apos;atelier, pour
            personnaliser la pièce en céramique de votre choix. Comment cela
            fonctionne&nbsp;?
          </p>
        </div>
      </section>

      {/* 4 ÉTAPES */}
      <section className="bg-white pb-20 sm:pb-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <div className="mt-12 grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
            {steps.map(({ n, title, icon, body }) => (
              <div key={n} className="flex flex-col items-center text-center">
                <Image
                  src={icon}
                  alt={title}
                  width={180}
                  height={180}
                  className="mb-8 h-28 w-auto object-contain sm:h-32"
                />
                <h3 className="font-sans text-lg font-semibold tracking-tight text-foreground">
                  {n}. {title}
                </h3>
                <p className="mt-4 text-justify text-sm leading-relaxed text-foreground/70">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE — bloc sauge */}
      <section className="bg-sauge">
        <div className="mx-auto grid max-w-7xl items-center gap-0 md:grid-cols-2">
          <div className="relative px-6 py-16 sm:px-12 sm:py-20">
            <ImagePlaceholder
              label="Atelier en cours"
              tone="dark"
              aspect="wide"
              className="shadow-xl"
            />
            <button
              type="button"
              aria-label="Précédent"
              className="absolute left-2 top-1/2 hidden -translate-y-1/2 text-3xl text-white/90 hover:text-white sm:block"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Suivant"
              className="absolute right-2 top-1/2 hidden -translate-y-1/2 text-3xl text-white/90 hover:text-white sm:block"
            >
              ›
            </button>
          </div>
          <div className="px-6 py-16 text-white sm:px-12 sm:py-20">
            <h2 className="font-display text-5xl font-medium leading-[1.05] text-white sm:text-6xl">
              Comment ça marche&nbsp;?
            </h2>
            <div className="mt-6 max-w-md space-y-4 text-sm leading-relaxed text-white/90">
              <p>
                Au début de votre atelier, notre équipe prendra 10 minutes pour
                vous expliquer toutes les techniques et le matériel que vous
                pourrez utiliser. Nous serons là tout au long de votre atelier
                pour vous accompagner dans la réalisation de vos créations.
              </p>
              <p>
                Afin de préparer au mieux votre venue, vous pouvez sélectionner
                des inspirations et idées de réalisations.
              </p>
              <p>
                Pour cela, nous avons créé un tableau Pinterest avec plein
                d&apos;idées.
              </p>
            </div>
            <div className="mt-7">
              <ArtiButton
                href="https://www.pinterest.fr/articafeceramique/"
                external
                variant="outline-light"
              >
                📌 Découvrir les inspirations
              </ArtiButton>
            </div>
          </div>
        </div>
      </section>

      {/* APERÇU COFFEE SHOP */}
      <section className="bg-beige-light py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 sm:px-10 md:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="font-display text-5xl font-medium leading-[1.05] text-foreground sm:text-6xl">
              Un aperçu
              <br />
              du coffee
              <br />
              shop
            </h2>
            <div className="mt-7">
              <ArtiButton href="/boutique" variant="sauge">
                Voir la carte
              </ArtiButton>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <ImagePlaceholder label="Comptoir" tone="cream" aspect="portrait" />
            <ImagePlaceholder label="Étagères" tone="beige" aspect="portrait" />
            <ImagePlaceholder label="Salle" tone="cream" aspect="portrait" />
          </div>
        </div>
      </section>

      {/* NOS PARTENAIRES LOCAUX */}
      <section className="bg-beige-deep py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          <h2 className="text-center font-display text-5xl font-medium text-foreground sm:text-6xl">
            Nos partenaires locaux
          </h2>
          <div className="mt-12 grid items-center gap-12 md:grid-cols-2 md:gap-16">
            <div className="space-y-4 text-sm leading-relaxed text-foreground/85">
              <p>
                Pour le café, nous avons fait le choix de travailler avec
                café&nbsp;1802. Fred et Renaud sont Barista et Torréfacteur et
                ont à cœur de proposer des cafés de spécialité issus du commerce
                équitable. Ils élaborent des recettes uniques et torréfient leur
                café en Bretagne, à Saint-Thuriau.
              </p>
              <p>
                Nous travaillons avec Bonœuf pour nos pâtisseries : des cookies
                généreux et gourmands, 100% végétal et fabriqué juste à côté de
                Rennes&nbsp;!
              </p>
            </div>
            <ImagePlaceholder
              label="Atelier café"
              tone="sauge"
              aspect="wide"
              className="shadow-lg"
            />
          </div>
        </div>
      </section>
    </>
  )
}
