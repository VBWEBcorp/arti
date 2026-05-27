import { AtSign, Clock, MapPin } from 'lucide-react'

import { siteConfig } from '@/lib/seo'
import { cn } from '@/lib/utils'

export function InfoCards({ className }: { className?: string }) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `ARTI Café Céramique, ${siteConfig.address.street}, ${siteConfig.address.city}`
  )}`

  return (
    <section className={cn('bg-white py-16 sm:py-20', className)}>
      <div className="mx-auto grid max-w-6xl items-start gap-6 px-6 sm:px-10 md:grid-cols-3 md:gap-8">
        {/* Adresse */}
        <article className="group flex flex-col bg-sauge p-8 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)] sm:p-9">
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
              <MapPin strokeWidth={1.7} className="size-5" />
            </span>
            <h3 className="font-display text-3xl font-medium text-white">
              Adresse
            </h3>
          </div>
          <span className="mt-5 block h-px w-10 bg-white/40" aria-hidden />
          <div className="mt-5 space-y-3 text-sm leading-relaxed text-white/90">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              {siteConfig.address.street}, {siteConfig.address.city}
            </a>
            <p>
              <span className="font-semibold text-white">Accès :</span>{' '}
              {siteConfig.address.access}
            </p>
          </div>
        </article>

        {/* Contact */}
        <article className="group flex flex-col bg-sauge p-8 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)] sm:p-9">
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
              <AtSign strokeWidth={1.7} className="size-5" />
            </span>
            <h3 className="font-display text-3xl font-medium text-white">
              Contact
            </h3>
          </div>
          <span className="mt-5 block h-px w-10 bg-white/40" aria-hidden />
          <div className="mt-5 space-y-3 text-sm leading-relaxed text-white/90">
            <p>
              <span className="font-semibold text-white">Mail :</span>
              <br />
              <a
                href={`mailto:${siteConfig.email}`}
                className="underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                {siteConfig.email}
              </a>
            </p>
            <p>
              <span className="font-semibold text-white">Numéro :</span>{' '}
              <a
                href={`tel:${siteConfig.phone.replace(/\s/g, '')}`}
                className="underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                {siteConfig.phoneDisplay}
              </a>
            </p>
          </div>
        </article>

        {/* Horaires */}
        <article className="group flex flex-col bg-sauge p-8 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)] sm:p-9">
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
              <Clock strokeWidth={1.7} className="size-5" />
            </span>
            <h3 className="font-display text-3xl font-medium leading-[1.05] text-white">
              Horaires d&rsquo;ouverture
            </h3>
          </div>
          <span className="mt-5 block h-px w-10 bg-white/40" aria-hidden />
          <ul className="mt-5 space-y-1.5 text-sm leading-relaxed text-white/90">
            <li className="flex justify-between gap-4">
              <span className="font-semibold text-white">Lundi et mardi</span>
              <span>fermé</span>
            </li>
            {siteConfig.openingHours.slice(2).map((h) => (
              <li key={h.day} className="flex justify-between gap-4">
                <span className="font-semibold text-white">{h.day}</span>
                <span>{h.value}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  )
}
