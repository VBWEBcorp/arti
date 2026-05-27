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
    const amount = Number(body.amount)

    if (!code) {
      return NextResponse.json({ error: 'Le code de la carte est requis' }, { status: 400 })
    }
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Le montant doit être supérieur à 0' }, { status: 400 })
    }

    const giftCard = await redeemOnSite(
      code,
      amount,
      { id: user.userId, name: user.email },
      typeof body.description === 'string' ? body.description : null
    )

    return NextResponse.json({
      code: giftCard.code,
      amountDebited: amount,
      remainingBalance: giftCard.balance,
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
