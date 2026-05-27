import crypto from 'crypto'

import { connectDB } from '@/lib/db'
import { GiftCard, type IGiftCard, type GiftCardSource } from '@/models/GiftCard'
import { verifyGiftCardPayment } from '@/lib/stripe'

/** Erreur métier avec code HTTP (mappée par les API routes). */
export class GiftCardError extends Error {
  statusCode: number
  constructor(message: string, statusCode = 400) {
    super(message)
    this.name = 'GiftCardError'
    this.statusCode = statusCode
  }
}

/** Montants proposés à l'achat en ligne (alignés sur la vraie boutique : 10 → 100 €). */
export const GIFT_CARD_PRESETS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const
export const MIN_AMOUNT = 5
export const MAX_AMOUNT = 500

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Génère un code (format GC-XXXX-XXXX), sans I/O/0/1 pour la lisibilité. */
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = crypto.randomBytes(8)
  const part = (offset: number) =>
    Array.from({ length: 4 }, (_, i) => chars[bytes[offset + i] % chars.length]).join('')
  return `GC-${part(0)}-${part(4)}`
}

async function generateUniqueCode(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = generateCode()
    const exists = await GiftCard.findOne({ code })
    if (!exists) return code
  }
  throw new Error('Impossible de générer un code unique après 10 tentatives')
}

function sourceDescription(source: GiftCardSource): string {
  const labels: Record<GiftCardSource, string> = {
    admin: 'Création manuelle par admin',
    online: 'Achat en ligne',
    on_site: 'Vente sur place',
    avoir: 'Avoir client',
    employee_benefit: 'Avantage employé',
  }
  return labels[source] || 'Création manuelle par admin'
}

type CreateData = {
  initialAmount: number
  source?: GiftCardSource
  purchasedBy?: { userId?: string | null; email?: string; name?: string }
  recipient?: { name?: string; email?: string; message?: string }
  stripePaymentIntentId?: string | null
  stripeReceiptUrl?: string | null
  expiresAt?: Date | null
  adminName?: string | null
}

export async function createGiftCard(data: CreateData, adminId: string | null = null): Promise<IGiftCard> {
  await connectDB()
  const code = await generateUniqueCode()
  const source: GiftCardSource = data.source || (adminId ? 'admin' : 'online')

  const giftCard = await GiftCard.create({
    code,
    initialAmount: data.initialAmount,
    balance: data.initialAmount,
    currency: 'EUR',
    status: 'active',
    purchasedBy: data.purchasedBy || {},
    recipient: data.recipient || {},
    stripePaymentIntentId: data.stripePaymentIntentId || null,
    stripeReceiptUrl: data.stripeReceiptUrl || null,
    expiresAt: data.expiresAt || null,
    source,
    createdByAdmin: adminId || null,
    transactions: [
      {
        type: 'purchase',
        amount: data.initialAmount,
        balanceAfter: data.initialAmount,
        description: sourceDescription(source),
        performedBy: adminId ? { userId: adminId, name: data.adminName || null } : undefined,
      },
    ],
  })

  // Emails (acheteur + destinataire) — stub : à brancher sur un vrai service mail.
  try {
    await sendGiftCardEmails(giftCard)
  } catch (err) {
    console.error('[giftcard] envoi emails échoué', (err as Error).message)
  }

  console.log(`[giftcard] créée ${code} — ${data.initialAmount}€ (source: ${source})`)
  return giftCard
}

export async function getAllGiftCards(
  filters: { status?: string; search?: string } = {},
  pagination: { page?: number | string; limit?: number | string } = {}
) {
  await connectDB()
  const page = parseInt(String(pagination.page)) || 1
  const limit = parseInt(String(pagination.limit)) || 20
  const skip = (page - 1) * limit

  const query: Record<string, unknown> = {}
  if (filters.status) query.status = filters.status
  if (filters.search) {
    const escaped = escapeRegex(filters.search)
    query.$or = [
      { code: { $regex: escaped, $options: 'i' } },
      { 'purchasedBy.email': { $regex: escaped, $options: 'i' } },
      { 'recipient.email': { $regex: escaped, $options: 'i' } },
      { 'recipient.name': { $regex: escaped, $options: 'i' } },
    ]
  }

  const [giftCards, total] = await Promise.all([
    GiftCard.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    GiftCard.countDocuments(query),
  ])

  return {
    giftCards,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  }
}

export async function getGiftCardById(id: string): Promise<IGiftCard> {
  await connectDB()
  const giftCard = await GiftCard.findById(id)
  if (!giftCard) throw new GiftCardError('Carte cadeau introuvable', 404)
  return giftCard
}

