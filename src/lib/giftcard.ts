import crypto from 'crypto'

import { connectDB } from '@/lib/db'
import { GiftCard, type IGiftCard, type GiftCardSource } from '@/models/GiftCard'
import { verifyGiftCardPayment } from '@/lib/stripe'
import { sendEmail } from '@/lib/resend'

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

function eur(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)
}

function giftCardEmailHtml(opts: { title: string; intro: string; giftCard: IGiftCard }): string {
  const { title, intro, giftCard } = opts
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f6f5f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;">
    <div style="padding:32px 28px 16px;text-align:center;border-bottom:1px solid #f0eee9;">
      <h1 style="margin:0;font-size:20px;color:#1f2421;">ARTI</h1>
    </div>
    <div style="padding:28px;color:#3a3f3b;font-size:15px;line-height:1.7;">
      <h2 style="margin:0 0 14px;font-size:22px;color:#1f2421;">${title}</h2>
      <p style="margin:0 0 18px;">${intro}</p>
      <div style="border:1px solid #e6e3dc;border-radius:12px;padding:20px;text-align:center;background:#faf9f6;">
        <p style="margin:0 0 6px;font-size:13px;color:#8a8f88;text-transform:uppercase;letter-spacing:.08em;">Code de la carte</p>
        <p style="margin:0 0 14px;font-size:24px;font-weight:700;letter-spacing:.1em;color:#1f2421;font-family:monospace;">${giftCard.code}</p>
        <p style="margin:0;font-size:15px;color:#3a3f3b;">Montant : <strong>${eur(giftCard.initialAmount)}</strong></p>
      </div>
      ${giftCard.recipient?.message ? `<p style="margin:18px 0 0;font-style:italic;color:#5a5f5b;">« ${giftCard.recipient.message} »</p>` : ''}
    </div>
    <div style="padding:22px 28px;text-align:center;border-top:1px solid #f0eee9;color:#a7aaa4;font-size:12px;">
      <p style="margin:0;">&copy; ${new Date().getFullYear()} ARTI. Tous droits réservés.</p>
    </div>
  </div>
</body>
</html>`
}

/** Envoi des emails de carte cadeau (acheteur + destinataire) via Resend. */
async function sendGiftCardEmails(giftCard: IGiftCard): Promise<void> {
  if (giftCard.purchasedBy?.email) {
    await sendEmail({
      to: giftCard.purchasedBy.email,
      subject: `Votre carte cadeau ARTI — ${eur(giftCard.initialAmount)}`,
      html: giftCardEmailHtml({
        title: 'Merci pour votre achat',
        intro: `Voici votre carte cadeau d'un montant de ${eur(giftCard.initialAmount)}. Conservez précieusement le code ci-dessous.`,
        giftCard,
      }),
    })
  }

  if (giftCard.recipient?.email) {
    await sendEmail({
      to: giftCard.recipient.email,
      subject: `${giftCard.purchasedBy?.name || 'Quelqu\'un'} vous offre une carte cadeau ARTI`,
      html: giftCardEmailHtml({
        title: 'Vous avez reçu une carte cadeau !',
        intro: `${giftCard.purchasedBy?.name || 'Une personne'} vous offre une carte cadeau ARTI d'un montant de ${eur(giftCard.initialAmount)}.`,
        giftCard,
      }),
      replyTo: giftCard.purchasedBy?.email || undefined,
    })
  }

  giftCard.emailSent = true
  await giftCard.save()
}
