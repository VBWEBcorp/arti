import { NextRequest, NextResponse } from 'next/server'

import { verifyAuth } from '@/lib/auth'
import { GiftCardError, restoreGiftCard } from '@/lib/giftcard'

type Params = Promise<{ id: string }>

// PATCH /api/gift-cards/:id/restore — restaure une carte depuis la corbeille (admin)
export async function PATCH(request: NextRequest, { params }: { params: Params }) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const giftCard = await restoreGiftCard(id)
    return NextResponse.json(giftCard)
  } catch (error) {
    if (error instanceof GiftCardError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('Gift card restore error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
