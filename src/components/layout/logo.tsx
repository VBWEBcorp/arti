import Image from 'next/image'
import Link from 'next/link'

import { cn } from '@/lib/utils'

type LogoProps = {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

// Hauteurs du logo selon le contexte (ratio natif ~2.66:1 conservé via width auto)
const sizes = {
  sm: 'h-8',
  md: 'h-11',
  // Plus petit sur mobile pour dégager le bouton « Réserver », taille pleine dès sm.
  lg: 'h-12 sm:h-16',
} as const

/**
 * Logo ARTI officiel (capitales serif + jarres dessinées à la main).
 * Fichier : public/brand/logo-arti.png (814×306, fond transparent).
 */
export function Logo({ className, size = 'md' }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="ARTI Café Céramique — Accueil"
      className={cn(
        'group inline-flex items-center transition-opacity hover:opacity-80',
        className
      )}
    >
      <Image
        src="/brand/logo-arti.png"
        alt="ARTI Café Céramique"
        width={814}
        height={306}
        priority
        className={cn('w-auto', sizes[size])}
      />
    </Link>
  )
}
