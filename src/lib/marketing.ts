/**
 * Réglages marketing (popup + bannière).
 *
 * Un SEUL fichier décrit la forme des données, leurs valeurs par défaut et les
 * règles d'affichage. Le site public, l'espace admin et l'API s'y réfèrent tous :
 * l'aperçu que voit la gérante ne peut donc pas dériver de ce que voit le
 * visiteur, et un champ ajouté ici est ajouté partout d'un coup.
 */

/** Au centre de l'écran (modale) ou en carte discrète en bas à droite. */
export type PopupLayout = 'centre' | 'coin'

/** À quelle fréquence un même visiteur revoit la popup après l'avoir fermée. */
export type PopupFrequency = 'session' | 'jour' | 'toujours'

export interface MarketingBannerSettings {
  enabled: boolean
  text: string
  link: string
  bgColor: string
  textColor: string
}

export interface MarketingSettings {
  enabled: boolean
  title: string
  description: string
  buttonText: string
  buttonLink: string
  imageUrl: string
  logoUrl: string
  bgColor: string
  textColor: string
  buttonColor: string
  delay: number
  layout: PopupLayout
  frequency: PopupFrequency
  /** '' ou 'AAAA-MM-JJ' : la popup ne s'affiche pas avant cette date. */
  startDate: string
  /** '' ou 'AAAA-MM-JJ' : dernier jour d'affichage (inclus). */
  endDate: string
  banner: MarketingBannerSettings
}

/* ------------------------------------------------------------------ */
/* Palette ARTI (identique à src/index.css)                            */
/* ------------------------------------------------------------------ */

export const ARTI = {
  beige: '#EFE7D2',
  creme: '#F5EFE0',
  sauge: '#91977D',
  saugeDeep: '#757A65',
  navy: '#1B2E4A',
  terracotta: '#E89A6A',
  blanc: '#FFFFFF',
} as const

export const DEFAULT_MARKETING: MarketingSettings = {
  enabled: false,
  title: 'Offre spéciale',
  description: 'Réservez votre atelier peinture sur céramique et repartez avec votre création.',
  buttonText: 'Réserver ma place',
  buttonLink: '/infos-pratiques',
  imageUrl: '',
  logoUrl: '',
  bgColor: ARTI.creme,
  textColor: ARTI.navy,
  buttonColor: ARTI.sauge,
  delay: 5,
  layout: 'centre',
  frequency: 'session',
  startDate: '',
  endDate: '',
  banner: {
    enabled: false,
    text: '',
    link: '',
    bgColor: ARTI.sauge,
    textColor: ARTI.blanc,
  },
}

/* ------------------------------------------------------------------ */
/* Thèmes prêts à l'emploi                                             */
/* ------------------------------------------------------------------ */

export interface MarketingTheme {
  id: string
  label: string
  bgColor: string
  textColor: string
  buttonColor: string
}

/** Accords de couleurs tirés de la charte du site : aucun ne jure avec ARTI. */
export const POPUP_THEMES: MarketingTheme[] = [
  { id: 'sable', label: 'Sable', bgColor: ARTI.creme, textColor: ARTI.navy, buttonColor: ARTI.sauge },
  { id: 'blanc', label: 'Blanc', bgColor: ARTI.blanc, textColor: ARTI.navy, buttonColor: ARTI.sauge },
  { id: 'sauge', label: 'Sauge', bgColor: ARTI.sauge, textColor: ARTI.blanc, buttonColor: ARTI.navy },
  { id: 'terracotta', label: 'Terracotta', bgColor: '#FBEDE2', textColor: ARTI.navy, buttonColor: ARTI.terracotta },
  { id: 'nuit', label: 'Nuit', bgColor: ARTI.navy, textColor: ARTI.creme, buttonColor: ARTI.terracotta },
]

export const BANNER_THEMES: MarketingTheme[] = [
  { id: 'sauge', label: 'Sauge', bgColor: ARTI.sauge, textColor: ARTI.blanc, buttonColor: ARTI.blanc },
  { id: 'navy', label: 'Nuit', bgColor: ARTI.navy, textColor: ARTI.creme, buttonColor: ARTI.creme },
  { id: 'terracotta', label: 'Terracotta', bgColor: ARTI.terracotta, textColor: ARTI.navy, buttonColor: ARTI.navy },
  { id: 'sable', label: 'Sable', bgColor: ARTI.beige, textColor: ARTI.navy, buttonColor: ARTI.navy },
]

