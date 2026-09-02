'use client'

import { ArrowRight, X } from 'lucide-react'

import { type MarketingSettings, lienSur, withAlpha } from '@/lib/marketing'
import { cn } from '@/lib/utils'

interface BannerBarProps {
  settings: MarketingSettings
  onClose?: () => void
  /** Aperçu de l'admin : pas de navigation, pas de fermeture. */
  preview?: boolean
  className?: string
}

/**
 * Le bandeau d'annonce, posé au-dessus de la barre de navigation.
 *
 * Comme la carte du popup, ce composant est LE rendu : l'aperçu de l'espace
 * admin affiche exactement celui-ci.
 */
export function MarketingBannerBar({ settings, onClose, preview = false, className }: BannerBarProps) {
  const { text, bgColor, textColor } = settings.banner
  const lien = lienSur(settings.banner.link)
  const contenu = text || (preview ? 'Votre annonce apparaît ici' : '')

  const interieur = (
    <span className="inline-flex items-center gap-2">
      {contenu}
      {lien && <ArrowRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />}
    </span>
  )

  return (
    <div
      className={cn('relative w-full', className)}
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <div className="mx-auto flex min-h-10 max-w-6xl items-center justify-center px-10 py-2 text-center text-[13px] font-medium tracking-wide">
        {lien && !preview ? (
          <a
            href={lien.href}
            target={lien.externe ? '_blank' : undefined}
            rel={lien.externe ? 'noopener noreferrer' : undefined}
            className="group transition-opacity hover:opacity-80"
          >
            {interieur}
          </a>
        ) : (
          interieur
        )}
      </div>

      {onClose && !preview && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Masquer l'annonce"
          className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full transition-colors sm:right-4"
          style={{ color: textColor, backgroundColor: withAlpha(textColor, 0.001) }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = withAlpha(textColor, 0.15)
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = withAlpha(textColor, 0.001)
          }}
        >
          <X className="size-3.5" strokeWidth={2.5} />
        </button>
      )}
    </div>
  )
}
