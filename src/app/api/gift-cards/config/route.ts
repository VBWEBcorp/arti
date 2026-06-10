import { NextResponse } from 'next/server'

import { GIFT_CARD_PRESETS, MIN_AMOUNT, MAX_AMOUNT, getGiftCardDesign } from '@/lib/giftcard'
import { isStripeConfigured, getStripePublishableKey } from '@/lib/stripe'

// L'apparence est stockée en base et peut changer à tout moment : la config ne
// doit jamais être mise en cache, sinon un changement de fond ne s'afficherait
// pas avant un redéploiement.
export const dynamic = 'force-dynamic'

// GET /api/gift-cards/config — config publique pour la page d'achat
export async function GET() {
  const [stripeConfigured, stripePublishableKey, design] = await Promise.all([
    isStripeConfigured(),
    getStripePublishableKey(),
    getGiftCardDesign(),
  ])
  return NextResponse.json({
    presets: GIFT_CARD_PRESETS,
    min: MIN_AMOUNT,
    max: MAX_AMOUNT,
    stripeConfigured,
    stripePublishableKey,
    design,
  })
}
