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

/** Montants proposés à l'achat en ligne (raccourcis). Au-delà, montant libre par tranches de 10 €. */
export const GIFT_CARD_PRESETS = [15, 20, 25, 30, 40, 50] as const
export const MIN_AMOUNT = 5
// Plafond haut pour autoriser des montants élevés (montant libre par pas de 10 € au-delà de 50 €).
export const MAX_AMOUNT = 5000

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

/** Génère un code court (format GC-XXXX), sans I/O/0/1 pour la lisibilité. */
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = crypto.randomBytes(4)
  const part = Array.from({ length: 4 }, (_, i) => chars[bytes[i] % chars.length]).join('')
  return `GC-${part}`
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
    // Valable 1 an (solde utilisable en plusieurs fois) : expiration par défaut à +1 an.
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

/**
 * Statistiques compta des cartes EXPIRÉES (date de validité dépassée), qui
 * restent honorées : total du montant initial et du solde restant, sur une
 * période optionnelle (filtre sur la date d'expiration). Exclut les cartes
 * déjà utilisées ou annulées (plus de valeur en circulation).
 */
export async function getExpiredStats(
  range: { from?: string | null; to?: string | null } = {}
) {
  await connectDB()
  const now = new Date()

  const expiresAt: Record<string, Date> = { $lt: now }
  if (range.from) {
    const d = new Date(range.from)
    if (!isNaN(d.getTime())) expiresAt.$gte = d
  }
  if (range.to) {
    const d = new Date(range.to)
    if (!isNaN(d.getTime())) {
      // Inclut toute la journée « to »
      d.setHours(23, 59, 59, 999)
      expiresAt.$lte = d
    }
  }

  const [agg] = await GiftCard.aggregate([
    { $match: { expiresAt, status: { $in: ['active', 'expired'] } } },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        totalInitial: { $sum: '$initialAmount' },
        totalRemaining: { $sum: '$balance' },
      },
    },
  ])

  return {
    count: agg?.count || 0,
    totalInitial: agg?.totalInitial || 0,
    totalRemaining: agg?.totalRemaining || 0,
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

  // Marque le statut « expirée » pour l'info / la compta, MAIS la carte reste
  // honorée (utilisable) : on ne bloque plus une carte simplement expirée.
  if (giftCard.expiresAt && giftCard.expiresAt < new Date() && giftCard.status === 'active') {
    giftCard.status = 'expired'
    await giftCard.save()
  }

  if (giftCard.status === 'used' || giftCard.status === 'cancelled') {
    const label = giftCard.status === 'used' ? 'épuisée' : 'annulée'
    throw new GiftCardError(`Cette carte cadeau est ${label}`)
  }

  // active OU expirée → solde renvoyé (carte toujours utilisable)
  return {
    code: giftCard.code,
    balance: giftCard.balance,
    status: giftCard.status,
    expiresAt: giftCard.expiresAt,
  }
}

/**
 * Utilisation sur place (staff) avec DÉBIT PARTIEL. La carte conserve son code ;
 * on retire le montant dépensé et le solde restant reste utilisable jusqu'à
 * épuisement (statut « épuisée » quand le solde atteint 0). Une carte expirée
 * reste honorée (utilisable en admin) et garde son statut « expirée » tant qu'il
 * reste du solde. Le débit est atomique (filtre sur le solde courant) pour
 * empêcher deux débits concurrents.
 */
