'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Ban,
  Gift,
  Loader2,
  Plus,
  RefreshCw,
  ScanLine,
  Search,
  Sparkles,
  Wallet,
  X,
} from 'lucide-react'

import { GiftCardVisual } from '@/components/arti/gift-card-visual'
import { cn } from '@/lib/utils'

const eur = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)
const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—')

/* ---------- Styles on-brand ---------- */
const btnPrimary =
  'inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-sauge px-4 text-sm font-medium text-white transition-colors hover:bg-sauge-deep disabled:opacity-50'
const btnOutline =
  'inline-flex h-10 items-center justify-center gap-1.5 rounded-md border border-foreground/20 bg-white px-4 text-sm font-medium text-foreground transition-colors hover:bg-beige disabled:opacity-50'
const btnDanger =
  'inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-md bg-red-50 px-4 text-sm font-medium text-red-600 transition-colors hover:bg-red-100'
const inputCls =
  'h-10 w-full rounded-md border border-foreground/15 bg-white px-3 text-sm text-foreground placeholder:text-foreground/40 focus:border-sauge focus:outline-none focus:ring-1 focus:ring-sauge'
const labelCls = 'mb-1 block text-xs font-medium uppercase tracking-wide text-foreground/55'

type Tx = {
  type: string
  amount: number
  balanceAfter: number
  description?: string
  createdAt: string
}
type GiftCard = {
  _id: string
  code: string
  initialAmount: number
  balance: number
  status: 'active' | 'used' | 'expired' | 'cancelled'
  source: string
  purchasedBy?: { name?: string; email?: string }
  recipient?: { name?: string; email?: string; message?: string }
  expiresAt?: string
  createdAt: string
  transactions?: Tx[]
}

const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  used: 'Épuisée',
  expired: 'Expirée',
  cancelled: 'Annulée',
}
const STATUS_CLASS: Record<string, string> = {
  active: 'bg-sauge/15 text-sauge-deep',
  used: 'bg-foreground/10 text-foreground/60',
  expired: 'bg-terracotta/15 text-terracotta',
  cancelled: 'bg-red-100 text-red-600',
}

const FILTERS = [
  { value: '', label: 'Toutes' },
  { value: 'active', label: 'Actives' },
  { value: 'used', label: 'Épuisées' },
  { value: 'expired', label: 'Expirées' },
  { value: 'cancelled', label: 'Annulées' },
]

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

