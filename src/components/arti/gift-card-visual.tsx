import Image from 'next/image'

import { cn } from '@/lib/utils'

/**
 * Visuel officiel de la carte cadeau ARTI (recto illustré).
 * Image unique de marque, identique partout (site + email/PDF). Le montant, le
 * code et la date figurent sur le PDF reçu par email, pas sur cet aperçu.
 */
export function GiftCardVisual({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative mx-auto w-full max-w-[320px] overflow-hidden rounded-xl shadow-[var(--shadow-md)] ring-1 ring-foreground/10',
        className
      )}
    >
      <Image
        src="/brand/carte-cadeau-recto.png"
        alt="Carte cadeau ARTI"
        width={894}
        height={1276}
        className="h-auto w-full"
        sizes="(max-width: 640px) 80vw, 320px"
      />
    </div>
  )
}
