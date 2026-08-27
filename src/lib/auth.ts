import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key'

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

// Durée de vie du jeton admin. 30 jours plutôt que 7 : l'espace n'est utilisé
// que ponctuellement (quelques passages par mois), et une expiration trop
// courte reconnectait sans cesse. L'expiration reste réelle — le navigateur la
// détecte désormais et propose la reconnexion au lieu de rester bloqué.
const TOKEN_TTL = '30d'

export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_TTL })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return null

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null

  return parts[1]
}

export async function verifyAuth(request: NextRequest) {
  const token = getTokenFromRequest(request)
  if (!token) {
    return { authenticated: false, user: null }
  }

  const payload = verifyToken(token)
  if (!payload) {
    return { authenticated: false, user: null }
  }

  return { authenticated: true, user: payload }
}
