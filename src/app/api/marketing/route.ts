import { NextRequest, NextResponse } from 'next/server'

import { verifyAuth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { DEFAULT_MARKETING, normalizeMarketing } from '@/lib/marketing'
import { MarketingPopup } from '@/models/Marketing'

/**
 * Réglages marketing (popup + bandeau).
 *
 * GET est public : le site le lit à chaque visite.
 * PUT est réservé à l'admin.
 */

// La popup est un réglage que la boutique modifie et veut voir tout de suite.
// Un cache long donnait l'impression que l'enregistrement n'avait rien changé.
// 30 s côté CDN : la page reste rapide, la modification arrive presque aussitôt.
const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=0, s-maxage=30, stale-while-revalidate=120',
}

export async function GET() {
  try {
    await connectDB()
    const popup = await MarketingPopup.findOne().lean()

    if (!popup) {
      return NextResponse.json(DEFAULT_MARKETING, { headers: CACHE_HEADERS })
    }

    // `updatedAt` accompagne les réglages : le site s'en sert comme signature de
    // campagne, pour réafficher un message modifié aux visiteurs qui avaient
    // fermé le précédent.
    const reglages = {
      ...normalizeMarketing(popup),
      updatedAt: (popup as { updatedAt?: Date }).updatedAt ?? null,
    }

    return NextResponse.json(reglages, { headers: CACHE_HEADERS })
  } catch (error) {
    console.error('Marketing popup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // On enregistre des réglages normalisés : le formulaire ne peut pas écrire
    // un délai négatif, une mise en page inconnue ou une date mal formée.
    const reglages = normalizeMarketing(await request.json())

    let popup = await MarketingPopup.findOne()
    if (!popup) {
      popup = await MarketingPopup.create(reglages)
    } else {
      popup.set(reglages)
      await popup.save()
    }

    return NextResponse.json({
      ...normalizeMarketing(popup.toObject()),
      updatedAt: popup.updatedAt ?? null,
    })
  } catch (error) {
    console.error('Marketing popup update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
