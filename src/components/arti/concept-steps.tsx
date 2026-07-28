import Image from 'next/image'

import { conceptStepsDefaults, type ConceptStep } from '@/lib/content-defaults'

export function ConceptSteps({
  title = 'Le Concept',
  steps = conceptStepsDefaults,
}: {
  title?: string
  steps?: ConceptStep[]
}) {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <h2 className="text-center font-display text-5xl font-medium text-foreground sm:text-6xl">
          {title}
        </h2>

        <div className="mt-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {steps.map(({ n, title: t, icon, body }) => (
            <div key={n} className="flex flex-col items-center text-center">
              <Image
                src={icon}
                alt={t}
                width={180}
                height={180}
                className="mb-8 h-28 w-auto object-contain sm:h-32"
              />
              <h3 className="font-sans text-lg font-semibold tracking-tight text-foreground">
                {n}. {t}
              </h3>
              <p className="mt-4 text-justify text-sm leading-relaxed text-foreground/70">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
