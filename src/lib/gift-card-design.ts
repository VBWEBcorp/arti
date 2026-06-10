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
  /** Couleur du texte rendu par-dessus le fond. */
  textColor: 'light' | 'dark'
  /** Voile de lisibilité (0–80 %) appliqué sur le fond pour garder le texte lisible. */
  scrim: number
  /** Petit intitulé affiché sur la carte (ex. « Carte cadeau »). */
  heading: string
}

export const GIFT_CARD_DESIGN_DEFAULT: GiftCardDesign = {
  backgroundUrl: null,
  textColor: 'light',
  scrim: 0,
  heading: 'Carte cadeau',
}

/** Borne et normalise un design partiel reçu (API/admin) en design complet et sûr. */
export function normalizeGiftCardDesign(input: Partial<GiftCardDesign> | null | undefined): GiftCardDesign {
  const d = input || {}
  return {
    backgroundUrl: typeof d.backgroundUrl === 'string' && d.backgroundUrl ? d.backgroundUrl : null,
    textColor: d.textColor === 'dark' ? 'dark' : 'light',
    scrim: Math.max(0, Math.min(80, Math.round(Number(d.scrim) || 0))),
    heading: (typeof d.heading === 'string' ? d.heading : GIFT_CARD_DESIGN_DEFAULT.heading).slice(0, 60),
  }
}