export async function checkBalance(code: string) {
  await connectDB()
  const giftCard = await GiftCard.findOne({ code: code.toUpperCase().trim() })
  if (!giftCard) throw new GiftCardError('Carte cadeau introuvable', 404)

  // Auto-expiration
  if (giftCard.expiresAt && giftCard.expiresAt < new Date() && giftCard.status === 'active') {
    giftCard.status = 'expired'
    await giftCard.save()
  }

  if (giftCard.status !== 'active') {
    const label =
      giftCard.status === 'used' ? 'épuisée' : giftCard.status === 'expired' ? 'expirée' : 'annulée'
    throw new GiftCardError(`Cette carte cadeau est ${label}`)
  }

  return {
    code: giftCard.code,
    balance: giftCard.balance,
    status: giftCard.status,
    expiresAt: giftCard.expiresAt,
  }
}

/** Rédemption sur place (staff). Déduction atomique pour éviter les race conditions. */
export async function redeemOnSite(
  code: string,
  amount: number,
  staffUser: { id: string; name: string },
  description: string | null = null
): Promise<IGiftCard> {
  await connectDB()
  const roundedAmount = Math.round(amount * 100) / 100

  const giftCard = await GiftCard.findOneAndUpdate(
    { code: code.toUpperCase().trim(), status: 'active', balance: { $gte: roundedAmount } },
    { $inc: { balance: -roundedAmount } },
    { new: true }
  )

  if (!giftCard) {
    throw new GiftCardError('Carte cadeau introuvable, inactive ou solde insuffisant')
  }

  giftCard.transactions.push({
    type: 'redemption_on_site',
    amount: roundedAmount,
    balanceAfter: giftCard.balance,
    description: description || 'Utilisation sur place',
    performedBy: { userId: staffUser.id, name: staffUser.name },
    createdAt: new Date(),
  })

  if (giftCard.balance === 0) giftCard.status = 'used'
  await giftCard.save()

  console.log(`[giftcard] utilisée sur place ${giftCard.code} — ${roundedAmount}€, reste ${giftCard.balance}€`)
  return giftCard
}

export async function cancelGiftCard(
  id: string,
  adminUser: { id: string; name: string }
): Promise<IGiftCard> {
  await connectDB()
  const giftCard = await GiftCard.findById(id)
  if (!giftCard) throw new GiftCardError('Carte cadeau introuvable', 404)
  if (giftCard.status === 'cancelled') throw new GiftCardError('Cette carte cadeau est déjà annulée')

  giftCard.status = 'cancelled'
  giftCard.transactions.push({
    type: 'cancellation',
    amount: giftCard.balance,
    balanceAfter: 0,
    description: 'Annulation par admin',
    performedBy: adminUser ? { userId: adminUser.id, name: adminUser.name } : undefined,
    createdAt: new Date(),
  })
  giftCard.balance = 0
  await giftCard.save()

  console.log(`[giftcard] annulée ${giftCard.code} par ${adminUser?.name}`)
  return giftCard
}

type PurchaseData = {
  amount: number
  purchaser?: { name?: string; email?: string; userId?: string | null }
  recipient?: { name?: string; email?: string; message?: string }
}

/** Achat en ligne : vérifie le paiement Stripe (ou mode test) puis crée la carte. */
export async function purchaseGiftCard(
  data: PurchaseData,
  stripePaymentIntentId: string
): Promise<IGiftCard> {
  await connectDB()

  // Anti-doublon : un PaymentIntent ne crée qu'une seule carte.
  const existing = await GiftCard.findOne({ stripePaymentIntentId })
  if (existing) throw new GiftCardError('Ce paiement a déjà été utilisé pour une carte cadeau')

  const verification = await verifyGiftCardPayment(stripePaymentIntentId, data.amount)
  if (!verification.ok) {
    throw new GiftCardError(verification.reason || "Le paiement n'a pas pu être vérifié", 402)
  }

  return createGiftCard({
    initialAmount: data.amount,
    source: 'online',
    purchasedBy: data.purchaser || {},
    recipient: data.recipient || {},
    stripePaymentIntentId,
    stripeReceiptUrl: verification.receiptUrl,
  })
}

/** Envoi des emails — STUB. Remplacer par un vrai service (Resend, Nodemailer, etc.). */
async function sendGiftCardEmails(giftCard: IGiftCard): Promise<void> {
  if (giftCard.purchasedBy?.email) {
    console.log(`[giftcard][email] confirmation achat → ${giftCard.purchasedBy.email} (code ${giftCard.code})`)
  }
  if (giftCard.recipient?.email) {
    console.log(`[giftcard][email] notification destinataire → ${giftCard.recipient.email} (code ${giftCard.code})`)
  }
  giftCard.emailSent = true
  await giftCard.save()
}
