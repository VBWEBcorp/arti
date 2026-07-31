import mongoose, { Schema, Document } from 'mongoose'

export type GiftCardStatus = 'active' | 'used' | 'expired' | 'cancelled'
export type GiftCardSource = 'admin' | 'online' | 'on_site' | 'avoir' | 'employee_benefit'
export type GiftCardTxType =
  | 'purchase'
  | 'redemption'
  | 'redemption_on_site'
  | 'refund'
  | 'cancellation'
  | 'reactivation'

export interface IGiftCardTransaction {
  type: GiftCardTxType
  amount: number
  balanceAfter: number
  orderNumber?: string
  description?: string
  performedBy?: { userId?: mongoose.Types.ObjectId | string | null; name?: string | null }
  createdAt: Date
}

export interface IGiftCard extends Document {
  code: string
  initialAmount: number
  balance: number
  currency: string
  status: GiftCardStatus
  purchasedBy: { userId?: mongoose.Types.ObjectId | string | null; email?: string; name?: string; firstName?: string; lastName?: string }
  recipient: { name?: string; email?: string; message?: string; firstName?: string; lastName?: string }
  imageUrl?: string | null
  emailSent: boolean
  stripePaymentIntentId?: string | null
  stripeReceiptUrl?: string | null
  expiresAt?: Date | null
  transactions: IGiftCardTransaction[]
  source: GiftCardSource
  createdByAdmin?: mongoose.Types.ObjectId | string | null
  /** Corbeille : date de mise à la corbeille (soft delete). Non nul = supprimée mais récupérable. */
  deletedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

const GiftCardSchema = new Schema<IGiftCard>(
  {
    // Code unique de la carte (format court GC-XXXX)
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },

    initialAmount: { type: Number, required: true, min: 0 },
    balance: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'EUR', uppercase: true },

    status: {
      type: String,
      enum: ['active', 'used', 'expired', 'cancelled'],
      default: 'active',
    },

    purchasedBy: {
      userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
      email: String,
      // `name` = nom complet composé (« Prénom Nom ») conservé pour l'affichage
      // et la rétro-compatibilité ; prénom et nom sont aussi stockés séparément.
      name: String,
      firstName: String,
      lastName: String,
    },

    recipient: {
      name: String,
      email: String,
      message: String,
      firstName: String,
      lastName: String,
    },

    imageUrl: { type: String, default: null },
    emailSent: { type: Boolean, default: false },

    stripePaymentIntentId: { type: String, default: null },
    stripeReceiptUrl: { type: String, default: null },

    expiresAt: { type: Date, default: null },

    transactions: [
      {
        type: {
          type: String,
          enum: ['purchase', 'redemption', 'redemption_on_site', 'refund', 'cancellation', 'reactivation'],
          required: true,
        },
        amount: { type: Number, required: true },
        balanceAfter: { type: Number, required: true },
        orderNumber: String,
        description: String,
        performedBy: {
          userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
          name: { type: String, default: null },
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    source: {
      type: String,
      enum: ['admin', 'online', 'on_site', 'avoir', 'employee_benefit'],
      default: 'online',
    },

    createdByAdmin: { type: Schema.Types.ObjectId, ref: 'User', default: null },

    // Corbeille : suppression réversible (soft delete). Non nul = dans la corbeille.
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

// Index
GiftCardSchema.index({ status: 1 })
GiftCardSchema.index({ deletedAt: 1 })
GiftCardSchema.index({ 'purchasedBy.email': 1 })
GiftCardSchema.index({ expiresAt: 1 }, { sparse: true })
// Anti double-achat : un PaymentIntent ne crée qu'une seule carte cadeau.
// Index PARTIEL (et non `sparse`) : seules les valeurs string sont indexées.
// Un index sparse indexerait quand même les `null` explicites, ce qui ferait
// échouer la création de la 2e carte sans paiement (admin, avoir, sur place…)
// avec une collision « dup key: null ». Le filtre $type:'string' permet une
// infinité de cartes sans paiement tout en gardant l'unicité des vrais id.
GiftCardSchema.index(
  { stripePaymentIntentId: 1 },
  { unique: true, partialFilterExpression: { stripePaymentIntentId: { $type: 'string' } } }
)

export const GiftCard =
  mongoose.models.GiftCard || mongoose.model<IGiftCard>('GiftCard', GiftCardSchema)