export default function AdminGiftCardsPage() {
  const router = useRouter()
  const [cards, setCards] = useState<GiftCard[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [showRedeem, setShowRedeem] = useState(false)
  const [detail, setDetail] = useState<GiftCard | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '200' })
      if (search.trim()) params.set('search', search.trim())
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/gift-cards?${params}`, { headers: authHeaders() })
      if (res.status === 401) {
        router.push('/admin/login')
        return
      }
      const data = await res.json()
      setCards(data.giftCards || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, router])

  useEffect(() => {
    if (!localStorage.getItem('authToken')) {
      router.push('/admin/login')
      return
    }
    load()
  }, [load, router])

  const stats = useMemo(() => {
    const active = cards.filter((c) => c.status === 'active')
    return {
      activeCount: active.length,
      circulating: active.reduce((s, c) => s + c.balance, 0),
      total: cards.length,
      used: cards.filter((c) => c.status === 'used').length,
    }
  }, [cards])

  const cancelCard = async (id: string) => {
    if (!confirm('Annuler cette carte cadeau ? Le solde sera perdu.')) return
    const res = await fetch(`/api/gift-cards/${id}/cancel`, { method: 'PATCH', headers: authHeaders() })
    if (res.ok) {
      setDetail(null)
      load()
    } else {
      const d = await res.json()
      alert(d.error || 'Erreur')
    }
  }

  const reactivateCard = async (id: string) => {
    if (!confirm('Réactiver cette carte ? Elle redeviendra utilisable (annulation corrigée).')) return
    const res = await fetch(`/api/gift-cards/${id}/reactivate`, { method: 'PATCH', headers: authHeaders() })
    if (res.ok) {
      setDetail(null)
      load()
    } else {
      const d = await res.json()
      alert(d.error || 'Erreur')
    }
  }

  return (
    <div className="min-h-screen bg-beige-light/50">
      {/* En-tête */}
      <header className="border-b border-foreground/10 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-5 pb-7 pt-16 sm:px-8 sm:pt-12">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-sauge-deep">
              Espace admin
            </p>
            <h1 className="mt-1 font-display text-5xl font-medium leading-none text-foreground sm:text-6xl">
              Cartes cadeaux
            </h1>
            <p className="mt-2 text-sm text-foreground/60">
              Vendez, créez et utilisez les bons cadeaux ARTI.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowRedeem(true)} className={btnOutline}>
              <ScanLine className="size-4" /> Utiliser
            </button>
            <button onClick={() => setShowCreate(true)} className={btnPrimary}>
              <Plus className="size-4" /> Créer une carte
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard icon={Gift} tone="sauge" label="Cartes actives" value={String(stats.activeCount)} />
          <StatCard icon={Wallet} tone="terracotta" label="Solde en circulation" value={eur(stats.circulating)} />
          <StatCard icon={Sparkles} tone="navy" label="Total émis" value={String(stats.total)} />
          <StatCard icon={Ban} tone="muted" label="Épuisées" value={String(stats.used)} />
        </div>

        {/* Filtres */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              load()
            }}
            className="relative min-w-[220px] flex-1"
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un code, un email, un nom…"
              className={cn(inputCls, 'pl-9')}
            />
          </form>
          <button onClick={load} className={cn(btnOutline, 'px-3')} title="Rafraîchir">
            <RefreshCw className="size-4" />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
                statusFilter === f.value
                  ? 'bg-sauge text-white'
                  : 'bg-white text-foreground/70 ring-1 ring-foreground/10 hover:bg-beige'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Liste */}
        <div className="mt-5 overflow-hidden rounded-xl border border-foreground/10 bg-white shadow-[var(--shadow-sm)]">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-20 text-sm text-foreground/60">
              <Loader2 className="size-4 animate-spin" /> Chargement…
            </div>
          ) : cards.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-beige text-sauge-deep">
                <Gift className="size-6" />
              </span>
              <p className="text-sm text-foreground/60">Aucune carte cadeau pour le moment.</p>
              <button onClick={() => setShowCreate(true)} className={btnPrimary}>
                <Plus className="size-4" /> Créer la première
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-foreground/10">
              {cards.map((c) => {
                const pct = c.initialAmount > 0 ? Math.round((c.balance / c.initialAmount) * 100) : 0
                return (
                  <li key={c._id}>
                    <button
                      onClick={() => setDetail(c)}
                      className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-beige-light sm:px-5"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-beige text-sauge-deep">
                        <Gift className="size-4" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold tracking-wide text-foreground">
                            {c.code}
                          </span>
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                              STATUS_CLASS[c.status]
                            )}
                          >
                            {STATUS_LABEL[c.status]}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-foreground/50">
                          {c.recipient?.name || c.recipient?.email || c.purchasedBy?.email || 'Sans destinataire'}
                          {' · '}
                          {fmtDate(c.createdAt)}
                        </p>
                      </div>

                      <div className="w-28 shrink-0 text-right">
                        <p className="text-sm font-semibold text-foreground">{eur(c.balance)}</p>
                        <div className="mt-1 h-1 overflow-hidden rounded-full bg-foreground/10">
                          <div
                            className={cn('h-full rounded-full', c.status === 'active' ? 'bg-sauge' : 'bg-foreground/25')}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="mt-0.5 text-[10px] text-foreground/40">sur {eur(c.initialAmount)}</p>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Modales */}
      {showCreate && (
        <CreateModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load() }} />
      )}
      {showRedeem && <RedeemModal onClose={() => setShowRedeem(false)} onDone={load} />}
      {detail && (
        <DetailModal
          card={detail}
          onClose={() => setDetail(null)}
          onCancel={cancelCard}
          onReactivate={reactivateCard}
        />
      )}
    </div>
  )
}

/* ---------- Stat card ---------- */
function StatCard({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  tone: 'sauge' | 'terracotta' | 'navy' | 'muted'
  label: string
  value: string
}) {
  const tones = {
    sauge: 'bg-sauge/15 text-sauge-deep',
    terracotta: 'bg-terracotta/15 text-terracotta',
    navy: 'bg-foreground/10 text-foreground',
    muted: 'bg-beige text-foreground/55',
  }
  return (
    <div className="rounded-xl border border-foreground/10 bg-white p-4 shadow-[var(--shadow-sm)] sm:p-5">
      <span className={cn('flex size-9 items-center justify-center rounded-lg', tones[tone])}>
        <Icon className="size-4" strokeWidth={1.8} />
      </span>
      <p className="mt-3 font-display text-3xl font-medium leading-none text-foreground">{value}</p>
      <p className="mt-1.5 text-xs text-foreground/55">{label}</p>
    </div>
  )
}

/* ---------- Coque modale ---------- */
function Modal({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string
  subtitle?: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-navy/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-[var(--shadow-lg)]">
        <div className="flex items-start justify-between border-b border-foreground/10 bg-beige-light px-6 py-5">
          <div>
            <h2 className="font-display text-3xl font-medium leading-none text-foreground">{title}</h2>
            {subtitle && <p className="mt-1.5 text-xs text-foreground/55">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-foreground/50 transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

/* ---------- Création ---------- */
function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [amount, setAmount] = useState('30')
  const [source, setSource] = useState('admin')
  const [buyerName, setBuyerName] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [message, setMessage] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/gift-cards', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          initialAmount: Number(amount),
          source: source === 'admin' ? undefined : source,
          purchasedBy: { name: buyerName || undefined, email: buyerEmail || undefined },
          recipient: { name: recipientName || undefined, email: recipientEmail || undefined, message: message || undefined },
          expiresAt: expiresAt || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      onCreated()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Nouvelle carte" subtitle="Création manuelle (sans paiement en ligne)" onClose={onClose}>
      <div className="space-y-4">
        {/* Aperçu de la carte (visuel de marque) */}
        <div>
          <label className={labelCls}>Aperçu</label>
          <GiftCardVisual />
          <p className="mt-1.5 text-xs text-foreground/50">
            Le numéro, le montant et la date de validité sont remplis sur le PDF envoyé par email.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Montant (€)</label>
            <input type="number" min={5} max={500} value={amount} onChange={(e) => setAmount(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Source</label>
            <select value={source} onChange={(e) => setSource(e.target.value)} className={inputCls}>
              <option value="admin">Création admin</option>
              <option value="on_site">Vente sur place</option>
              <option value="avoir">Avoir client</option>
              <option value="employee_benefit">Avantage employé</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Acheteur (nom)</label>
            <input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Acheteur (email)</label>
            <input type="email" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Destinataire (nom)</label>
            <input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Destinataire (email)</label>
            <input type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Message (optionnel)</label>
          <input value={message} onChange={(e) => setMessage(e.target.value)} maxLength={200} className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Expiration (optionnel)</label>
          <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className={inputCls} />
        </div>

        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <button onClick={submit} disabled={saving} className={cn(btnPrimary, 'w-full')}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          Créer la carte
        </button>
      </div>
    </Modal>
  )
}

/* ---------- Utilisation sur place ---------- */
function RedeemModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ amount: number } | null>(null)

  const submit = async () => {
    if (!confirm('Utiliser cette carte ? Elle est à usage unique et sera entièrement consommée.')) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/gift-cards/redeem', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ code: code.trim(), description: description || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      setResult(data)
      onDone()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Utiliser une carte" subtitle="Carte à usage unique — consommée en entier" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Code de la carte</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="GC-XXXX-XXXX"
            className={cn(inputCls, 'font-mono uppercase tracking-wider')}
          />
        </div>
        <div>
          <label className={labelCls}>Note (optionnel)</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} maxLength={200} className={inputCls} />
        </div>

        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        {result && (
          <p className="rounded-md bg-sauge/15 px-3 py-2 text-sm text-sauge-deep">
            Carte utilisée — valeur <strong>{eur(result.amount)}</strong>.
          </p>
        )}

        <button onClick={submit} disabled={saving || !code.trim() || !!result} className={cn(btnPrimary, 'w-full')}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : <ScanLine className="size-4" />}
          Utiliser la carte
        </button>
      </div>
    </Modal>
  )
}

/* ---------- Détail ---------- */
function DetailModal({
  card,
  onClose,
  onCancel,
  onReactivate,
}: {
  card: GiftCard
  onClose: () => void
  onCancel: (id: string) => void
  onReactivate: (id: string) => void
}) {
  const pct = card.initialAmount > 0 ? Math.round((card.balance / card.initialAmount) * 100) : 0
  return (
    <Modal title={card.code} subtitle={`Créée le ${fmtDate(card.createdAt)} · ${card.source}`} onClose={onClose}>
      <div className="space-y-5">
        {/* Solde */}
        <div className="rounded-xl bg-beige-light p-4">
          <div className="flex items-end justify-between">
            <span
              className={cn(
                'rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
                STATUS_CLASS[card.status]
              )}
            >
              {STATUS_LABEL[card.status]}
            </span>
            <span className="text-right">
              <span className="font-display text-4xl font-medium leading-none text-foreground">
                {eur(card.balance)}
              </span>
              <span className="ml-1 text-sm text-foreground/50">/ {eur(card.initialAmount)}</span>
            </span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-foreground/10">
            <div
              className={cn('h-full rounded-full', card.status === 'active' ? 'bg-sauge' : 'bg-foreground/25')}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Infos */}
        <dl className="space-y-2 text-sm">
          {(card.purchasedBy?.name || card.purchasedBy?.email) && (
            <div className="flex justify-between gap-4">
              <dt className="text-foreground/55">Acheteur</dt>
              <dd className="text-right text-foreground">
                {card.purchasedBy.name} {card.purchasedBy.email && <span className="text-foreground/50">{card.purchasedBy.email}</span>}
              </dd>
            </div>
          )}
          {(card.recipient?.name || card.recipient?.email) && (
            <div className="flex justify-between gap-4">
              <dt className="text-foreground/55">Destinataire</dt>
              <dd className="text-right text-foreground">
                {card.recipient.name} {card.recipient.email && <span className="text-foreground/50">{card.recipient.email}</span>}
              </dd>
            </div>
          )}
          {card.recipient?.message && (
            <div className="flex justify-between gap-4">
              <dt className="text-foreground/55">Message</dt>
              <dd className="max-w-[60%] text-right text-foreground/80 italic">« {card.recipient.message} »</dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-foreground/55">Expiration</dt>
            <dd className="text-right text-foreground">{fmtDate(card.expiresAt)}</dd>
          </div>
        </dl>

        {/* Historique */}
        {card.transactions && card.transactions.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground/55">Historique</p>
            <div className="space-y-1.5">
              {card.transactions.map((t, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-beige-light px-3 py-2 text-xs">
                  <span className="text-foreground">{t.description || t.type}</span>
                  <span className="text-foreground/55">
                    {eur(t.amount)} → {eur(t.balanceAfter)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {card.status === 'cancelled' ? (
          <button onClick={() => onReactivate(card._id)} className={cn(btnPrimary, 'w-full')}>
            <RefreshCw className="size-4" /> Réactiver la carte
          </button>
        ) : (
          <button onClick={() => onCancel(card._id)} className={btnDanger}>
            <Ban className="size-4" /> Annuler la carte
          </button>
        )}
      </div>
    </Modal>
  )
}
