import { NextRequest, NextResponse } from 'next/server'

import { verifyAuth } from '@/lib/auth'
import { GiftCardError, redeemOnSite } from '@/lib/giftcard'

// POST /api/gift-cards/redeem — utilisation sur place (staff/admin)
export async function POST(request: NextRequest) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const code = typeof body.code === 'string' ? body.code.trim() : ''

    if (!code) {
      return NextResponse.json({ error: 'Le code de la carte est requis' }, { status: 400 })
    }

    // Carte à usage unique : on consomme l'intégralité de la carte.
    const giftCard = await redeemOnSite(
      code,
      { id: user.userId, name: user.email },
      typeof body.description === 'string' ? body.description : null
    )

    return NextResponse.json({
      code: giftCard.code,
      amount: giftCard.initialAmount,
      status: giftCard.status,
    })
  } catch (error) {
    if (error instanceof GiftCardError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('Gift card redeem error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
