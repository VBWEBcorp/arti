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

/** Montants proposés à l'achat en ligne (alignés sur la vraie boutique : 15 → 50 €). */
export const GIFT_CARD_PRESETS = [15, 20, 25, 30, 40, 50] as const
export const MIN_AMOUNT = 5
export const MAX_AMOUNT = 500

/** Validité par défaut des cartes cadeaux : 1 an à compter de maintenant. */
function oneYearFromNow(): Date {
  const d = new Date()
  d.setFullYear(d.getFullYear() + 1)
  return d
}

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
    // Carte à usage unique, valable 1 an : expiration par défaut à +1 an.
    expiresAt: data.expiresAt || oneYearFromNow(),
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

/**
 * Utilisation sur place (staff). Carte à USAGE UNIQUE : elle est consommée en
 * entier d'un coup (pas de débit partiel ni de solde réutilisable).
 * Le passage actif -> utilisé est atomique (filtre `status: 'active'`) pour
 * empêcher une double utilisation concurrente.
 */
export async function redeemOnSite(
  code: string,
  staffUser: { id: string; name: string },
  description: string | null = null
): Promise<IGiftCard> {
  await connectDB()
  const normalized = code.toUpperCase().trim()

  const card = await GiftCard.findOne({ code: normalized })
  if (!card) throw new GiftCardError('Carte cadeau introuvable', 404)

  // Auto-expiration avant utilisation.
  if (card.status === 'active' && card.expiresAt && card.expiresAt < new Date()) {
    card.status = 'expired'
    await card.save()
  }
  if (card.status !== 'active') {
    const label =
      card.status === 'used' ? 'déjà utilisée' : card.status === 'expired' ? 'expirée' : 'annulée'
    throw new GiftCardError(`Cette carte cadeau est ${label}`)
  }

  const value = card.balance

  // Flip atomique actif -> utilisé : seule la 1re requête concurrente gagne.
  const giftCard = await GiftCard.findOneAndUpdate(
    { _id: card._id, status: 'active' },
    {
      $set: { status: 'used', balance: 0 },
      $push: {
        transactions: {
          type: 'redemption_on_site',
          amount: value,
          balanceAfter: 0,
          description: description || 'Utilisation sur place (usage unique)',
          performedBy: { userId: objectIdOrNull(staffUser.id), name: staffUser.name },
          createdAt: new Date(),
        },
      },
    },
    { returnDocument: 'after' }
  )

  if (!giftCard) throw new GiftCardError('Cette carte cadeau vient d\'être utilisée')

  console.log(`[giftcard] utilisée (usage unique) ${giftCard.code} — ${value}€`)
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

/**
 * Réactive une carte annulée par erreur. Restaure le solde qui avait été annulé
 * (montant de la dernière annulation) : carte de nouveau active si ce solde est
 * positif, sinon remise dans l'état « utilisée ».
 */
export async function reactivateGiftCard(
  id: string,
  adminUser: { id: string; name: string }
): Promise<IGiftCard> {
  await connectDB()
  const giftCard = await GiftCard.findById(id)
  if (!giftCard) throw new GiftCardError('Carte cadeau introuvable', 404)
  if (giftCard.status !== 'cancelled') {
    throw new GiftCardError('Seule une carte annulée peut être réactivée')
  }

  // Solde restauré = montant voilé par la dernière annulation (sinon valeur initiale).
  const lastCancel = [...giftCard.transactions].reverse().find((t) => t.type === 'cancellation')
  const restored = lastCancel ? lastCancel.amount : giftCard.initialAmount

  giftCard.balance = restored
  giftCard.status = restored > 0 ? 'active' : 'used'
  giftCard.transactions.push({
    type: 'reactivation',
    amount: restored,
    balanceAfter: restored,
    description: 'Réactivation (annulation corrigée)',
    performedBy: { userId: objectIdOrNull(adminUser.id), name: adminUser.name },
    createdAt: new Date(),
  })
  await giftCard.save()

  console.log(`[giftcard] réactivée ${giftCard.code} par ${adminUser?.name} — ${restored}€`)
  return giftCard
}

/**
 * Suppression définitive d'une carte (contrairement à l'annulation, qui est
 * réversible). La carte est effacée de la base : action irréversible, réservée
 * à l'admin (nettoyage, cartes de test…).
 */
export async function deleteGiftCard(id: string): Promise<void> {
  await connectDB()
  if (!mongoose.isValidObjectId(id)) throw new GiftCardError('Carte cadeau introuvable', 404)
  const deleted = await GiftCard.findByIdAndDelete(id)
  if (!deleted) throw new GiftCardError('Carte cadeau introuvable', 404)
  console.log(`[giftcard] supprimée définitivement ${deleted.code}`)
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

  try {
    // expiresAt non fourni : createGiftCard applique la validité 1 an par défaut.
    return await createGiftCard({
      initialAmount: data.amount,
      source: 'online',
      purchasedBy: data.purchaser || {},
      recipient: data.recipient || {},
      stripePaymentIntentId,
      stripeReceiptUrl: verification.receiptUrl,
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

  // Email en tableaux (robuste sur tous les clients, Outlook compris) et sans
  // image externe (fragile en mail). La carte illustrée reste en pièce jointe PDF.
  const validity = giftCard.expiresAt ? ` &middot; valable jusqu'au ${frDate(giftCard.expiresAt)}` : ''
  const year = new Date().getFullYear()
  const messageBlock = giftCard.recipient?.message
    ? `<tr><td style="padding:22px 32px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td width="3" style="width:3px;background:#7d8a6f;"></td>
          <td style="padding:2px 0 2px 16px;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:15px;line-height:1.6;color:#5a5f5b;">&laquo;&nbsp;${escapeHtml(giftCard.recipient.message)}&nbsp;&raquo;</td>
        </tr></table>
      </td></tr>`
    : ''

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light">
</head>
<body style="margin:0;padding:0;background:#f1efe9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1efe9;">
    <tr><td align="center" style="padding:28px 14px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:560px;max-width:100%;background:#ffffff;border-radius:16px;overflow:hidden;">

        <!-- En-tête -->
        <tr><td style="background:#7d8a6f;padding:34px 28px;text-align:center;">
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:36px;line-height:1;letter-spacing:9px;color:#ffffff;">ARTI</div>
          <div style="margin-top:10px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#e7ece1;">Carte cadeau &middot; Café céramique</div>
        </td></tr>

        <!-- Intro -->
        <tr><td style="padding:34px 32px 4px;">
          <h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:25px;line-height:1.25;color:#1f2421;">${title}</h1>
          <p style="margin:0;font-size:15px;line-height:1.7;color:#4a4f4a;">${intro}</p>
        </td></tr>

        <!-- Voucher -->
        <tr><td style="padding:24px 32px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf9f6;border:1px solid #e6e3dc;border-radius:14px;">
            <tr><td style="padding:26px 24px;text-align:center;">
              <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#9a9f96;">Code de la carte</div>
              <div style="margin-top:9px;font-family:'Courier New',Courier,monospace;font-size:25px;font-weight:700;letter-spacing:3px;color:#1f2421;">${giftCard.code}</div>
              <div style="margin:18px auto;height:1px;width:54px;background:#e0ddd4;line-height:1px;font-size:0;">&nbsp;</div>
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1;color:#5f6b53;">${eur(giftCard.initialAmount)}</div>
              <div style="margin-top:12px;font-size:12px;color:#9a9f96;">Carte à usage unique${validity}</div>
            </td></tr>
          </table>
        </td></tr>

        ${messageBlock}

        <!-- Mode d'emploi -->
        <tr><td style="padding:24px 32px 4px;">
          <p style="margin:0;font-size:13px;line-height:1.7;color:#7a7f78;">
            La carte complète est jointe à cet email au format PDF. Présentez ce code lors de votre venue à l'atelier ARTI.
          </p>
        </td></tr>

        <!-- Pied de page -->
        <tr><td style="padding:26px 32px 32px;">
          <div style="border-top:1px solid #f0eee9;padding-top:20px;text-align:center;">
            <div style="font-size:12px;line-height:1.7;color:#a7aaa4;">
              ARTI &middot; Café céramique<br>
              10 r. Poullain Duparc, 35000 Rennes &middot; hello@articafeceramique.fr
            </div>
            <div style="margin-top:8px;font-size:11px;color:#c2c4bf;">&copy; ${year} ARTI. Tous droits réservés.</div>
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
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
        intro: `${escapeHtml(giftCard.purchasedBy?.name || 'Une personne')} vous offre une carte cadeau ARTI d'un montant de ${eur(giftCard.initialAmount)}. Votre carte (numéro et date de validité) est en pièce jointe au format PDF.`,
        giftCard,
      }),
      attachments,
      replyTo: giftCard.purchasedBy?.email || undefined,
    })
  }

  giftCard.emailSent = true
  await giftCard.save()
}
