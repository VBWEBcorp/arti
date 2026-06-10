'use client'

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  CreditCard,
  Gift,
  Loader2,
  Mail,
  ShieldCheck,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { GiftCardVisual } from '@/components/arti/gift-card-visual'
import { StripePaymentForm } from '@/components/arti/stripe-payment-form'
import { cn } from '@/lib/utils'

const eur = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Config = {
  presets: number[]
  min: number
  max: number
  stripeConfigured: boolean
  stripePublishableKey: string
}
type PurchaseResult = {
  id: string
  code: string
  amount: number
  recipient?: { name?: string; message?: string }
  testMode?: boolean
}

const FALLBACK: Config = {
  presets: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
  min: 10,
  max: 100,
  stripeConfigured: false,
  stripePublishableKey: '',
}

export function GiftCardPurchase() {
  const [config, setConfig] = useState<Config>(FALLBACK)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [errors, setErrors] = useState<string[]>([])
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<PurchaseResult | null>(null)
  const [copied, setCopied] = useState(false)

  // Formulaire
  const [amount, setAmount] = useState<number>(30)
  const [purchaser, setPurchaser] = useState({ name: '', email: '' })
  const [recipient, setRecipient] = useState({ name: '', email: '', message: '' })

  useEffect(() => {
    // Montant pré-sélectionné via l'URL (ex. /produit/carte-cadeau?montant=50)
    const param = Number(new URLSearchParams(window.location.search).get('montant'))

    fetch('/api/gift-cards/config')
      .then((r) => r.json())
      .then((c: Config) => {
        setConfig(c)
        if (Array.isArray(c.presets) && c.presets.length) {
          if (param && c.presets.includes(param)) setAmount(param)
          else setAmount(c.presets.includes(30) ? 30 : c.presets[0])
        }
      })
      .catch(() => {
        if (param && FALLBACK.presets.includes(param)) setAmount(param)
      })
  }, [])

  const effectiveAmount = amount

  const validateStep1 = () => {
    const errs: string[] = []
    if (effectiveAmount < config.min || effectiveAmount > config.max) {
      errs.push(`Le montant doit être entre ${eur(config.min)} et ${eur(config.max)}.`)
    }
    if (!purchaser.name.trim()) errs.push("Votre nom est requis.")
    if (!emailRe.test(purchaser.email.trim())) errs.push("Votre email est invalide.")
    if (recipient.email && !emailRe.test(recipient.email.trim())) {
      errs.push("L'email du destinataire est invalide.")
    }
    return errs
  }

  const goToPayment = () => {
    const errs = validateStep1()
    if (errs.length) {
      setErrors(errs)
      return
    }
    setErrors([])
    setStep(2)
  }

  // Finalise l'achat : crée la carte côté serveur à partir d'un PaymentIntent.
  // En mode réel, l'id vient de Stripe Elements ; en mode test, c'est un id simulé.
  const finalizePurchase = async (stripePaymentIntentId: string) => {
    if (processing) return
    setProcessing(true)
    setErrors([])
    try {
      const res = await fetch('/api/gift-cards/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: effectiveAmount,
          purchaser: { name: purchaser.name.trim(), email: purchaser.email.trim() },
          recipient: {
            name: recipient.name.trim() || undefined,
            email: recipient.email.trim() || undefined,
            message: recipient.message.trim() || undefined,
          },
          stripePaymentIntentId,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'achat.")
      setResult(data)
      setStep(3)
    } catch (err) {
      setErrors([(err as Error).message])
    } finally {
      setProcessing(false)
    }
  }

  // Mode test (Stripe non branché) : on simule un PaymentIntent confirmé.
  const handleTestPay = () => {
    const id = `pi_test_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
    finalizePurchase(id)
  }

  const copyCode = () => {
    if (!result?.code) return
    navigator.clipboard.writeText(result.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ===== Confirmation =====
  if (step === 3 && result) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-sauge text-white">
          <Check className="size-7" />
        </span>
        <h2 className="mt-5 font-display text-4xl font-medium text-foreground sm:text-5xl">
          C&apos;est cadeau&nbsp;!
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-foreground/75">
          Votre carte cadeau de <strong>{eur(result.amount)}</strong> est prête.
        </p>

        <div className="mt-8">
          <GiftCardVisual
            amount={result.amount}
            code={result.code}
            recipientName={result.recipient?.name}
            message={result.recipient?.message}
          />
        </div>

        <div className="mt-6 border border-foreground/10 bg-beige-light p-5">
          <p className="text-[11px] uppercase tracking-[0.22em] text-sauge-deep">
            Code de la carte
          </p>
          <p className="mt-2 font-mono text-2xl font-bold tracking-[0.2em] text-foreground">
            {result.code}
          </p>
          <button
            type="button"
            onClick={copyCode}
            className="mt-4 inline-flex items-center gap-2 border border-foreground/20 px-4 py-2 text-sm transition-colors hover:bg-foreground hover:text-white"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? 'Copié !' : 'Copier le code'}
          </button>
        </div>

        {result.recipient?.name && (
          <p className="mt-4 flex items-center justify-center gap-2 text-sm text-foreground/70">
            <Mail className="size-4" /> Le code peut être transmis à {result.recipient.name}.
          </p>
        )}

        {result.testMode && (
          <p className="mt-6 rounded-sm bg-terracotta/10 px-4 py-3 text-xs text-terracotta">
            Mode test : aucune transaction réelle n&apos;a eu lieu (Stripe non branché).
          </p>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Progression */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {[
          { num: 1, label: 'Votre carte' },
          { num: 2, label: 'Paiement' },
        ].map(({ num, label }, i) => (
          <div key={num} className="flex items-center">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  'flex size-8 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                  num <= step ? 'bg-sauge text-white' : 'border border-foreground/20 text-foreground/50'
                )}
              >
                {num}
              </span>
              <span className="mt-1 text-[10px] text-foreground/60">{label}</span>
            </div>
            {i === 0 && (
              <span
                className={cn('mx-2 mb-4 h-px w-16 transition-colors', step > 1 ? 'bg-sauge' : 'bg-foreground/20')}
              />
            )}
          </div>
        ))}
      </div>

      {errors.length > 0 && (
        <div className="mb-6 border border-red-300 bg-red-50 px-4 py-3">
          <ul className="list-inside list-disc space-y-0.5 text-xs text-red-700">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ===== Étape 1 ===== */}
      {step === 1 && (
        <div className="space-y-8">
          <div>
            <h3 className="font-display text-2xl font-medium text-foreground">
              Quel montant souhaitez-vous offrir&nbsp;?
            </h3>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {config.presets.map((preset) => {
                const selected = amount === preset
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className={cn(
                      'flex items-center justify-center py-3 font-display text-2xl font-medium transition-all',
                      selected
                        ? 'bg-sauge text-white shadow-md'
                        : 'border border-foreground/15 bg-beige-light text-foreground hover:border-sauge'
                    )}
                  >
                    {preset}&nbsp;€
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <h3 className="font-display text-2xl font-medium text-foreground">Vos coordonnées</h3>
            <p className="mt-1 text-xs text-foreground/60">
              Vous recevrez la confirmation d&apos;achat avec le code.
            </p>
            <div className="mt-3 space-y-2">
              <input
                type="text"
                value={purchaser.name}
                onChange={(e) => setPurchaser((p) => ({ ...p, name: e.target.value }))}
                placeholder="Votre nom *"
                className="w-full border border-foreground/15 bg-white px-3 py-2.5 text-sm focus:border-sauge focus:outline-none"
              />
              <input
                type="email"
                value={purchaser.email}
                onChange={(e) => setPurchaser((p) => ({ ...p, email: e.target.value }))}
                placeholder="Votre email *"
                className="w-full border border-foreground/15 bg-white px-3 py-2.5 text-sm focus:border-sauge focus:outline-none"
              />
            </div>
          </div>

          <div>
            <h3 className="font-display text-2xl font-medium text-foreground">
              Pour qui&nbsp;?{' '}
              <span className="text-sm font-normal text-foreground/50">(optionnel)</span>
            </h3>
            <p className="mt-1 text-xs text-foreground/60">
              Sans destinataire, le code vous est envoyé pour le transmettre vous-même.
            </p>
            <div className="mt-3 space-y-2">
              <input
                type="text"
                value={recipient.name}
                onChange={(e) => setRecipient((r) => ({ ...r, name: e.target.value }))}
                placeholder="Prénom du destinataire"
                className="w-full border border-foreground/15 bg-white px-3 py-2.5 text-sm focus:border-sauge focus:outline-none"
              />
              <input
                type="email"
                value={recipient.email}
                onChange={(e) => setRecipient((r) => ({ ...r, email: e.target.value }))}
                placeholder="Email du destinataire"
                className="w-full border border-foreground/15 bg-white px-3 py-2.5 text-sm focus:border-sauge focus:outline-none"
              />
              <textarea
                value={recipient.message}
                onChange={(e) => setRecipient((r) => ({ ...r, message: e.target.value }))}
                placeholder="Un petit mot personnel… (optionnel)"
                rows={3}
                maxLength={200}
                className="w-full resize-none border border-foreground/15 bg-white px-3 py-2.5 text-sm focus:border-sauge focus:outline-none"
              />
            </div>
          </div>

          {/* Récapitulatif */}
          <div className="flex items-center justify-between border border-foreground/10 bg-beige-light px-4 py-4">
            <span className="text-sm font-medium text-foreground">Carte cadeau</span>
            <span className="font-display text-3xl font-medium text-foreground">
              {eur(effectiveAmount)}
            </span>
          </div>

          <button
            type="button"
            onClick={goToPayment}
            className="flex h-12 w-full items-center justify-center gap-2 bg-sauge text-[15px] font-light tracking-wide text-white transition-colors hover:bg-sauge-deep"
          >
            Continuer vers le paiement
            <ArrowRight className="size-4" />
          </button>
        </div>
      )}

      {/* ===== Étape 2 ===== */}
      {step === 2 && (
        <div className="mx-auto max-w-md space-y-5">
          <div className="border border-foreground/10 bg-beige-light p-5 text-center">
            <p className="text-xs text-foreground/60">Carte cadeau de</p>
            <p className="font-display text-4xl font-medium text-foreground">{eur(effectiveAmount)}</p>
            {recipient.name && (
              <p className="mt-1 text-xs text-foreground/60">Pour {recipient.name}</p>
            )}
          </div>

          {config.stripeConfigured && config.stripePublishableKey ? (
            // ===== Paiement réel via Stripe Elements =====
            <>
              <StripePaymentForm
                amount={effectiveAmount}
                publishableKey={config.stripePublishableKey}
                onSuccess={finalizePurchase}
                onError={(m) => setErrors(m ? [m] : [])}
              />

              <div className="flex items-center justify-center gap-2 text-[11px] text-foreground/55">
                <ShieldCheck className="size-3.5" />
                Paiement sécurisé via Stripe. Vos données bancaires ne transitent jamais par nos
                serveurs.
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep(1)
                  setErrors([])
                }}
                disabled={processing}
                className="flex h-12 w-full items-center justify-center gap-1 border border-foreground/20 text-sm transition-colors hover:bg-foreground hover:text-white disabled:opacity-50"
              >
                <ArrowLeft className="size-4" /> Retour
              </button>
            </>
          ) : (
            // ===== Mode test (Stripe non configuré) =====
            <>
              <div className="border border-terracotta/40 bg-terracotta/10 p-4 text-center">
                <p className="text-sm font-medium text-terracotta">Mode test — paiement simulé</p>
                <p className="mt-1 text-xs text-foreground/70">
                  Stripe n&apos;est pas encore branché. La validation crée une vraie carte en base
                  sans transaction bancaire.
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-foreground/55">
                <ShieldCheck className="size-3.5" />
                Paiement sécurisé. Vos données bancaires ne transitent jamais par nos serveurs.
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1)
                    setErrors([])
                  }}
                  disabled={processing}
                  className="flex h-12 flex-1 items-center justify-center gap-1 border border-foreground/20 text-sm transition-colors hover:bg-foreground hover:text-white disabled:opacity-50"
                >
                  <ArrowLeft className="size-4" /> Retour
                </button>
                <button
                  type="button"
                  onClick={handleTestPay}
                  disabled={processing}
                  className="flex h-12 flex-1 items-center justify-center gap-2 bg-sauge text-sm font-light tracking-wide text-white transition-colors hover:bg-sauge-deep disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Traitement…
                    </>
                  ) : (
                    <>
                      <CreditCard className="size-4" /> Payer {eur(effectiveAmount)}
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Aide étape 1 */}
      {step === 1 && (
        <p className="mt-6 flex items-center gap-2 text-xs text-foreground/50">
          <Gift className="size-3.5" /> Carte utilisable en une ou plusieurs fois sur nos ateliers.
        </p>
      )}
    </div>
  )
}
