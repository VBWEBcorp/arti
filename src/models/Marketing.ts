import mongoose, { Schema, Document } from 'mongoose'

import { DEFAULT_MARKETING, type PopupFrequency, type PopupLayout } from '@/lib/marketing'

/**
 * Réglages du popup marketing et du bandeau d'annonce (un seul document).
 *
 * La forme des données et les valeurs par défaut viennent de `src/lib/marketing.ts`,
 * partagé avec le site public et l'espace admin : impossible d'ajouter un champ
 * ici sans que l'aperçu de l'admin le connaisse.
 */
export interface IMarketingPopup extends Document {
  enabled: boolean
  title: string
  description: string
  buttonText: string
  buttonLink: string
  imageUrl?: string
  logoUrl?: string
  bgColor: string
  textColor: string
  buttonColor: string
  /** Secondes avant l'apparition de la popup. */
  delay: number
  layout: PopupLayout
  frequency: PopupFrequency
  /** '' ou 'AAAA-MM-JJ' — fenêtre de diffusion, bornes incluses. */
  startDate: string
  endDate: string
  banner?: {
    enabled: boolean
    text: string
    link?: string
    bgColor: string
    textColor: string
  }
  updatedAt: Date
}

const d = DEFAULT_MARKETING

const MarketingPopupSchema = new Schema<IMarketingPopup>(
  {
    enabled: { type: Boolean, default: d.enabled },
    title: { type: String, default: d.title },
    description: { type: String, default: d.description },
    buttonText: { type: String, default: d.buttonText },
    buttonLink: { type: String, default: d.buttonLink },
    imageUrl: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    bgColor: { type: String, default: d.bgColor },
    textColor: { type: String, default: d.textColor },
    buttonColor: { type: String, default: d.buttonColor },
    delay: { type: Number, default: d.delay },
    layout: { type: String, enum: ['centre', 'coin'], default: d.layout },
    frequency: { type: String, enum: ['session', 'jour', 'toujours'], default: d.frequency },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    banner: {
      enabled: { type: Boolean, default: d.banner.enabled },
      text: { type: String, default: d.banner.text },
      link: { type: String, default: d.banner.link },
      bgColor: { type: String, default: d.banner.bgColor },
      textColor: { type: String, default: d.banner.textColor },
    },
  },
  {
    timestamps: true,
  }
)

export const MarketingPopup = mongoose.models.MarketingPopup ||
  mongoose.model<IMarketingPopup>('MarketingPopup', MarketingPopupSchema)
