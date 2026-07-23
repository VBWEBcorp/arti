import { NextRequest, NextResponse } from 'next/server'

import { verifyAuth } from '@/lib/auth'
import { getExpiredStats } from '@/lib/giftcard'

export const dynamic = 'force-dynamic'

// GET /api/gift-cards/expired-stats?from=YYYY-MM-DD&to=YYYY-MM-DD — compta (admin)
export async function GET(request: NextRequest) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const stats = await getExpiredStats({
      from: searchParams.get('from'),
      to: searchParams.get('to'),
    })

    return NextResponse.json(stats, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Expired stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
