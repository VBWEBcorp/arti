'use client'

import { useMemo, useState } from 'react'

import { cn } from '@/lib/utils'

/**
 * Formulaire de contact / réservation avec captcha mathématique simple.
 * Envoie le message vers la boutique (hello@articafeceramique.fr) via /api/contact.
 */
export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle'
  )
  const [errMsg, setErrMsg] = useState('Réponse anti-spam incorrecte. Réessayez.')
  const captcha = useMemo(() => {
    const a = 5
    const b = 14
    return { a, b, expected: a + b }
  }, [])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    if (Number(data.get('captcha')) !== captcha.expected) {
      setErrMsg('Réponse anti-spam incorrecte. Réessayez.')
      setStatus('error')
      return
    }
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: data.get('nom'),
          prenom: data.get('prenom'),
          telephone: data.get('telephone'),
          email: data.get('email'),
          message: data.get('message'),
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || "L'envoi a échoué.")
      }
      setStatus('sent')
      form.reset()
    } catch (err) {
      setErrMsg(
        (err as Error).message ||
          "L'envoi a échoué. Réessayez ou écrivez-nous à hello@articafeceramique.fr."
      )
      setStatus('error')
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="border border-foreground/10 bg-white p-6 shadow-[var(--shadow-lg)] sm:p-9"
    >
      <h2 className="font-display text-4xl font-medium text-foreground sm:text-5xl">
        Contactez-nous
      </h2>
      <span className="mt-3 block h-px w-12 bg-sauge/50" aria-hidden />

      <div className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="nom" label="Nom" required />
          <Field name="prenom" label="Prénom" required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="telephone" type="tel" label="Téléphone" />
          <Field name="email" type="email" label="E-mail" required />
        </div>
        <Textarea name="message" label="Message" required />

        <div className="flex flex-wrap items-end justify-between gap-4 pt-1">
          <div>
            <label
              htmlFor="captcha"
              className="mb-1.5 block text-xs font-medium text-foreground/60"
            >
              Anti-spam : combien font {captcha.a} + {captcha.b} ?
            </label>
            <input
              id="captcha"
              name="captcha"
              inputMode="numeric"
              pattern="[0-9]*"
              required
              aria-label={`${captcha.a} plus ${captcha.b}`}
              className="h-11 w-20 border border-foreground/15 bg-beige-light px-3 text-center text-foreground focus:border-sauge focus:outline-none focus:ring-2 focus:ring-sauge/30"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={status === 'sending'}
          className="inline-flex h-12 w-full items-center justify-center bg-sauge text-sm font-medium tracking-wide text-white transition-colors hover:bg-sauge-deep disabled:opacity-60"
        >
          {status === 'sending' ? 'Envoi…' : 'Envoyer le message'}
        </button>

        {status === 'error' && (
          <p className="text-sm text-red-700">{errMsg}</p>
        )}
        {status === 'sent' && (
          <p className="text-sm font-medium text-sauge-deep">
            Merci, votre message a bien été envoyé&nbsp;! Nous revenons vers vous
            rapidement.
          </p>
        )}
      </div>
    </form>
  )
}

function Field({
  name,
  type = 'text',
  label,
  required,
  className,
}: {
  name: string
  type?: string
  label: string
  required?: boolean
  className?: string
}) {
  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="mb-1.5 block text-xs font-medium text-foreground/60"
      >
        {label}
        {required && <span className="text-sauge-deep"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className={cn(
          'block h-11 w-full border border-foreground/15 bg-beige-light px-4 text-[14px] text-foreground transition-colors focus:border-sauge focus:outline-none focus:ring-2 focus:ring-sauge/30'
        )}
      />
    </div>
  )
}

function Textarea({
  name,
  label,
  required,
}: {
  name: string
  label: string
  required?: boolean
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-xs font-medium text-foreground/60"
      >
        {label}
        {required && <span className="text-sauge-deep"> *</span>}
      </label>
      <textarea
        id={name}
        name={name}
        required={required}
        rows={5}
        className="block w-full border border-foreground/15 bg-beige-light px-4 py-3 text-[14px] text-foreground transition-colors focus:border-sauge focus:outline-none focus:ring-2 focus:ring-sauge/30"
      />
    </div>
  )
}
