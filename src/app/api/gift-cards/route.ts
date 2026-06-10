import { NextRequest, NextResponse } from 'next/server'

import { verifyAuth } from '@/lib/auth'
import {
  GiftCardError,
  MIN_AMOUNT,
  MAX_AMOUNT,
  createGiftCard,
  getAllGiftCards,
} from '@/lib/giftcard'

// GET /api/gift-cards — liste paginée (admin)
export async function GET(request: NextRequest) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const result = await getAllGiftCards(
      { status: searchParams.get('status') || undefined, search: searchParams.get('search') || undefined },
      { page: searchParams.get('page') || undefined, limit: searchParams.get('limit') || undefined }
    )

    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Gift cards list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/gift-cards — création manuelle (admin)
export async function POST(request: NextRequest) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const amount = Number(body.initialAmount)
    if (!amount || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      return NextResponse.json(
        { error: `Le montant doit être entre ${MIN_AMOUNT}€ et ${MAX_AMOUNT}€` },
        { status: 400 }
      )
    }

    const allowedSources = ['on_site', 'avoir', 'employee_benefit']
    const source = allowedSources.includes(body.source) ? body.source : 'admin'

    const giftCard = await createGiftCard(
      {
        initialAmount: amount,
        source,
        purchasedBy: body.purchasedBy || {},
        recipient: body.recipient || {},
        imageUrl: typeof body.imageUrl === 'string' && body.imageUrl ? body.imageUrl : null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        adminName: user.email,
      },
      user.userId
    )

    return NextResponse.json(giftCard, { status: 201 })
  } catch (error) {
    if (error instanceof GiftCardError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('Gift card create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
