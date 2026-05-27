import { NextRequest, NextResponse } from 'next/server'

import { GiftCardError, checkBalance } from '@/lib/giftcard'

// POST /api/gift-cards/check-balance — vérifier le solde (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const code = typeof body.code === 'string' ? body.code.trim() : ''
    if (!code) {
      return NextResponse.json({ error: 'Le code de la carte cadeau est requis' }, { status: 400 })
    }

    const result = await checkBalance(code)
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    if (error instanceof GiftCardError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('Gift card check-balance error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
