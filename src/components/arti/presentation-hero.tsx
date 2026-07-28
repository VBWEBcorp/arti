import Image from 'next/image'

import { ArtiButton } from '@/components/arti/arti-button'

type Presentation = {
  eyebrow?: string
  title: string
  paragraph1?: string
  paragraph2?: string
  paragraph3?: string
  buttonLabel: string
  buttonHref: string
  image: string
}

/**
 * Bloc « Mot de présentation » — utilisé à l'identique sur l'accueil et sur
 * la page « Le Concept » (photo dans un bloc sauge à gauche, texte à droite).
 */
export function PresentationHero({ content }: { content: Presentation }) {
  return (
    <section className="bg-white">
      <div className="grid items-stretch gap-0 md:grid-cols-2">
        {/* Colonne gauche : bloc sauge + photo */}
        <div className="relative z-20 flex items-center bg-sauge px-6 py-12 sm:px-10 sm:py-16 md:px-0 md:py-24">
          <div className="mx-auto w-full max-w-[600px] md:mx-0 md:ml-[16%] md:w-[82%] md:max-w-none md:translate-x-[6%]">
            <Image
              src={content.image}
              alt="Intérieur du café ARTI à Rennes"
              width={1000}
              height={900}
              priority
              className="h-auto w-full shadow-2xl"
            />
          </div>
        </div>

        {/* Colonne droite : texte */}
        <div className="flex items-center bg-white px-6 py-16 sm:px-12 md:py-24 lg:pl-28 lg:pr-16">
          <div className="max-w-xl">
            {content.eyebrow && (
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-sauge-deep">
                {content.eyebrow}
              </p>
            )}
            <h1 className="mt-5 font-display text-6xl font-medium leading-[1.05] text-foreground lg:text-7xl">
              {content.title}
            </h1>
            <div className="mt-6 space-y-4 text-justify text-sm leading-relaxed text-foreground/85">
              {content.paragraph1 && <p>{content.paragraph1}</p>}
              {content.paragraph2 && <p>{content.paragraph2}</p>}
              {content.paragraph3 && <p>{content.paragraph3}</p>}
            </div>
            <div className="mt-8">
              <ArtiButton href={content.buttonHref} variant="sauge">
                {content.buttonLabel}
              </ArtiButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
