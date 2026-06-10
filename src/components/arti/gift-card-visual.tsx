import Image from 'next/image'

import { type GiftCardDesign, GIFT_CARD_DESIGN_DEFAULT } from '@/lib/gift-card-design'
import { cn } from '@/lib/utils'

type GiftCardVisualProps = {
  amount: number
  code: string
  recipientName?: string
  message?: string
  design?: GiftCardDesign | null
  className?: string
}

const eur = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)

/**
 * Rendu visuel d'une carte cadeau ARTI.
 *
 * Sans `design` (ou sans fond), affiche le visuel ARTI par défaut (sauge).
 * Avec un fond personnalisé, l'image sert d'arrière-plan et les champs
 * (montant, destinataire, message, code) sont rendus par-dessus, avec une
 * couleur de texte et un voile de lisibilité réglés par l'admin.
 */
export function GiftCardVisual({
  amount,
  code,
  recipientName,
  message,
  design,
  className,
}: GiftCardVisualProps) {
  const d = design || GIFT_CARD_DESIGN_DEFAULT
  const hasBg = !!d.backgroundUrl
  const dark = d.textColor === 'dark'

  // Couleur d'encre adaptative (rgb) pour décliner les opacités sans classes fixes.
  const ink = dark ? '31, 36, 33' : '255, 255, 255'
  const c = {
    full: { color: `rgb(${ink})` },
    strong: { color: `rgba(${ink}, 0.9)` },
    muted: { color: `rgba(${ink}, 0.8)` },
    faint: { color: `rgba(${ink}, 0.7)` },
  }

  // Voile : assombrit (texte clair) ou éclaircit (texte foncé) le fond.
  const scrimColor = dark
    ? `rgba(255, 255, 255, ${d.scrim / 100})`
    : `rgba(0, 0, 0, ${d.scrim / 100})`

  return (
    <div
      className={cn(
        'relative aspect-[1.6/1] w-full overflow-hidden rounded-xl shadow-xl',
        !hasBg && 'bg-sauge',
        className
      )}
      style={
        hasBg
          ? {
              backgroundColor: '#7d8a6f',
              backgroundImage: `url('${d.backgroundUrl}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      {/* Motif décoratif (uniquement sur le fond ARTI par défaut) */}
      {!hasBg && (
        <>
          <div aria-hidden className="absolute -right-10 -top-10 size-40 rounded-full bg-white/10" />
          <div aria-hidden className="absolute -bottom-12 -left-8 size-32 rounded-full bg-white/10" />
        </>
      )}

      {/* Voile de lisibilité sur fond personnalisé */}
      {hasBg && d.scrim > 0 && (
        <div aria-hidden className="absolute inset-0" style={{ backgroundColor: scrimColor }} />
      )}

      <div className="relative flex h-full flex-col justify-between p-6 sm:p-7">
        <div className="flex items-start justify-between">
          <div>
            <Image
              src="/brand/logo-arti.png"
              alt="ARTI"
              width={120}
              height={48}
              className={cn(
                'h-8 w-auto object-contain',
                dark ? 'brightness-0' : 'brightness-0 invert'
              )}
            />
            <p
              className="mt-1 text-[11px] uppercase tracking-[0.22em]"
              style={c.muted}
            >
              {d.heading || 'Carte cadeau'}
            </p>
          </div>
          <span
            className="font-display text-4xl font-medium leading-none sm:text-5xl"
            style={c.full}
          >
            {eur(amount)}
          </span>
        </div>

        <div>
          {recipientName && (
            <p className="text-sm" style={c.strong}>
              <span style={c.faint}>Offert à </span>
              {recipientName}
            </p>
          )}
          {message && (
            <p className="mt-1 line-clamp-2 text-xs italic" style={c.muted}>
              « {message} »
            </p>
          )}
          <p className="mt-3 font-mono text-lg font-semibold tracking-[0.18em]" style={c.full}>
            {code}
          </p>
        </div>
      </div>
    </div>
  )
}
