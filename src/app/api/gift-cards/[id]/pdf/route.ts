import { NextRequest, NextResponse } from 'next/server'

import { verifyAuth } from '@/lib/auth'
import { GiftCardError, getGiftCardById } from '@/lib/giftcard'
import { renderGiftCardPdf } from '@/lib/gift-card-pdf'

type Params = Promise<{ id: string }>

// GET /api/gift-cards/:id/pdf — PDF de la carte (admin)
// `?download=1` force le téléchargement ; sinon affichage inline (aperçu).
export async function GET(request: NextRequest, { params }: { params: Params }) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const card = await getGiftCardById(id)

    const pdf = await renderGiftCardPdf({
      code: card.code,
      amount: card.initialAmount,
      expiresAt: card.expiresAt,
      recipientName: card.recipient?.name,
      message: card.recipient?.message,
    })

    const download = new URL(request.url).searchParams.get('download') === '1'
    const disposition = download ? 'attachment' : 'inline'

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${disposition}; filename="carte-cadeau-${card.code}.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    if (error instanceof GiftCardError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('Gift card pdf error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
