/**
 * Apparence de la carte cadeau — type partagé client/serveur.
 *
 * Ce fichier ne dépend d'AUCUN module serveur (db, crypto, stripe…) : il peut
 * donc être importé aussi bien côté admin/front (composants client) que dans
 * les routes API et la couche métier, sans tirer de code serveur dans le bundle.
 *
 * Le modèle est volontairement simple : un fond uploadable + des réglages de
 * lisibilité. Les champs dynamiques (montant, destinataire, message, code) sont
 * rendus automatiquement par-dessus (pas d'éditeur de positionnement).
 */

export type GiftCardDesign = {
  /** URL du fond personnalisé (image uploadée). `null` = fond ARTI par défaut. */
  backgroundUrl: string | null
  /** Couleur du texte rendu par-dessus le fond, en hex (#rrggbb). */
  textColor: string
  /** Voile de lisibilité (0–80 %) appliqué sur le fond pour garder le texte lisible. */
  scrim: number
  /** Petit intitulé affiché sur la carte (ex. « Carte cadeau »). */
  heading: string
}

export const GIFT_CARD_DESIGN_DEFAULT: GiftCardDesign = {
  backgroundUrl: null,
  textColor: '#ffffff',
  scrim: 0,
  heading: 'Carte cadeau',
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/

/** Normalise une couleur : mappe les anciennes valeurs light/dark, valide le hex. */
function normalizeColor(v: unknown): string {
  if (v === 'light') return '#ffffff'
  if (v === 'dark') return '#1f2421'
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase()
    if (HEX_RE.test(s)) return s
  }
  return GIFT_CARD_DESIGN_DEFAULT.textColor
}

/** Borne et normalise un design partiel reçu (API/admin) en design complet et sûr. */
export function normalizeGiftCardDesign(input: Partial<GiftCardDesign> | null | undefined): GiftCardDesign {
  const d = input || {}
  return {
    backgroundUrl: typeof d.backgroundUrl === 'string' && d.backgroundUrl ? d.backgroundUrl : null,
    textColor: normalizeColor(d.textColor),
    scrim: Math.max(0, Math.min(80, Math.round(Number(d.scrim) || 0))),
    heading: (typeof d.heading === 'string' ? d.heading : GIFT_CARD_DESIGN_DEFAULT.heading).slice(0, 60),
  }
}

/** Convertit un hex #rrggbb en composantes rgb. */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const m = /^#?([0-9a-fA-F]{6})$/.exec((hex || '').trim())
  const n = m ? parseInt(m[1], 16) : 0xffffff
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

/** Vrai si la couleur est « claire » (luminance perçue élevée) — sert au voile et au logo. */
export function isLightColor(hex: string): boolean {
  const { r, g, b } = hexToRgb(hex)
  return 0.299 * r + 0.587 * g + 0.114 * b > 140
}
