'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Logo } from '@/components/layout/logo'
import { siteConfig } from '@/lib/seo'
import { cn } from '@/lib/utils'

interface NavLink {
  to: string
  label: string
}

// Ordre du burger menu ARTI : parcours visiteur (concept → carte → céramiques → kit → reste)
const links: NavLink[] = [
  { to: '/le-concept', label: 'Le concept' },
  // « La carte » masquée du menu (front) — page conservée, accessible par URL.
  // { to: '/carte', label: 'La carte' },
  { to: '/arti-ceramiques', label: 'Les céramiques' },
  // Kit à emporter masqué du menu (front) pour le moment — la page reste accessible par URL.
  // { to: '/kit-a-emporter', label: 'Kit à emporter' },
  { to: '/peinture-sur-ceramique-a-rennes', label: 'Groupe & Evènement' },
  { to: '/infos-pratiques', label: 'Infos pratiques' },
  { to: '/arti-cadeaux', label: 'Cartes cadeaux' },
  { to: '/faq', label: 'FAQ' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // « Blog » masqué du menu (front) pour le moment.
  const navLinks = links

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Ferme le menu à la navigation
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-50 bg-beige">
      <div className="relative flex h-20 items-center justify-between px-4 sm:px-8 lg:px-12">
        {/* Burger à gauche */}
        <button
          type="button"
          aria-expanded={open}
          aria-controls="arti-menu"
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          onClick={() => setOpen((v) => !v)}
          className="relative z-50 inline-flex size-10 items-center justify-center text-foreground transition-opacity hover:opacity-70"
        >
          <AnimatePresence initial={false} mode="wait">
            {open ? (
              <motion.span
                key="x"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <X strokeWidth={1.8} className="size-7" />
              </motion.span>
            ) : (
              <motion.span
                key="m"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Menu strokeWidth={1.8} className="size-7" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Logo centré */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Logo size="lg" />
        </div>

        {/* CTA Réserver à droite — même police que les titres (Caveat), en vert */}
        <Link
          href="/infos-pratiques#reserver"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 400 }}
          className="inline-flex h-10 items-center justify-center rounded-sm bg-sauge px-4 text-xl leading-none text-white transition-colors hover:bg-sauge-deep sm:px-6 sm:text-2xl"
        >
          Réserver
        </Link>
      </div>

      {/* Menu déroulant (style screenshot : panneau blanc en haut à gauche) */}
      <AnimatePresence>
        {open ? (
          <>
            {/* Overlay subtil pour fermer en cliquant à côté */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40 bg-foreground/5"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.nav
              id="arti-menu"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              aria-label="Menu principal"
              className="absolute left-4 top-full z-50 w-[280px] origin-top-left bg-beige-light shadow-[0_18px_40px_-12px_rgba(27,46,74,0.18)] ring-1 ring-foreground/[0.04] sm:left-8 lg:left-12"
            >
              <ul className="flex flex-col py-2">
                {navLinks.map((l) => {
                  const isActive = pathname === l.to
                  return (
                    <li key={l.to}>
                      <Link
                        href={l.to}
                        className={cn(
                          'block px-7 py-3 text-[15px] font-light text-foreground transition-colors hover:bg-beige',
                          isActive && 'font-medium'
                        )}
                      >
                        {l.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </motion.nav>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  )
}

// Re-export pour usage externe si besoin
export { siteConfig as artiConfig }
