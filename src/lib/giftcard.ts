import crypto from 'crypto'
import mongoose from 'mongoose'

import { connectDB } from '@/lib/db'
import { GiftCard, type IGiftCard, type GiftCardSource } from '@/models/GiftCard'
import { verifyGiftCardPayment } from '@/lib/stripe'
import { sendEmail, type EmailAttachment } from '@/lib/resend'
import { renderGiftCardPdf } from '@/lib/gift-card-pdf'

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

/**
 * Renvoie l'id s'il est un ObjectId valide, sinon `null`.
 * L'admin connecté via variables d'environnement a un userId non-ObjectId
 * (ex. "admin") : on ne peut donc pas le stocker dans un champ ObjectId. Le nom
 * lisible (email) est conservé à part dans `name`.
 */
function objectIdOrNull(id: string | null | undefined): string | null {
  return id && mongoose.isValidObjectId(id) ? id : null
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
  /** Fond propre à cette carte (override de l'image globale). */
  imageUrl?: string | null
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
    imageUrl: data.imageUrl || null,
    stripePaymentIntentId: data.stripePaymentIntentId || null,
    stripeReceiptUrl: data.stripeReceiptUrl || null,
    expiresAt: data.expiresAt || null,
    source,
    createdByAdmin: objectIdOrNull(adminId),
    transactions: [
      {
        type: 'purchase',
        amount: data.initialAmount,
        balanceAfter: data.initialAmount,
        description: sourceDescription(source),
        performedBy: adminId ? { userId: objectIdOrNull(adminId), name: data.adminName || null } : undefined,
      },
    ],
  })

  // Emails (acheteur + destinataire) via Resend. Échec non bloquant : une carte
  // créée ne doit jamais être perdue parce qu'un email n'est pas parti.
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
    performedBy: { userId: objectIdOrNull(staffUser.id), name: staffUser.name },
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
    performedBy: adminUser ? { userId: objectIdOrNull(adminUser.id), name: adminUser.name } : undefined,
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

  // Idempotence : un PaymentIntent ne crée qu'une seule carte. Si elle existe
  // déjà (re-soumission, retry réseau, ou plus tard un webhook qui aurait
  // devancé le client), on renvoie la carte existante au lieu d'échouer.
  const existing = await GiftCard.findOne({ stripePaymentIntentId })
  if (existing) return existing

  const verification = await verifyGiftCardPayment(stripePaymentIntentId, data.amount)
  if (!verification.ok) {
    throw new GiftCardError(verification.reason || "Le paiement n'a pas pu être vérifié", 402)
  }

  // Carte achetée en ligne : valable 1 an à compter de l'achat.
  const expiresAt = new Date()
  expiresAt.setFullYear(expiresAt.getFullYear() + 1)

  try {
    return await createGiftCard({
      initialAmount: data.amount,
      source: 'online',
      purchasedBy: data.purchaser || {},
      recipient: data.recipient || {},
      stripePaymentIntentId,
      stripeReceiptUrl: verification.receiptUrl,
      expiresAt,
    })
  } catch (err) {
    // Course entre deux requêtes concurrentes : l'index unique a bloqué la
    // seconde insertion (E11000). On renvoie alors la carte gagnante.
    if ((err as { code?: number }).code === 11000) {
      const winner = await GiftCard.findOne({ stripePaymentIntentId })
      if (winner) return winner
    }
    throw err
  }
}

function eur(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)
}

function frDate(d: Date): string {
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(d)
  )
}

