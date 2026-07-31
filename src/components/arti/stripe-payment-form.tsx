'use client'

import { CreditCard, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { loadStripe, type Stripe } from '@stripe/stripe-js'

const eur = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)

// loadStripe ne doit être appelé qu'une fois par clé publique (hors render).
let stripePromise: Promise<Stripe | null> | null = null
let cachedKey = ''
function getStripePromise(publishableKey: string) {
  if (!stripePromise || cachedKey !== publishableKey) {
    stripePromise = loadStripe(publishableKey)
    cachedKey = publishableKey
  }
  return stripePromise
}

type Purchaser = { firstName: string; lastName: string; email: string }
type Recipient = { firstName: string; lastName: string; email: string; message: string }

type Props = {
  amount: number
  publishableKey: string
  purchaser: Purchaser
  recipient: Recipient
  onSuccess: (paymentIntentId: string) => void
  onError: (message: string) => void
}

export function StripePaymentForm({
  amount,
  publishableKey,
  purchaser,
  recipient,
  onSuccess,
  onError,
}: Props) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Refs pour ne pas relancer l'effet (et recréer un PaymentIntent) quand le
  // parent recrée onError / les objets à chaque render. Les coordonnées sont
  // fixées à l'étape 1, donc seul `amount` doit piloter la création du paiement.
  const onErrorRef = useRef(onError)
  onErrorRef.current = onError
  const detailsRef = useRef({ purchaser, recipient })
  detailsRef.current = { purchaser, recipient }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setClientSecret(null)

    fetch('/api/gift-cards/payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        purchaser: detailsRef.current.purchaser,
        recipient: detailsRef.current.recipient,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        if (data.clientSecret) setClientSecret(data.clientSecret)
        else onErrorRef.current(data.error || 'Impossible d’initialiser le paiement.')
      })
      .catch(() => {
        if (!cancelled) onErrorRef.current('Impossible d’initialiser le paiement.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [amount])

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-sm text-foreground/60">
        <Loader2 className="size-4 animate-spin" /> Préparation du paiement sécurisé…
      </div>
    )
  }

  if (!clientSecret) return null

  return (
    <Elements
      stripe={getStripePromise(publishableKey)}
      options={{
        clientSecret,
        appearance: {
          theme: 'flat',
          variables: {
            colorPrimary: '#7d8a6f',
            colorBackground: '#ffffff',
            fontFamily: 'inherit',
            borderRadius: '0px',
          },
        },
      }}
    >
      <PaymentInner amount={amount} onSuccess={onSuccess} onError={onError} />
    </Elements>
  )
}

type PaymentInnerProps = {
  amount: number
  onSuccess: (paymentIntentId: string) => void
  onError: (message: string) => void
}

function PaymentInner({ amount, onSuccess, onError }: PaymentInnerProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async () => {
    if (!stripe || !elements || processing) return
    setProcessing(true)
    onError('')

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })

    if (error) {
      onError(error.message || 'Le paiement a échoué.')
      setProcessing(false)
      return
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Le parent finalise l'achat (création de la carte) avec ce vrai id.
      onSuccess(paymentIntent.id)
    } else {
      onError('Le paiement n’a pas pu être confirmé.')
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-4">
      <PaymentElement />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!stripe || processing}
        className="flex h-12 w-full items-center justify-center gap-2 bg-sauge text-sm font-light tracking-wide text-white transition-colors hover:bg-sauge-deep disabled:opacity-50"
      >
        {processing ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Traitement…
          </>
        ) : (
          <>
            <CreditCard className="size-4" /> Payer {eur(amount)}
          </>
        )}
      </button>
    </div>
  )
}
