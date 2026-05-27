import { NextResponse } from 'next/server'

import { GIFT_CARD_PRESETS, MIN_AMOUNT, MAX_AMOUNT } from '@/lib/giftcard'
import { isStripeConfigured } from '@/lib/stripe'

// GET /api/gift-cards/config — config publique pour la page d'achat
export async function GET() {
  return NextResponse.json({
    presets: GIFT_CARD_PRESETS,
    min: MIN_AMOUNT,
    max: MAX_AMOUNT,
    stripeConfigured: isStripeConfigured(),
  })
}
