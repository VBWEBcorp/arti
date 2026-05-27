import { Instagram, Mail, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'

import { Logo } from '@/components/layout/logo'
import { siteConfig } from '@/lib/seo'

const navLinks = [
  { label: 'Accueil', to: '/' },
  { label: 'Le concept', to: '/le-concept' },
  { label: 'Les céramiques', to: '/arti-ceramiques' },
  { label: 'Infos pratiques', to: '/infos-pratiques' },
  { label: 'Réserver', to: '/infos-pratiques#reserver' },
  { label: 'Cadeaux', to: '/arti-cadeaux' },
]

const eyebrow =
  'text-xs font-medium uppercase tracking-[0.28em] text-sauge-deep'

export function Footer() {
  return (
    <footer className="border-t border-foreground/10 bg-beige text-foreground">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 sm:px-10 md:grid-cols-3 md:gap-10">
        {/* Colonne gauche : Informations */}
        <div className="space-y-5">
          <h3 className={eyebrow}>Informations</h3>
          <ul className="space-y-3 text-sm leading-relaxed">
            <li className="flex items-start gap-3">
              <MapPin strokeWidth={1.7} className="mt-0.5 size-4 shrink-0 text-sauge-deep" />
              <span>
                {siteConfig.address.street}, {siteConfig.address.city}
                <br />
                <span className="text-foreground/70">{siteConfig.address.access}</span>
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Mail strokeWidth={1.7} className="size-4 shrink-0 text-sauge-deep" />
              <a
                href={`mailto:${siteConfig.email}`}
                className="underline-offset-4 transition-colors hover:text-sauge-deep hover:underline"
              >
                {siteConfig.email}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Phone strokeWidth={1.7} className="size-4 shrink-0 text-sauge-deep" />
              <a
                href={`tel:${siteConfig.phone.replace(/\s/g, '')}`}
                className="underline-offset-4 transition-colors hover:text-sauge-deep hover:underline"
              >
                {siteConfig.phoneDisplay}
              </a>
            </li>
          </ul>
        </div>

        {/* Colonne centre : Logo + Instagram */}
        <div className="flex flex-col items-center gap-5 text-center">
          <Logo size="md" />
          <p className="max-w-[16rem] text-sm leading-relaxed text-foreground/75">
            Le café céramique au cœur de Rennes, un moment créatif et gourmand.
          </p>
          <a
            href={siteConfig.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Suivre ARTI sur Instagram"
            className="flex size-10 items-center justify-center rounded-full bg-sauge text-white transition-all duration-300 hover:scale-105 hover:bg-sauge-deep"
          >
            <Instagram strokeWidth={1.8} className="size-5" />
          </a>
        </div>

        {/* Colonne droite : Navigation */}
        <nav aria-label="Pied de page" className="space-y-5 md:text-right">
          <h3 className={eyebrow}>Navigation</h3>
          <ul className="space-y-2.5 text-sm">
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link
                  href={l.to}
                  className="inline-block underline-offset-4 transition-colors hover:text-sauge-deep hover:underline"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Barre basse : copyright */}
      <div className="border-t border-foreground/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-foreground/70 sm:px-10 md:flex-row">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}, tous droits réservés ·{' '}
            <Link
              href="/politique-de-confidentialite"
              className="underline-offset-2 hover:text-foreground hover:underline"
            >
              Politique de confidentialité &amp; mentions légales
            </Link>
          </p>
          <p className="flex items-center gap-1.5">
            Conception &amp; Réalisation
            <span className="font-logo tracking-[0.25em] text-foreground">VBWEB</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
