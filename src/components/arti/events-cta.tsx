import Image from 'next/image'

import { ArtiButton } from '@/components/arti/arti-button'

type EventsContent = {
  title?: string
  text?: string
  buttonLabel?: string
  buttonHref?: string
  image1?: string
  image2?: string
}

export function EventsCta({ content }: { content?: EventsContent }) {
  const title = content?.title || 'Vous souhaitez organiser un événement ?'
  const text = content?.text || ''
  const buttonLabel = content?.buttonLabel || 'Nous contacter'
  const buttonHref = content?.buttonHref || '/peinture-sur-ceramique-a-rennes'
  const image1 = content?.image1 || '/brand/creation-1.png'
  const image2 = content?.image2 || '/brand/event-cup.png'

  return (
    <section className="relative z-10 bg-beige-deep">
      <div className="grid gap-0 md:grid-cols-2">
        {/* Visuel à gauche : image principale + petite tasse qui déborde en bas sur le blanc */}
        <div className="relative bg-sauge px-6 py-14 sm:px-12 sm:py-16 md:py-20 md:pb-48">
          <div className="relative mx-auto max-w-[440px] pb-36 md:mx-0 md:ml-auto md:pb-0">
            <Image
              src={image1}
              alt="Atelier de groupe chez ARTI"
              width={800}
              height={640}
              loading="lazy"
              className="h-auto w-full shadow-xl"
            />
            {/* Petite tasse à motif poisson, décalée vers le bas-gauche */}
            <div className="absolute -bottom-24 left-2 h-44 w-56 overflow-hidden shadow-lg md:-bottom-60 md:-left-56 md:h-64 md:w-80">
              <Image
                src={image2}
                alt="Tasse en céramique décorée chez ARTI"
                fill
                sizes="(max-width: 768px) 224px, 320px"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Texte à droite */}
        <div className="flex items-center bg-beige-deep px-6 py-16 sm:px-12 sm:py-20 lg:px-16">
          <div className="max-w-2xl">
            <h2 className="font-display text-4xl font-medium leading-[1.1] text-foreground sm:text-5xl">
              {title}
            </h2>
            <p className="mt-6 text-justify text-sm leading-relaxed text-foreground/80">
              {text}
            </p>
            <div className="mt-7">
              <ArtiButton href={buttonHref} variant="sauge">
                {buttonLabel}
              </ArtiButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
