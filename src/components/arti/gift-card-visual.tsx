import Image from 'next/image'

import { cn } from '@/lib/utils'

type GiftCardVisualProps = {
  amount: number
  code: string
  recipientName?: string
  message?: string
  className?: string
}

const eur = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)

/** Rendu visuel on-brand d'une carte cadeau ARTI (sans éditeur de layout). */
export function GiftCardVisual({
  amount,
  code,
  recipientName,
  message,
  className,
}: GiftCardVisualProps) {
  return (
    <div
      className={cn(
        'relative aspect-[1.6/1] w-full overflow-hidden rounded-xl bg-sauge text-white shadow-xl',
        className
      )}
    >
      {/* Motif décoratif */}
      <div aria-hidden className="absolute -right-10 -top-10 size-40 rounded-full bg-white/10" />
      <div aria-hidden className="absolute -bottom-12 -left-8 size-32 rounded-full bg-white/10" />

      <div className="relative flex h-full flex-col justify-between p-6 sm:p-7">
        <div className="flex items-start justify-between">
          <div>
            <Image
              src="/brand/logo-arti.png"
              alt="ARTI"
              width={120}
              height={48}
              className="h-8 w-auto object-contain brightness-0 invert"
            />
            <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-white/80">
              Carte cadeau
            </p>
          </div>
          <span className="font-display text-4xl font-medium leading-none sm:text-5xl">
            {eur(amount)}
          </span>
        </div>

        <div>
          {recipientName && (
            <p className="text-sm text-white/90">
              <span className="text-white/70">Offert à </span>
              {recipientName}
            </p>
          )}
          {message && (
            <p className="mt-1 line-clamp-2 text-xs italic text-white/80">« {message} »</p>
          )}
          <p className="mt-3 font-mono text-lg font-semibold tracking-[0.18em]">{code}</p>
        </div>
      </div>
    </div>
  )
}
