import { NextResponse } from 'next/server'

import { GIFT_CARD_PRESETS, MIN_AMOUNT, MAX_AMOUNT } from '@/lib/giftcard'
import { isStripeConfigured, getStripePublishableKey } from '@/lib/stripe'

// GET /api/gift-cards/config — config publique pour la page d'achat
export async function GET() {
  const [stripeConfigured, stripePublishableKey] = await Promise.all([
    isStripeConfigured(),
    getStripePublishableKey(),
  ])
  return NextResponse.json({
    presets: GIFT_CARD_PRESETS,
    min: MIN_AMOUNT,
    max: MAX_AMOUNT,
    stripeConfigured,
    stripePublishableKey,
  })
}
