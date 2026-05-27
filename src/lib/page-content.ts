import { connectDB } from '@/lib/db'
import SiteContent from '@/models/SiteContent'

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

/**
 * Fusionne récursivement les overrides du CMS sur les valeurs par défaut.
 * Les tableaux de l'override remplacent ceux des défauts (édition de listes).
 */
export function deepMerge<T>(base: T, override: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return (override === undefined ? base : (override as T))
  }
  const out: Record<string, unknown> = { ...base }
  for (const key of Object.keys(override)) {
    const b = (base as Record<string, unknown>)[key]
    const o = override[key]
    out[key] = isPlainObject(b) && isPlainObject(o) ? deepMerge(b, o) : o
  }
  return out as T
}

/**
 * Lit le contenu CMS d'une page et le fusionne sur les valeurs par défaut.
 * Si la DB est indisponible (build, pas de Mongo…), renvoie les défauts.
 *
 * Les pages qui l'utilisent doivent exporter `dynamic = 'force-dynamic'`
 * pour refléter les modifications enregistrées via l'admin.
 */
export async function getPageContent<T extends Record<string, unknown>>(
  pageId: string,
  defaults: T
): Promise<T> {
  try {
    await connectDB()
    const page = (await SiteContent.findOne({ pageId }).lean()) as
      | { content?: Record<string, unknown> }
      | null
    if (!page?.content) return defaults
    return deepMerge(defaults, page.content)
  } catch (err) {
    console.error(`[page-content] fallback défauts pour "${pageId}":`, (err as Error).message)
    return defaults
  }
}