function giftCardEmailHtml(opts: {
  title: string
  intro: string
  giftCard: IGiftCard
}): string {
  const { title, intro, giftCard } = opts

  // La carte est jointe à l'email en image (PNG, fond + texte + code gravés).
  // On ne l'affiche pas dans le corps : Gmail ne rend pas les images inline CID
  // (icône cassée). Le corps reste donc en texte (toujours lisible, dark mode
  // compris) et la jolie carte est en pièce jointe téléchargeable.

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<style>:root{color-scheme:light dark;supported-color-schemes:light dark;}</style>
</head>
<body style="margin:0;padding:0;background:#f6f5f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;">
    <div style="padding:32px 28px 16px;text-align:center;border-bottom:1px solid #f0eee9;">
      <h1 style="margin:0;font-size:20px;color:#1f2421;">ARTI</h1>
    </div>
    <div style="padding:28px;color:#3a3f3b;font-size:15px;line-height:1.7;">
      <h2 style="margin:0 0 14px;font-size:22px;color:#1f2421;">${title}</h2>
      <p style="margin:0 0 18px;">${intro}</p>
      <div style="border:1px solid #e6e3dc;border-radius:12px;padding:16px;text-align:center;background:#faf9f6;">
        <p style="margin:0 0 4px;font-size:13px;color:#8a8f88;text-transform:uppercase;letter-spacing:.08em;">Code de la carte</p>
        <p style="margin:0;font-size:22px;font-weight:700;letter-spacing:.1em;color:#1f2421;font-family:monospace;">${giftCard.code}</p>
        <p style="margin:8px 0 0;font-size:14px;color:#3a3f3b;">Montant : <strong>${eur(giftCard.initialAmount)}</strong></p>
        ${giftCard.expiresAt ? `<p style="margin:6px 0 0;font-size:13px;color:#8a8f88;">Valable jusqu'au ${frDate(giftCard.expiresAt)}</p>` : ''}
      </div>
      ${giftCard.recipient?.message ? `<p style="margin:18px 0 0;font-style:italic;color:#5a5f5b;">« ${escapeHtml(giftCard.recipient.message)} »</p>` : ''}
    </div>
    <div style="padding:22px 28px;text-align:center;border-top:1px solid #f0eee9;color:#a7aaa4;font-size:12px;">
      <p style="margin:0;">&copy; ${new Date().getFullYear()} ARTI. Tous droits réservés.</p>
    </div>
  </div>
</body>
</html>`
}

/** Échappe le HTML pour éviter toute injection dans les emails (message, titre…). */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Envoi des emails de carte cadeau (acheteur + destinataire) via Resend. */
async function sendGiftCardEmails(giftCard: IGiftCard): Promise<void> {
  // On remplit le visuel officiel (PDF : recto illustré + verso avec numéro,
  // montant et date de validité) et on le joint à l'email. Échec de rendu non
  // bloquant : l'email part quand même avec le code et la validité en texte.
  let attachments: EmailAttachment[] | undefined
  try {
    const pdf = await renderGiftCardPdf({
      code: giftCard.code,
      amount: giftCard.initialAmount,
      expiresAt: giftCard.expiresAt,
      recipientName: giftCard.recipient?.name,
      message: giftCard.recipient?.message,
    })
    attachments = [
      {
        filename: `carte-cadeau-${giftCard.code}.pdf`,
        content: pdf.toString('base64'),
      },
    ]
  } catch (err) {
    console.error('[giftcard] rendu PDF carte échoué:', (err as Error).message)
  }

  if (giftCard.purchasedBy?.email) {
    await sendEmail({
      to: giftCard.purchasedBy.email,
      subject: `Votre carte cadeau ARTI — ${eur(giftCard.initialAmount)}`,
      html: giftCardEmailHtml({
        title: 'Merci pour votre achat',
        intro: `Voici votre carte cadeau d'un montant de ${eur(giftCard.initialAmount)}. Conservez précieusement le code ci-dessous. La carte complète (avec le numéro et la date de validité) est en pièce jointe au format PDF.`,
        giftCard,
      }),
      attachments,
    })
  }

  if (giftCard.recipient?.email) {
    await sendEmail({
      to: giftCard.recipient.email,
      subject: `${giftCard.purchasedBy?.name || 'Quelqu\'un'} vous offre une carte cadeau ARTI`,
      html: giftCardEmailHtml({
        title: 'Vous avez reçu une carte cadeau !',
        intro: `${giftCard.purchasedBy?.name || 'Une personne'} vous offre une carte cadeau ARTI d'un montant de ${eur(giftCard.initialAmount)}. Votre carte (numéro et date de validité) est en pièce jointe au format PDF.`,
        giftCard,
      }),
      attachments,
      replyTo: giftCard.purchasedBy?.email || undefined,
    })
  }

  giftCard.emailSent = true
  await giftCard.save()
}
