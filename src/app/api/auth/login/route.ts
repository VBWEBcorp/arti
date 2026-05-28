import { NextRequest, NextResponse } from 'next/server'
import { generateToken } from '@/lib/auth'

// Compte admin en dur : aucune base de données requise pour se connecter.
const ADMIN_EMAIL = 'hello@articafeceramique.fr'
const ADMIN_PASSWORD = 'arti2230'

export async function POST(request: NextRequest) {
  try {
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
