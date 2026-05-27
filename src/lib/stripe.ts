/**
 * Couche Stripe pour les cartes cadeaux.
 *
 * Mode "préparé mais non branché" : tant que STRIPE_SECRET_KEY n'est pas défini,
 * on tourne en MODE TEST — le flux d'achat fonctionne de bout en bout sans
 * paiement réel (utile pour développer / démontrer). Dès que les clés Stripe
 * sont fournies, la vérification réelle du PaymentIntent s'active automatiquement.
 *
 * Pour brancher Stripe pour de vrai plus tard :
 *   1. npm install stripe @stripe/stripe-js @stripe/react-stripe-js
 *   2. Définir STRIPE_SECRET_KEY (et NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY côté front)
 *   3. Créer une route POST /api/gift-cards/payment-intent qui crée le PaymentIntent
 *      (cf. README du module, section "Stripe — création du PaymentIntent").
 */

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY
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
  if (!isStripeConfigured()) {
    const ok = typeof paymentIntentId === 'string' && paymentIntentId.startsWith('pi_')
    return {
      ok,
      testMode: true,
      receiptUrl: null,
      reason: ok ? undefined : 'Identifiant de paiement de test invalide',
    }
  }

  // Import dynamique via spécificateur calculé : ni TypeScript ni le bundler ne
  // tentent de résoudre `stripe` tant que le package n'est pas installé. Une fois
  // `npm install stripe` fait, ce chemin s'active dès que STRIPE_SECRET_KEY existe.
  const moduleName = 'stripe'
  const Stripe = (await import(/* webpackIgnore: true */ moduleName)).default
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)
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
