import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import SiteContent from '@/models/SiteContent'
import { verifyAuth } from '@/lib/auth'

type Params = Promise<{ pageId: string }>

// Endpoint lu par l'admin (éditeur de pages) — pas par les pages publiques
// (elles lisent la base en direct via getPageContent). On ne cache donc pas,
// pour que l'admin voie toujours l'état à jour après une sauvegarde.
const CACHE_HEADERS = {
  'Cache-Control': 'no-store',
}

// GET page content (public)
export async function GET(request: NextRequest, { params }: { params: Params }) {
  try {
    const { pageId } = await params
    await connectDB()

    const page = await SiteContent.findOne({ pageId }).lean()
    if (!page) {
      return NextResponse.json(
        { pageId, content: {} },
        { headers: CACHE_HEADERS }
      )
    }

    return NextResponse.json(page, { headers: CACHE_HEADERS })
  } catch (error) {
    console.error('Content fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT update page content (admin only)
export async function PUT(request: NextRequest, { params }: { params: Params }) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { pageId } = await params
    await connectDB()

    const { content } = await request.json()

    const page = await SiteContent.findOneAndUpdate(
      { pageId },
      { pageId, content },
      { upsert: true, new: true }
    )

    return NextResponse.json(page)
  } catch (error) {
    console.error('Content update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
