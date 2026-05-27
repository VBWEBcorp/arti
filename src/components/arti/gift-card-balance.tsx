'use client'

import { Loader2, Search } from 'lucide-react'
import { useState } from 'react'

const eur = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)

export function GiftCardBalance() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ balance: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const check = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading || !code.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/gift-cards/check-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Carte introuvable')
      setResult(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <form onSubmit={check} className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="GC-XXXX-XXXX"
          className="flex-1 border border-foreground/15 bg-white px-3 py-2.5 font-mono text-sm uppercase tracking-wider focus:border-sauge focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex h-[42px] items-center justify-center gap-2 bg-sauge px-5 text-sm font-light text-white transition-colors hover:bg-sauge-deep disabled:opacity-50"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
          Vérifier
        </button>
      </form>
      {result && (
        <p className="mt-3 text-center text-sm text-foreground/80">
          Solde disponible : <strong className="text-sauge-deep">{eur(result.balance)}</strong>
        </p>
      )}
      {error && <p className="mt-3 text-center text-sm text-red-600">{error}</p>}
    </div>
  )
}