/* ------------------------------------------------------------------ */
/* Couleurs : lisibilité                                               */
/* ------------------------------------------------------------------ */

/** Composantes RVB d'un `#rgb` ou `#rrggbb`. `null` si la chaîne n'est pas lisible. */
function rgb(hex: string): [number, number, number] | null {
  const h = (hex || '').trim().replace('#', '')
  const plein = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  if (!/^[0-9a-f]{6}$/i.test(plein)) return null
  return [
    parseInt(plein.slice(0, 2), 16),
    parseInt(plein.slice(2, 4), 16),
    parseInt(plein.slice(4, 6), 16),
  ]
}

/** Luminance relative (WCAG). 0 = noir, 1 = blanc. */
function luminance(hex: string): number {
  const c = rgb(hex)
  if (!c) return 1
  const [r, v, b] = c.map((n) => {
    const s = n / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * v + 0.0722 * b
}

/**
 * Texte lisible posé sur `hex`.
 *
 * Le libellé du bouton était écrit en blanc en dur : un bouton sable ou beige
 * donnait du blanc sur clair, illisible. On choisit maintenant navy ou blanc
 * selon le fond réellement choisi.
 */
export function readableTextOn(hex: string): string {
  return luminance(hex) > 0.55 ? ARTI.navy : ARTI.blanc
}

/** `#rrggbb` + opacité → `rgba(...)`, pour les ombres et les voiles. */
export function withAlpha(hex: string, alpha: number): string {
  const c = rgb(hex)
  if (!c) return `rgba(27, 46, 74, ${alpha})`
  return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${alpha})`
}

/* ------------------------------------------------------------------ */
/* Normalisation + règles d'affichage                                  */
/* ------------------------------------------------------------------ */

const LAYOUTS: PopupLayout[] = ['centre', 'coin']
const FREQUENCIES: PopupFrequency[] = ['session', 'jour', 'toujours']

function texte(v: unknown, defaut: string): string {
  return typeof v === 'string' ? v : defaut
}

/**
 * Anciennes couleurs par défaut du module, héritées du template : blanc, gris
 * ardoise et bleu vif. Elles ne viennent d'aucun choix de la boutique — c'est
 * ce que le formulaire proposait — et le bleu jure avec la charte ARTI.
 *
 * Quand les TROIS sont encore là telles quelles, on sert le thème « Sable ».
 * Dès qu'une seule a été modifiée, on ne touche à rien : le choix est délibéré.
 */
const COULEURS_HERITEES = { bg: '#ffffff', texte: '#111827', bouton: '#2563eb' }

function couleursNonChoisies(bg: string, txt: string, btn: string): boolean {
  return (
    bg.toLowerCase() === COULEURS_HERITEES.bg &&
    txt.toLowerCase() === COULEURS_HERITEES.texte &&
    btn.toLowerCase() === COULEURS_HERITEES.bouton
  )
}

/** Anciennes couleurs par défaut du bandeau (noir/blanc du template). */
function couleursBandeauNonChoisies(bg: string, txt: string): boolean {
  return bg.toLowerCase() === '#111827' && txt.toLowerCase() === '#ffffff'
}

function date(v: unknown): string {
  return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : ''
}

/**
 * Complète des réglages partiels (base, API, formulaire) avec les valeurs par
 * défaut, en corrigeant les types douteux. Un document enregistré avant l'ajout
 * d'un champ reste donc exploitable tel quel.
 */
export function normalizeMarketing(raw: unknown): MarketingSettings {
  const d = DEFAULT_MARKETING
  const o = (raw ?? {}) as Record<string, unknown>
  const b = (o.banner ?? {}) as Record<string, unknown>

  const delaiBrut = Number(o.delay)
  const layout = o.layout as PopupLayout
  const frequency = o.frequency as PopupFrequency

  let bgColor = texte(o.bgColor, d.bgColor)
  let textColor = texte(o.textColor, d.textColor)
  let buttonColor = texte(o.buttonColor, d.buttonColor)
  if (couleursNonChoisies(bgColor, textColor, buttonColor)) {
    bgColor = d.bgColor
    textColor = d.textColor
    buttonColor = d.buttonColor
  }

  let bannerBg = texte(b.bgColor, d.banner.bgColor)
  let bannerTexte = texte(b.textColor, d.banner.textColor)
  if (couleursBandeauNonChoisies(bannerBg, bannerTexte)) {
    bannerBg = d.banner.bgColor
    bannerTexte = d.banner.textColor
  }

  return {
    enabled: o.enabled === true,
    title: texte(o.title, d.title),
    description: texte(o.description, d.description),
    buttonText: texte(o.buttonText, d.buttonText),
    buttonLink: texte(o.buttonLink, d.buttonLink),
    imageUrl: texte(o.imageUrl, ''),
    logoUrl: texte(o.logoUrl, ''),
    bgColor,
    textColor,
    buttonColor,
    // Un délai négatif ou absurde ne doit pas rendre la popup invisible.
    delay: Number.isFinite(delaiBrut) ? Math.min(Math.max(Math.round(delaiBrut), 0), 60) : d.delay,
    layout: LAYOUTS.includes(layout) ? layout : d.layout,
    frequency: FREQUENCIES.includes(frequency) ? frequency : d.frequency,
    startDate: date(o.startDate),
    endDate: date(o.endDate),
    banner: {
      enabled: b.enabled === true,
      text: texte(b.text, ''),
      link: texte(b.link, ''),
      bgColor: bannerBg,
      textColor: bannerTexte,
    },
  }
}

/** Aujourd'hui au format 'AAAA-MM-JJ', en heure locale (pas UTC). */
export function aujourdhui(now: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`
}

/**
 * La popup doit-elle vivre aujourd'hui ?
 *
 * Activée, un titre à afficher, et dans sa fenêtre de dates si elle en a une.
 * Comparer des chaînes 'AAAA-MM-JJ' suffit et évite les pièges de fuseau : la
 * gérante raisonne en jours, pas en instants.
 */
export function isPopupLive(s: MarketingSettings, now: Date = new Date()): boolean {
  if (!s.enabled) return false
  if (!s.title.trim() && !s.description.trim()) return false
  const jour = aujourdhui(now)
  if (s.startDate && jour < s.startDate) return false
  if (s.endDate && jour > s.endDate) return false
  return true
}

/** La bannière doit-elle s'afficher ? (mêmes dates que la popup) */
export function isBannerLive(s: MarketingSettings, now: Date = new Date()): boolean {
  if (!s.banner.enabled || !s.banner.text.trim()) return false
  const jour = aujourdhui(now)
  if (s.startDate && jour < s.startDate) return false
  if (s.endDate && jour > s.endDate) return false
  return true
}

/**
 * Explication en français de ce qui empêche la popup de s'afficher, ou `null`
 * si elle est bien en ligne. C'est ce qui manquait à l'admin : rien ne disait
 * pourquoi une popup enregistrée restait invisible sur le site.
 */
export function raisonNonAffichage(s: MarketingSettings, now: Date = new Date()): string | null {
  if (!s.enabled) return 'La popup est désactivée : personne ne la voit.'
  if (!s.title.trim() && !s.description.trim()) {
    return 'Ni titre ni texte : la popup ne s\'affichera pas tant qu\'elle est vide.'
  }
  const jour = aujourdhui(now)
  if (s.startDate && jour < s.startDate) {
    return `Programmée : elle apparaîtra à partir du ${formatJour(s.startDate)}.`
  }
  if (s.endDate && jour > s.endDate) {
    return `Terminée : sa diffusion s'est arrêtée le ${formatJour(s.endDate)}.`
  }
  return null
}

/** 'AAAA-MM-JJ' → '12 mars 2026'. */
export function formatJour(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso
  const [a, m, j] = iso.split('-').map(Number)
  return new Date(a, m - 1, j).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Un lien saisi par la gérante peut être « arti.fr », « /contact » ou vide.
 * On ne veut ni lien mort ni `javascript:` ; un lien externe part dans un
 * nouvel onglet.
 */
export function lienSur(href: string): { href: string; externe: boolean } | null {
  const v = (href || '').trim()
  if (!v || v === '#') return null
  if (/^(https?:|mailto:|tel:)/i.test(v)) return { href: v, externe: /^https?:/i.test(v) }
  if (v.startsWith('/')) return { href: v, externe: false }
  if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(v)) return { href: `https://${v}`, externe: true }
  return null
}
