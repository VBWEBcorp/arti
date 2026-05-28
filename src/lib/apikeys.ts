interface ApiKeys {
  stripeSecretKey: string
  stripePublishableKey: string
  stripeWebhookSecret: string
  resendApiKey: string
  resendFromEmail: string
}

/**
 * Clés API (Stripe, Resend) — lues uniquement depuis l'environnement.
 * Privé : à définir dans .env.local en local, et dans les variables Netlify en prod.
 * Aucune exposition côté admin.
 */
export function getApiKeys(): ApiKeys {
  return {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
    stripePublishableKey:
      process.env.STRIPE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
      '',
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    resendApiKey: process.env.RESEND_API_KEY || '',
    resendFromEmail:
      process.env.RESEND_FROM_EMAIL || 'ARTI <noreply@articafeceramique.fr>',
  }
}
