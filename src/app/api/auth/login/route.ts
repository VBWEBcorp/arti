import { NextRequest, NextResponse } from 'next/server'
import { generateToken } from '@/lib/auth'

// Compte admin via variables d'environnement (aucune base de données requise).
// Définir ADMIN_EMAIL et ADMIN_PASSWORD (.env.local en local, variables Netlify en prod).
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').toLowerCase()
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''

export async function POST(request: NextRequest) {
  try {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Compte admin non configuré (ADMIN_EMAIL / ADMIN_PASSWORD manquants)' },
        { status: 500 }
      )
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (
      String(email).toLowerCase() !== ADMIN_EMAIL ||
      String(password) !== ADMIN_PASSWORD
    ) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = generateToken({
      userId: 'admin',
      email: ADMIN_EMAIL,
      role: 'admin',
    })

    return NextResponse.json({
      token,
      user: { id: 'admin', email: ADMIN_EMAIL, name: 'ARTI', role: 'admin' },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
