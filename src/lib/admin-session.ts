'use client'

/**
 * Session admin côté navigateur.
 *
 * Le jeton JWT est stocké dans localStorage. Il a une durée de vie limitée :
 * une fois expiré, le serveur répond 401 à tous les appels admin. Or un jeton
 * expiré RESTE présent dans localStorage — d'où le piège corrigé ici : tester
 * la simple présence du jeton faisait croire à l'admin qu'elle était connectée,
 * la page de contenu repartait vers /admin/login, qui la renvoyait aussitôt sur
 * le tableau de bord (« un jeton existe »)… et ainsi de suite. Résultat : elle
 * revenait toujours au tableau de bord sans jamais voir ses données ni le
 * formulaire de connexion.
 *
 * Règle unique désormais : un jeton n'est valable que s'il est présent ET non
 * expiré. Dès qu'il ne l'est plus, on purge la session avant toute redirection.
 */

const TOKEN_KEY = 'authToken'
const USER_KEY = 'authUser'

export type AdminUser = { id?: string; email: string; name?: string; role?: string }

/** Marge de sécurité : un jeton qui expire dans moins de 30 s est déjà mort. */
const EXPIRY_MARGIN_MS = 30_000

function base64UrlDecode(segment: string): string {
  const padded = segment.replace(/-/g, '+').replace(/_/g, '/')
  const full = padded + '='.repeat((4 - (padded.length % 4)) % 4)
  // decodeURIComponent + escape : restitue correctement les caractères non-ASCII.
  return decodeURIComponent(
    atob(full)
      .split('')
      .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('')
  )
}

/**
 * Date d'expiration du jeton, lue dans sa charge utile (claim `exp`).
 * Renvoie `null` si le jeton est illisible ou sans expiration.
 *
 * Note : cette lecture n'est PAS une vérification de signature (impossible côté
 * navigateur, et inutile ici). Le serveur reste seul juge — il refuse tout
 * jeton invalide avec un 401. Ce contrôle sert uniquement à éviter d'afficher
 * une interface « connectée » qui ne pourra rien charger.
 */
export function getTokenExpiry(token: string): number | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const payload = JSON.parse(base64UrlDecode(parts[1])) as { exp?: number }
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function getUser(): AdminUser | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AdminUser
  } catch {
    return null
  }
}

/** Efface le jeton et le profil : la session est terminée. */
export function clearSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

/** Vrai si un jeton est présent ET encore valable dans le temps. */
export function hasValidSession(): boolean {
  const token = getToken()
  if (!token) return false
  const expiry = getTokenExpiry(token)
  // Jeton sans `exp` lisible : on laisse le serveur trancher (401 le purgera).
  if (expiry === null) return true
  return expiry - EXPIRY_MARGIN_MS > Date.now()
}

/** En-têtes des appels admin authentifiés. */
export function authHeaders(extra?: HeadersInit): HeadersInit {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}`, ...extra }
}

/**
 * À appeler dès qu'une réponse admin renvoie 401 : la session est morte, on la
 * purge AVANT de renvoyer vers la connexion. Sans cette purge, le jeton périmé
 * restait en place et /admin/login rebasculait aussitôt sur le tableau de bord.
 */
export function endSession(): void {
  clearSession()
  if (typeof window === 'undefined') return
  // `replace` plutôt que `push` : la page inaccessible ne doit pas rester dans
  // l'historique (le bouton Retour y ramènerait pour rien).
  window.location.replace('/admin/login?expired=1')
}
