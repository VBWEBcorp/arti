/**
 * Couche Stripe.
 *
 * Les clés sont lues via getApiKeys() depuis l'environnement (.env.local en
 * local, variables Netlify en prod) — privé, jamais exposé côté admin. Tant
 * qu'aucune clé secrète n'est définie, on tourne en MODE TEST : le flux d'achat
 * des cartes cadeaux fonctionne de bout en bout sans paiement réel. Dès qu'une
 * clé est fournie, la vérification réelle du PaymentIntent s'active.
 */

import Stripe from 'stripe'
import { getApiKeys } from './apikeys'

let stripeInstance: Stripe | null = null
let lastKey = ''

/** Instance Stripe basée sur la clé secrète courante. Lève si non configurée. */
export async function getStripe(): Promise<Stripe> {
  const keys = getApiKeys()

  if (!keys.stripeSecretKey) {
    throw new Error(
      'Clé Stripe non configurée. Allez dans Admin → Paramètres → Clés API.'
    )
  }

  if (!stripeInstance || lastKey !== keys.stripeSecretKey) {
    stripeInstance = new Stripe(keys.stripeSecretKey, { typescript: true })
    lastKey = keys.stripeSecretKey
  }

  return stripeInstance
}

/** Clé publique (publishable) — exposable côté front. */
export async function getStripePublishableKey(): Promise<string> {
  return getApiKeys().stripePublishableKey
}

/** Vrai si une clé secrète Stripe est configurée (via l'environnement). */
export async function isStripeConfigured(): Promise<boolean> {
  return !!getApiKeys().stripeSecretKey
}

export type PaymentVerification = {
  ok: boolean
  testMode: boolean
  receiptUrl: string | null
  reason?: string
}

/**
 * Vérifie qu'un PaymentIntent a bien été payé pour le montant attendu.
 * En mode test (pas de clé Stripe), accepte tout id au format `pi_...`.
 */
export async function verifyGiftCardPayment(
  paymentIntentId: string,
  amountEuros: number
): Promise<PaymentVerification> {
  const configured = await isStripeConfigured()

  if (!configured) {
    const ok = typeof paymentIntentId === 'string' && paymentIntentId.startsWith('pi_')
    return {
      ok,
      testMode: true,
      receiptUrl: null,
      reason: ok ? undefined : 'Identifiant de paiement de test invalide',
    }
  }

  const stripe = await getStripe()
  const pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
    expand: ['latest_charge'],
  })

  if (pi.status !== 'succeeded') {
    return { ok: false, testMode: false, receiptUrl: null, reason: `Paiement non confirmé (${pi.status})` }
  }

  const expectedCents = Math.round(amountEuros * 100)
  if (pi.amount !== expectedCents) {
    return { ok: false, testMode: false, receiptUrl: null, reason: 'Montant du paiement incorrect' }
  }

  const charge = pi.latest_charge as { receipt_url?: string } | null
  return { ok: true, testMode: false, receiptUrl: charge?.receipt_url || null }
}
