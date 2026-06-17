import { NextRequest, NextResponse } from 'next/server'

import { connectDB } from '@/lib/db'
import { GiftCard } from '@/models/GiftCard'
import { getGiftCardDesign } from '@/lib/giftcard'
import { renderGiftCardImage } from '@/lib/gift-card-image'

// Génère l'image à la demande : pas de cache de route (le design peut changer).
export const dynamic = 'force-dynamic'

// GET /api/gift-cards/image/:code — rend la carte cadeau en PNG (public).
// Sert dans les emails via <img src="…"> : rendu identique partout, insensible
// au mode sombre (le texte est gravé dans l'image), et sans hébergement externe.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params
    await connectDB()

    const card = await GiftCard.findOne({ code: code.toUpperCase().trim() }).lean<{
      initialAmount: number
      code: string
      imageUrl?: string | null
      recipient?: { name?: string; message?: string }
    }>()
    if (!card) return new NextResponse('Carte introuvable', { status: 404 })

    // Fond propre à la carte s'il existe, sinon le design global.
    const globalDesign = await getGiftCardDesign()
    const design = card.imageUrl
      ? { ...globalDesign, backgroundUrl: card.imageUrl }
      : globalDesign

    const png = await renderGiftCardImage(design, {
      amount: card.initialAmount,
      code: card.code,
      recipientName: card.recipient?.name,
      message: card.recipient?.message,
    })

    return new NextResponse(new Uint8Array(png), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        // Caché par les proxys d'images (Gmail) une fois généré.
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Gift card image error:', error)
    return new NextResponse('Erreur', { status: 500 })
  }
}
