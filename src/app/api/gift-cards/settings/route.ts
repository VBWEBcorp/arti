import { NextRequest, NextResponse } from 'next/server'

import { verifyAuth } from '@/lib/auth'
import { getGiftCardDesign, updateGiftCardDesign } from '@/lib/giftcard'

// Réglage modifiable en base : jamais de cache.
export const dynamic = 'force-dynamic'

// GET /api/gift-cards/settings — apparence de la carte cadeau (public)
export async function GET() {
  try {
    const design = await getGiftCardDesign()
    return NextResponse.json(design, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Gift card settings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/gift-cards/settings — modifier l'apparence (admin)
export async function PUT(request: NextRequest) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const design = await updateGiftCardDesign({
      backgroundUrl: body.backgroundUrl,
      textColor: body.textColor,
      scrim: body.scrim,
      heading: body.heading,
    })

    return NextResponse.json(design)
  } catch (error) {
    console.error('Gift card settings update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
