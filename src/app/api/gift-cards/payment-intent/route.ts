import { NextRequest, NextResponse } from 'next/server'

import { MIN_AMOUNT, MAX_AMOUNT } from '@/lib/giftcard'
import { isStripeConfigured, createGiftCardPaymentIntent } from '@/lib/stripe'

// POST /api/gift-cards/payment-intent — initialise un paiement Stripe (public).
// Renvoie le client_secret consommé par Stripe Elements côté front.
export async function POST(request: NextRequest) {
  try {
    if (!(await isStripeConfigured())) {
      return NextResponse.json(
        { error: 'Le paiement en ligne n’est pas encore activé.' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const amount = Number(body.amount)

    if (!amount || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      return NextResponse.json(
        { error: `Le montant doit être entre ${MIN_AMOUNT}€ et ${MAX_AMOUNT}€` },
        { status: 400 }
      )
    }

    const { clientSecret, paymentIntentId } = await createGiftCardPaymentIntent(amount, {
      kind: 'gift_card',
    })

    return NextResponse.json({ clientSecret, paymentIntentId })
  } catch (error) {
    console.error('Gift card payment-intent error:', error)
    return NextResponse.json(
      { error: 'Impossible d’initialiser le paiement.' },
      { status: 500 }
    )
  }
}