export async function redeemOnSite(
  code: string,
  staffUser: { id: string; name: string },
  amount: number,
  description: string | null = null
): Promise<IGiftCard> {
  await connectDB()
  const normalized = code.toUpperCase().trim()

  const card = await GiftCard.findOne({ code: normalized })
  if (!card) throw new GiftCardError('Carte cadeau introuvable', 404)

  if (card.status === 'used') throw new GiftCardError('Cette carte cadeau est déjà épuisée')
  if (card.status === 'cancelled') throw new GiftCardError('Cette carte cadeau est annulée')
  // active OU expirée → utilisable

  const debit = Math.round(Number(amount) * 100) / 100
  if (!debit || debit <= 0) {
    throw new GiftCardError('Le montant à utiliser doit être supérieur à 0')
  }
  if (debit > card.balance) {
    throw new GiftCardError(`Le montant dépasse le solde disponible (${eur(card.balance)})`)
  }

  const newBalance = Math.round((card.balance - debit) * 100) / 100
  // Épuisée si plus de solde ; validité dépassée → « expirée » (mais toujours
  // utilisable) ; sinon « active ».
  const isExpired = !!(card.expiresAt && card.expiresAt < new Date())
  const newStatus = newBalance <= 0 ? 'used' : isExpired ? 'expired' : 'active'

  // Débit atomique : n'applique la mise à jour que si le solde n'a pas changé.
  const giftCard = await GiftCard.findOneAndUpdate(
    { _id: card._id, status: { $in: ['active', 'expired'] }, balance: card.balance },
    {
      $set: { status: newStatus, balance: newBalance },
      $push: {
        transactions: {
          type: 'redemption_on_site',
          amount: debit,
          balanceAfter: newBalance,
          description: description || `Utilisation de ${eur(debit)} sur place`,
          performedBy: { userId: objectIdOrNull(staffUser.id), name: staffUser.name },
          createdAt: new Date(),
        },
      },
    },
    { returnDocument: 'after' }
  )

  if (!giftCard) throw new GiftCardError('Le solde de la carte vient de changer, réessayez.')

  console.log(`[giftcard] débit ${debit}€ sur ${giftCard.code} → reste ${newBalance}€ (${newStatus})`)
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
  // Logo ARTI (version blanche) hébergé sur Cloudflare R2 : URL HTTPS publique,
  // fiable dans tous les clients mail (contrairement à l'image inline CID).
  const logoWhite = `${(process.env.R2_PUBLIC_URL || 'https://pub-b580b12891804986ab6624da7bf94078.r2.dev').replace(/\/+$/, '')}/brand/logo-arti-white.png`
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

        <!-- En-tête : vrai logo ARTI (blanc) seul, hébergé sur R2 -->
        <tr><td style="background:#7d8a6f;padding:36px 28px;text-align:center;">
          <img src="${logoWhite}" alt="ARTI" width="170" style="display:block;margin:0 auto;width:170px;max-width:62%;height:auto;">
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
              <div style="margin-top:12px;font-size:12px;color:#9a9f96;">Valable en une ou plusieurs fois${validity}</div>
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

        <!-- Mot de l'équipe -->
        <tr><td style="padding:20px 32px 0;">
          <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.7;color:#5f6b53;">
            Toute l'équipe d'ARTI vous remercie chaleureusement et a hâte de vous accueillir à l'atelier pour un moment créatif et gourmand&nbsp;! 🎨
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

/** Adresse de la boutique, prévenue à chaque nouvelle commande en ligne. */
const SHOP_EMAIL = process.env.CONTACT_EMAIL || 'hello@articafeceramique.fr'

/** Email interne de notification de vente (récap de la commande pour la boutique). */
function shopSaleHtml(giftCard: IGiftCard): string {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:7px 0;color:#7a7f78;font-size:13px;vertical-align:top;">${label}</td>` +
    `<td style="padding:7px 0;color:#1f2421;font-size:14px;font-weight:600;text-align:right;">${value}</td></tr>`
  const buyer = escapeHtml(giftCard.purchasedBy?.name || '—')
  const buyerEmail = escapeHtml(giftCard.purchasedBy?.email || '—')
  const recipient =
    giftCard.recipient?.name || giftCard.recipient?.email
      ? escapeHtml(
          `${giftCard.recipient?.name || ''}${
            giftCard.recipient?.email ? ` <${giftCard.recipient.email}>` : ''
          }`.trim()
        )
      : "L'acheteur lui-même"
  const message = giftCard.recipient?.message ? `« ${escapeHtml(giftCard.recipient.message)} »` : '—'
  const receipt = giftCard.stripeReceiptUrl
    ? `<p style="margin:18px 0 0;"><a href="${giftCard.stripeReceiptUrl}" style="color:#5f6b53;font-size:13px;">Voir le reçu Stripe →</a></p>`
    : ''

  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><meta name="color-scheme" content="light only"></head>
<body style="margin:0;padding:0;background:#f1efe9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1efe9;">
    <tr><td align="center" style="padding:26px 14px;">
      <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="width:520px;max-width:100%;background:#ffffff;border-radius:14px;overflow:hidden;">
        <tr><td style="background:#7d8a6f;padding:24px 28px;">
          <div style="color:#ffffff;font-size:11px;letter-spacing:2px;text-transform:uppercase;opacity:.85;">Nouvelle vente en ligne</div>
          <div style="margin-top:5px;color:#ffffff;font-family:Georgia,'Times New Roman',serif;font-size:23px;">Carte cadeau ${eur(giftCard.initialAmount)}</div>
        </td></tr>
        <tr><td style="padding:22px 28px 6px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${row('Code', `<span style="font-family:'Courier New',monospace;letter-spacing:1px;">${giftCard.code}</span>`)}
            ${row('Montant', eur(giftCard.initialAmount))}
            ${row('Acheteur', buyer)}
            ${row('Email acheteur', buyerEmail)}
            ${row('Destinataire', recipient)}
            ${row('Message', message)}
            ${row('Date', frDate(giftCard.createdAt || new Date()))}
          </table>
          ${receipt}
        </td></tr>
        <tr><td style="padding:18px 28px 26px;">
          <p style="margin:0;font-size:12px;line-height:1.6;color:#a7aaa4;border-top:1px solid #f0eee9;padding-top:16px;">
            Notification automatique — la carte + le PDF ont déjà été envoyés au client. Cet email vous sert de copie pour vos archives.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

/** Envoi des emails de carte cadeau (acheteur + destinataire) via Resend. */
async function sendGiftCardEmails(giftCard: IGiftCard): Promise<void> {
  // On joint la carte au format PDF (recto illustré + verso : numéro, montant,
  // validité). Échec de rendu non bloquant : l'email part quand même en texte.
  const attachments: EmailAttachment[] = []

  try {
    const pdf = await renderGiftCardPdf({
      code: giftCard.code,
      amount: giftCard.initialAmount,
      expiresAt: giftCard.expiresAt,
      recipientName: giftCard.recipient?.name,
      message: giftCard.recipient?.message,
    })
    attachments.push({
      filename: `carte-cadeau-${giftCard.code}.pdf`,
      content: pdf.toString('base64'),
    })
  } catch (err) {
    console.error('[giftcard] rendu PDF carte échoué:', (err as Error).message)
  }

  if (giftCard.purchasedBy?.email) {
    // Cadeau pour quelqu'un d'autre : l'acheteur reçoit une COPIE (le destinataire
    // reçoit aussi la sienne plus bas). Sinon, c'est simplement sa carte.
    const forOther = !!(giftCard.recipient?.name || giftCard.recipient?.email)
    const forWhom = giftCard.recipient?.name ? ` offerte à ${escapeHtml(giftCard.recipient.name)}` : ''
    await sendEmail({
      to: giftCard.purchasedBy.email,
      subject: forOther
        ? `Votre copie — carte cadeau ARTI ${eur(giftCard.initialAmount)}`
        : `Votre carte cadeau ARTI — ${eur(giftCard.initialAmount)}`,
      html: giftCardEmailHtml({
        title: forOther ? 'Votre copie de la carte cadeau' : 'Merci pour votre achat',
        intro: forOther
          ? `Merci pour votre achat&nbsp;! Voici votre copie de la carte cadeau${forWhom}, d'un montant de ${eur(giftCard.initialAmount)}. Le code et la carte complète sont ci-dessous&nbsp;; le destinataire a lui aussi reçu la sienne par email s'il a été renseigné.`
          : `Voici votre carte cadeau d'un montant de ${eur(giftCard.initialAmount)}. Conservez précieusement le code ci-dessous. La carte complète (avec le numéro et la date de validité) est en pièce jointe au format PDF.`,
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

  // Notification interne : la boutique (hello@) est prévenue de CHAQUE commande
  // en ligne. Les cartes créées au comptoir/admin par le staff ne déclenchent
  // rien (ils les créent eux-mêmes). Échec non bloquant comme les autres envois.
  if (giftCard.source === 'online') {
    try {
      await sendEmail({
        to: SHOP_EMAIL,
        subject: `🎁 Nouvelle carte cadeau vendue — ${eur(giftCard.initialAmount)} (${giftCard.code})`,
        html: shopSaleHtml(giftCard),
        attachments,
        replyTo: giftCard.purchasedBy?.email || undefined,
      })
    } catch (err) {
      console.error('[giftcard] notification boutique échouée:', (err as Error).message)
    }
  }

  giftCard.emailSent = true
  await giftCard.save()
}
