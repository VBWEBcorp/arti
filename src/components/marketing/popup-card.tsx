'use client'

import { X } from 'lucide-react'

import {
  type MarketingSettings,
  lienSur,
  readableTextOn,
  withAlpha,
} from '@/lib/marketing'
import { cn } from '@/lib/utils'

interface PopupCardProps {
  settings: MarketingSettings
  onClose: () => void
  /** Version resserrée : mise en page « coin » et aperçu de l'admin. */
  compact?: boolean
  /**
   * Aperçu : le bouton ne navigue pas et les textes vides sont remplacés par
   * un exemple, pour que la gérante voie toujours une carte crédible.
   */
  preview?: boolean
  className?: string
}

/**
 * La carte du popup marketing — LE rendu, et le seul.
 *
 * Le site public et l'aperçu de l'espace admin affichent ce composant, avec les
 * mêmes réglages. Auparavant l'aperçu était une copie du balisage : les deux
 * pouvaient diverger sans que rien ne le signale, et l'aperçu mentait.
 *
 * Habillage repris de la charte ARTI : coins très arrondis, titre manuscrit
 * (Caveat), filet sauge, bouton en gélule. Les couleurs restent celles choisies
 * dans l'admin, et le texte du bouton s'assombrit tout seul sur un fond clair.
 */
export function MarketingPopupCard({
  settings,
  onClose,
  compact = false,
  preview = false,
  className,
}: PopupCardProps) {
  const { bgColor, textColor, buttonColor } = settings

  const titre = settings.title || (preview ? 'Votre titre' : '')
  const description = settings.description || (preview ? 'Le texte de votre message apparaît ici.' : '')
  const libelleBouton = settings.buttonText || (preview ? 'En savoir plus' : '')
  const lien = lienSur(settings.buttonLink)

  // Un message court se lit bien centré ; un texte d'annonce (programme d'un
  // atelier, tarifs, plusieurs lignes) se lit à gauche. Le premier message
  // rédigé par la boutique fait 500 caractères sur cinq lignes.
  const texteLong = description.length > 160 || description.includes('\n')

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden shadow-[0_30px_70px_-25px_rgba(27,46,74,0.45)]',
        compact ? 'max-w-[380px] rounded-[26px]' : 'max-w-[440px] rounded-[32px]',
        className
      )}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        border: `1px solid ${withAlpha(textColor, 0.1)}`,
      }}
    >
      {/* Halos décoratifs, dans la couleur du bouton : la carte respire sans
          dépendre d'une image. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-16 size-48 rounded-full opacity-[0.18] blur-3xl"
        style={{ backgroundColor: buttonColor }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-20 size-40 rounded-full opacity-[0.12] blur-3xl"
        style={{ backgroundColor: buttonColor }}
      />

      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        className="absolute top-4 right-4 z-20 flex size-9 items-center justify-center rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110 cursor-pointer"
        style={{
          backgroundColor: withAlpha(textColor, 0.08),
          color: textColor,
          border: `1px solid ${withAlpha(textColor, 0.08)}`,
        }}
      >
        <X className="size-4" strokeWidth={2.5} />
      </button>

      {/* Image d'illustration, fondue dans le fond de la carte */}
      {settings.imageUrl && (
        <div className={cn('relative w-full overflow-hidden', compact ? 'h-36' : 'h-48')}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={settings.imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-24"
            style={{ background: `linear-gradient(to top, ${bgColor}, transparent)` }}
          />
        </div>
      )}

      <div
        className={cn(
          'relative flex flex-col items-center text-center',
          compact ? 'px-6 pb-7' : 'px-8 pb-9',
          settings.imageUrl ? 'pt-2' : compact ? 'pt-9' : 'pt-10'
        )}
      >
        {/* Logo de la boutique */}
        {settings.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={settings.logoUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className={cn('mb-4 w-auto object-contain', compact ? 'max-h-9' : 'max-h-12')}
          />
        )}

        {/* Filet manuscrit — signature graphique d'ARTI */}
        <span
          aria-hidden
          className="mb-5 block h-[3px] w-12 rounded-full"
          style={{ backgroundColor: buttonColor }}
        />

        {titre && (
          <h2
            className={cn(
              'font-display font-bold leading-[1.05] tracking-tight',
              compact ? 'text-[30px]' : 'text-[38px]'
            )}
          >
            {titre}
          </h2>
        )}

        {description && (
          <p
            className={cn(
              // `whitespace-pre-line` : les retours à la ligne saisis dans
              // l'admin sont conservés à l'écran.
              'mt-3 w-full whitespace-pre-line leading-relaxed',
              compact ? 'text-[13px]' : 'text-sm',
              texteLong && 'text-left'
            )}
            style={{ color: withAlpha(textColor, 0.75) }}
          >
            {description}
          </p>
        )}

        {libelleBouton && (
          <a
            href={preview ? undefined : lien?.href ?? '#'}
            target={!preview && lien?.externe ? '_blank' : undefined}
            rel={!preview && lien?.externe ? 'noopener noreferrer' : undefined}
            onClick={(e) => {
              if (preview) {
                e.preventDefault()
                return
              }
              // Le message a rempli son office : on referme derrière le clic.
              onClose()
            }}
            className={cn(
              'mt-7 inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0',
              compact ? 'px-6 py-3 text-[13px]' : 'px-8 py-3.5 text-sm',
              preview ? 'cursor-default' : 'cursor-pointer'
            )}
            style={{
              backgroundColor: buttonColor,
              color: readableTextOn(buttonColor),
              boxShadow: `0 10px 24px -10px ${withAlpha(buttonColor, 0.9)}`,
            }}
          >
            {libelleBouton}
          </a>
        )}
      </div>
    </div>
  )
}
