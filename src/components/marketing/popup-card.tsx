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
  /** Version resserrée : mise en page « coin », jamais scindée en deux colonnes. */
  compact?: boolean
  /**
   * Aperçu : le bouton ne navigue pas et les textes vides sont remplacés par
   * un exemple, pour que la gérante voie toujours une carte crédible.
   */
  preview?: boolean
  /**
   * Hauteur maximale de la carte. Sur le site c'est la hauteur de l'écran ;
   * l'aperçu de l'admin passe la hauteur de l'appareil simulé, sinon une carte
   * « téléphone » se mesurerait à l'écran d'ordinateur qui l'affiche.
   */
  hauteurMax?: string
  className?: string
}

/**
 * La carte du popup marketing : LE rendu, et le seul.
 *
 * Le site public et l'aperçu de l'espace admin affichent ce composant avec les
 * mêmes réglages. Auparavant l'aperçu était une copie du balisage : les deux
 * pouvaient diverger sans que rien ne le signale.
 *
 * Mise en page : la carte se scinde en deux colonnes (image à gauche, texte à
 * droite) dès qu'on lui donne assez de largeur, et reste verticale sinon. Le
 * seuil est une **requête de conteneur** (`@container`), pas une largeur
 * d'écran : la carte réagit à la place qu'on lui donne. C'est ce qui rend
 * l'aperçu de l'admin exact, un cadre de téléphone posé sur un écran
 * d'ordinateur donnant bien le rendu téléphone.
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
  hauteurMax = '88dvh',
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

  // Deux colonnes seulement s'il y a une image à mettre à gauche, et jamais en
  // version « coin » qui doit rester discrète.
  const scindable = Boolean(settings.imageUrl) && !compact

  return (
    <div className={cn('@container w-full', className)}>
      <div
        className={cn(
          'relative flex flex-col overflow-hidden shadow-[0_30px_70px_-25px_rgba(27,46,74,0.45)]',
          compact ? 'rounded-[24px]' : 'rounded-[26px] @2xl:rounded-[32px]',
          scindable && '@2xl:grid @2xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]'
        )}
        style={
          {
            maxHeight: hauteurMax,
            // Sert de référence à la hauteur d'image ci-dessous : sur le site
            // c'est l'écran réel, dans l'aperçu c'est l'appareil simulé.
            '--h-popup': hauteurMax,
            backgroundColor: bgColor,
            color: textColor,
            border: `1px solid ${withAlpha(textColor, 0.1)}`,
          } as React.CSSProperties
        }
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

        {/* Hors du bloc qui défile : la croix reste atteignable même quand un
            texte long fait défiler la carte sur téléphone. */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-3 right-3 z-30 flex size-9 items-center justify-center rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110 @2xl:top-4 @2xl:right-4 cursor-pointer"
          style={{
            backgroundColor: withAlpha(bgColor, 0.75),
            color: textColor,
            border: `1px solid ${withAlpha(textColor, 0.12)}`,
          }}
        >
          <X className="size-4" strokeWidth={2.5} />
        </button>

        {/* Image.
            Empilée : elle garde ses proportions (une affiche verticale n'est
            pas réduite à une bande) et sa hauteur est plafonnée pour laisser
            voir le texte. Scindée : elle remplit la colonne de gauche. */}
        {settings.imageUrl && (
          <div
            className={cn(
              'relative w-full shrink-0',
              scindable && '@2xl:h-full @2xl:min-h-[440px]'
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={settings.imageUrl}
              alt=""
              loading="lazy"
              decoding="async"
              className={cn(
                'w-full object-cover object-center',
                compact
                  ? 'max-h-[calc(var(--h-popup)*0.34)]'
                  : 'max-h-[calc(var(--h-popup)*0.42)]',
                scindable && '@2xl:absolute @2xl:inset-0 @2xl:size-full @2xl:max-h-none'
              )}
            />
            {/* Fondu vers le fond de la carte, uniquement en mode empilé */}
            <div
              aria-hidden
              className={cn(
                'pointer-events-none absolute inset-x-0 bottom-0 h-16',
                scindable && '@2xl:hidden'
              )}
              style={{ background: `linear-gradient(to top, ${bgColor}, transparent)` }}
            />
            {scindable && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 right-0 hidden w-px @2xl:block"
                style={{ backgroundColor: withAlpha(textColor, 0.1) }}
              />
            )}
          </div>
        )}

        {/* Contenu : c'est LUI qui défile, pas la carte entière. */}
        <div
          className={cn(
            'relative flex min-h-0 flex-1 flex-col items-center overflow-y-auto overscroll-contain text-center',
            compact ? 'px-5 pt-6 pb-6' : 'px-6 pt-7 pb-8 @2xl:px-10 @2xl:py-11',
            scindable && '@2xl:items-start @2xl:justify-center @2xl:text-left',
            !settings.imageUrl && (compact ? 'pt-8' : 'pt-9 @2xl:py-12')
          )}
        >
          {settings.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.logoUrl}
              alt=""
              loading="lazy"
              decoding="async"
              className={cn('mb-4 w-auto shrink-0 object-contain', compact ? 'max-h-8' : 'max-h-11')}
            />
          )}

          {/* Filet manuscrit : signature graphique d'ARTI */}
          <span
            aria-hidden
            className="mb-4 block h-[3px] w-12 shrink-0 rounded-full"
            style={{ backgroundColor: buttonColor }}
          />

          {titre && (
            <h2
              className={cn(
                'font-display font-bold leading-[1.05] tracking-tight text-balance',
                compact ? 'text-[27px]' : 'text-[30px] @sm:text-[34px] @2xl:text-[40px]'
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
                compact ? 'text-[13px]' : 'text-[13.5px] @2xl:text-sm',
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
                'mt-6 inline-flex w-full shrink-0 items-center justify-center rounded-full font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 @sm:w-auto',
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
    </div>
  )
}
