import { NextRequest, NextResponse } from 'next/server'

import { verifyAuth } from '@/lib/auth'
import { GiftCardError, getGiftCardById, deleteGiftCard } from '@/lib/giftcard'

type Params = Promise<{ id: string }>

// GET /api/gift-cards/:id — détail (admin)
export async function GET(request: NextRequest, { params }: { params: Params }) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const giftCard = await getGiftCardById(id)
    return NextResponse.json(giftCard, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    if (error instanceof GiftCardError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('Gift card detail error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/gift-cards/:id — suppression définitive (admin)
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await deleteGiftCard(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof GiftCardError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('Gift card delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
