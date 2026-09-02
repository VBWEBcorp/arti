'use client'

import { usePathname } from 'next/navigation'

import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { Marketing } from '@/components/marketing/marketing'
import { ScrollToTop } from '@/components/scroll-to-top'

export function RootWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Tout /admin porte son propre habillage (page de connexion comprise, qui est
  // en plein écran). Le faire dépendre du jeton affichait la barre et le pied de
  // page du site public par-dessus l'écran de connexion.
  if (pathname?.startsWith('/admin')) {
    return children
  }

  return (
    <>
      {/* Marketing : le bandeau d'annonce se place au-dessus de la barre de
          navigation, la popup se superpose au reste. Sans ce montage, les
          réglages de l'espace admin n'atteignent aucun visiteur. */}
      <Marketing />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <ScrollToTop />
    </>
  )
}
