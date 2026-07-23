'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle,
  Ban,
  Calculator,
  ChevronDown,
  Download,
  Eye,
  Gift,
  Loader2,
  Plus,
  RefreshCw,
  ScanLine,
  Search,
  Sparkles,
  Trash2,
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
  const [confirmState, setConfirmState] = useState<{
    id: string
    action: 'cancel' | 'reactivate' | 'delete'
    tone: 'danger' | 'primary'
    title: string
    message: string
    confirmLabel: string
  } | null>(null)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [confirmError, setConfirmError] = useState<string | null>(null)

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

  // Confirmation via pop-up stylée (et non le confirm() natif du navigateur).
  const cancelCard = (id: string) =>
    setConfirmState({
      id,
      action: 'cancel',
      tone: 'danger',
      title: 'Annuler cette carte ?',
      message:
        'La carte ne sera plus utilisable. Si c’est une erreur, vous pourrez la réactiver ensuite depuis son détail.',
      confirmLabel: 'Annuler la carte',
    })

  const reactivateCard = (id: string) =>
    setConfirmState({
      id,
      action: 'reactivate',
      tone: 'primary',
      title: 'Réactiver cette carte ?',
      message: 'La carte redeviendra immédiatement utilisable, avec le solde restauré.',
      confirmLabel: 'Réactiver',
    })

  const deleteCard = (id: string) =>
    setConfirmState({
      id,
      action: 'delete',
      tone: 'danger',
      title: 'Supprimer cette carte ?',
      message:
        'La carte sera définitivement effacée de la base. Contrairement à l’annulation, cette action est irréversible : elle ne pourra pas être réactivée.',
      confirmLabel: 'Supprimer définitivement',
    })

  // Exécute l'action confirmée. Gère erreurs serveur ET réseau (« Failed to fetch »).
  const runConfirm = async () => {
    if (!confirmState) return
    setConfirmLoading(true)
    setConfirmError(null)
    try {
      // Suppression = DELETE /api/gift-cards/:id ; annuler/réactiver = PATCH .../:action.
      const isDelete = confirmState.action === 'delete'
      const res = await fetch(
        isDelete
          ? `/api/gift-cards/${confirmState.id}`
          : `/api/gift-cards/${confirmState.id}/${confirmState.action}`,
        {
          method: isDelete ? 'DELETE' : 'PATCH',
          headers: authHeaders(),
        }
      )
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d.error || 'Une erreur est survenue.')
      setConfirmState(null)
      setDetail(null)
      load()
    } catch (err) {
      setConfirmError(
        err instanceof TypeError
          ? 'Connexion au serveur impossible. Vérifiez votre connexion et réessayez.'
          : (err as Error).message
      )
    } finally {
      setConfirmLoading(false)
    }
  }

  const closeConfirm = () => {
    if (confirmLoading) return
    setConfirmState(null)
    setConfirmError(null)
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
          <StatCard icon={Wallet} tone="terracotta" label="Valeur en circulation" value={eur(stats.circulating)} />
          <StatCard icon={Sparkles} tone="navy" label="Total émis" value={String(stats.total)} />
          <StatCard icon={Ban} tone="muted" label="Utilisées" value={String(stats.used)} />
        </div>

        {/* Comptabilité — cartes expirées */}
        <ExpiredStatsPanel />

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
              {cards.map((c) => (
                <li key={c._id} className="flex items-stretch">
                  <button
                    onClick={() => setDetail(c)}
                    className="flex min-w-0 flex-1 items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-beige-light sm:px-5"
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
                        {c.expiresAt ? ` · valable jusqu'au ${fmtDate(c.expiresAt)}` : ` · créée le ${fmtDate(c.createdAt)}`}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="font-display text-xl font-medium leading-none text-foreground">
                        {eur(c.balance)}
                      </p>
                      {c.balance !== c.initialAmount && (
                        <p className="mt-0.5 text-[10px] text-foreground/45">
                          sur {eur(c.initialAmount)}
                        </p>
                      )}
                    </div>
                  </button>

                  {/* Suppression définitive (bouton distinct pour ne pas imbriquer de boutons) */}
                  <button
                    onClick={() => deleteCard(c._id)}
                    title="Supprimer définitivement"
                    aria-label={`Supprimer la carte ${c.code}`}
                    className="flex shrink-0 items-center justify-center border-l border-foreground/10 px-4 text-foreground/30 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
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
          onDelete={deleteCard}
        />
      )}
      {confirmState && (
        <ConfirmDialog
          title={confirmState.title}
          message={confirmState.message}
          confirmLabel={confirmState.confirmLabel}
          tone={confirmState.tone}
          icon={confirmState.action === 'delete' ? Trash2 : undefined}
          loading={confirmLoading}
          error={confirmError}
          onConfirm={runConfirm}
          onClose={closeConfirm}
        />
      )}
    </div>
  )
}

/* ---------- Pop-up de confirmation ---------- */
function ConfirmDialog({
  title,
  message,
  confirmLabel,
  tone,
  icon: Icon,
  loading,
  error,
  onConfirm,
  onClose,
}: {
  title: string
  message: string
  confirmLabel: string
  tone: 'danger' | 'primary'
  icon?: React.ComponentType<{ className?: string }>
  loading: boolean
  error: string | null
  onConfirm: () => void
  onClose: () => void
}) {
  const IconCmp = Icon || (tone === 'danger' ? AlertTriangle : RefreshCw)
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-navy/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-[var(--shadow-lg)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <span
            className={cn(
              'flex size-11 shrink-0 items-center justify-center rounded-full',
              tone === 'danger' ? 'bg-red-50 text-red-600' : 'bg-sauge/15 text-sauge-deep'
            )}
          >
            <IconCmp className="size-5" />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-2xl font-medium leading-tight text-foreground">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/65">{message}</p>
          </div>
        </div>

        {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex gap-2.5">
          <button
            onClick={onClose}
            disabled={loading}
            className="h-10 flex-1 rounded-md border border-foreground/20 bg-white text-sm font-medium text-foreground transition-colors hover:bg-beige disabled:opacity-50"
          >
            Retour
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md text-sm font-medium text-white transition-colors disabled:opacity-50',
              tone === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-sauge hover:bg-sauge-deep'
            )}
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
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

/* ---------- Comptabilité : cartes expirées ---------- */
function ExpiredStatsPanel() {
  const [open, setOpen] = useState(false)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<{
    count: number
    totalInitial: number
    totalRemaining: number
  } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const p = new URLSearchParams()
      if (from) p.set('from', from)
      if (to) p.set('to', to)
      const res = await fetch(`/api/gift-cards/expired-stats?${p.toString()}`, {
        headers: authHeaders(),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d.error || 'Erreur')
      setStats(d)
    } catch (err) {
      setError(err instanceof TypeError ? 'Connexion impossible.' : (err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [from, to])

  useEffect(() => {
    if (open && !stats && !loading) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-foreground/10 bg-white shadow-[var(--shadow-sm)]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-beige-light"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Calculator className="size-4 text-sauge-deep" />
          Comptabilité — cartes expirées
        </span>
        <ChevronDown
          className={cn('size-4 text-foreground/50 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="border-t border-foreground/10 p-5">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className={labelCls}>Du (date d&apos;expiration)</label>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Au</label>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} />
            </div>
            <button onClick={load} disabled={loading} className={btnPrimary}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Calculator className="size-4" />}
              Calculer
            </button>
          </div>
          <p className="mt-2 text-xs text-foreground/50">
            Cartes dont la date de validité est dépassée (toujours honorées). Laisser les dates
            vides = toutes les cartes expirées.
          </p>

          {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          {stats && (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-beige-light p-4">
                <p className="text-xs text-foreground/55">Cartes expirées</p>
                <p className="mt-1 font-display text-3xl font-medium text-foreground">{stats.count}</p>
              </div>
              <div className="rounded-lg bg-beige-light p-4">
                <p className="text-xs text-foreground/55">Montant initial total</p>
                <p className="mt-1 font-display text-3xl font-medium text-foreground">
                  {eur(stats.totalInitial)}
                </p>
              </div>
              <div className="rounded-lg bg-beige-light p-4">
                <p className="text-xs text-foreground/55">Solde restant total</p>
                <p className="mt-1 font-display text-3xl font-medium text-foreground">
                  {eur(stats.totalRemaining)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
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

/* ---------- Bloc de section de formulaire ---------- */
function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/45">{title}</p>
      {hint && <p className="mt-0.5 text-xs text-foreground/50">{hint}</p>}
      <div className="mt-2 space-y-3">{children}</div>
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
      <div className="space-y-6">
        {/* Bandeau d'info : visuel de marque compact */}
        <div className="flex items-center gap-3 rounded-lg bg-beige-light p-3">
          <GiftCardVisual className="w-16 shrink-0" />
          <p className="text-xs leading-relaxed text-foreground/60">
            Visuel de marque ARTI. Le <strong className="text-foreground/75">numéro</strong>, le{' '}
            <strong className="text-foreground/75">montant</strong> et la{' '}
            <strong className="text-foreground/75">date de validité</strong> sont remplis sur le PDF
            envoyé par email.
          </p>
        </div>

        <Section title="Carte">
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
          <div>
            <label className={labelCls}>Validité jusqu&apos;au</label>
            <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className={inputCls} />
            <p className="mt-1 text-xs text-foreground/50">Laisser vide = valable 1 an.</p>
          </div>
        </Section>

        <Section title="Acheteur" hint="Reçoit l'email de confirmation si renseigné.">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Nom</label>
              <input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} className={inputCls} />
            </div>
          </div>
        </Section>

        <Section title="Destinataire" hint="Optionnel. Reçoit la carte par email si une adresse est renseignée.">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Nom</label>
              <input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Message</label>
            <input value={message} onChange={(e) => setMessage(e.target.value)} maxLength={200} className={inputCls} placeholder="Mot personnel (figure sur la carte)" />
          </div>
        </Section>

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
  const [amount, setAmount] = useState('')
  const [lookup, setLookup] = useState<{ balance: number; status: string } | null>(null)
  const [looking, setLooking] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ amount: number; balance: number; status: string } | null>(null)

  // Étape 1 : vérifier le solde de la carte.
  const checkCard = async () => {
    setLooking(true)
    setError(null)
    setLookup(null)
    setResult(null)
    try {
      const res = await fetch('/api/gift-cards/check-balance', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ code: code.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Carte introuvable')
      setLookup(data)
      setAmount(String(data.balance))
    } catch (err) {
      setError(
        err instanceof TypeError ? 'Connexion au serveur impossible.' : (err as Error).message
      )
    } finally {
      setLooking(false)
    }
  }

  // Étape 2 : débiter le montant (après confirmation).
  const doRedeem = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/gift-cards/redeem', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          code: code.trim(),
          amount: Number(amount),
          description: description || undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Erreur')
      setConfirming(false)
      setResult(data)
      setLookup(null)
      onDone()
    } catch (err) {
      setError(
        err instanceof TypeError
          ? 'Connexion au serveur impossible. Réessayez.'
          : (err as Error).message
      )
    } finally {
      setSaving(false)
    }
  }

  const amountNum = Number(amount)
  const amountValid = !!lookup && amountNum > 0 && amountNum <= lookup.balance

  return (
    <Modal
      title="Utiliser une carte"
      subtitle="Débit partiel — le solde restant reste utilisable"
      onClose={onClose}
    >
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Code de la carte</label>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase())
                setLookup(null)
                setResult(null)
              }}
              placeholder="GC-XXXX-XXXX"
              className={cn(inputCls, 'font-mono uppercase tracking-wider')}
            />
            <button
              onClick={checkCard}
              disabled={looking || !code.trim()}
              className={cn(btnOutline, 'shrink-0')}
            >
              {looking ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
              Vérifier
            </button>
          </div>
        </div>

        {lookup && (
          <>
            <div className="rounded-lg bg-beige-light px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground/60">Solde disponible</span>
                <span className="font-display text-3xl font-medium leading-none text-foreground">
                  {eur(lookup.balance)}
                </span>
              </div>
              {lookup.status === 'expired' && (
                <p className="mt-1.5 text-xs text-terracotta">
                  Carte expirée — utilisable quand même en interne.
                </p>
              )}
            </div>

            <div>
              <label className={labelCls}>Montant à utiliser</label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={lookup.balance}
                  step="0.5"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={cn(inputCls, 'pr-14')}
                />
                <button
                  type="button"
                  onClick={() => setAmount(String(lookup.balance))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-sauge-deep hover:underline"
                >
                  Tout
                </button>
              </div>
              {amount !== '' && !amountValid && (
                <p className="mt-1 text-xs text-red-600">
                  Le montant doit être entre 0 et {eur(lookup.balance)}.
                </p>
              )}
            </div>

            <div>
              <label className={labelCls}>Note (optionnel)</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={200}
                className={inputCls}
                placeholder="Ex. atelier, achat céramique…"
              />
            </div>

            <button
              onClick={() => {
                setError(null)
                setConfirming(true)
              }}
              disabled={saving || !amountValid}
              className={cn(btnPrimary, 'w-full')}
            >
              <ScanLine className="size-4" />
              Utiliser {amountValid ? eur(amountNum) : ''}
            </button>
          </>
        )}

        {result && (
          <div className="rounded-md bg-sauge/15 px-3 py-2.5 text-sm text-sauge-deep">
            Débité <strong>{eur(result.amount)}</strong>.{' '}
            {result.status === 'used' ? (
              'Carte épuisée (solde 0).'
            ) : (
              <>
                Il reste <strong>{eur(result.balance)}</strong> sur la carte.
              </>
            )}
          </div>
        )}

        {error && !confirming && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}
      </div>

      {confirming && lookup && (
        <ConfirmDialog
          title="Confirmer l'utilisation ?"
          message={`Débiter ${eur(amountNum)} de la carte ${code.trim()}. ${
            amountNum >= lookup.balance
              ? 'La carte sera épuisée.'
              : `Il restera ${eur(lookup.balance - amountNum)}.`
          }`}
          confirmLabel="Confirmer"
          tone="primary"
          icon={ScanLine}
          loading={saving}
          error={error}
          onConfirm={doRedeem}
          onClose={() => {
            if (saving) return
            setConfirming(false)
            setError(null)
          }}
        />
      )}
    </Modal>
  )
}

/* ---------- Détail ---------- */
function DetailModal({
  card,
  onClose,
  onCancel,
  onReactivate,
  onDelete,
}: {
  card: GiftCard
  onClose: () => void
  onCancel: (id: string) => void
  onReactivate: (id: string) => void
  onDelete: (id: string) => void
}) {
  const [pdfBusy, setPdfBusy] = useState<'preview' | 'download' | null>(null)
  const [pdfError, setPdfError] = useState<string | null>(null)

  // Le PDF est protégé par le token admin (en-tête Authorization) : on le
  // récupère donc en fetch puis on l'ouvre/télécharge via une URL blob, plutôt
  // qu'avec un simple lien (qui ne porterait pas le token).
  const openPdf = async (mode: 'preview' | 'download') => {
    setPdfBusy(mode)
    setPdfError(null)
    // Aperçu : on ouvre l'onglet tout de suite (geste utilisateur) pour éviter
    // le blocage des pop-ups, puis on y charge le blob une fois prêt.
    const win = mode === 'preview' ? window.open('', '_blank') : null
    try {
      const res = await fetch(
        `/api/gift-cards/${card._id}/pdf${mode === 'download' ? '?download=1' : ''}`,
        { headers: authHeaders() }
      )
      if (!res.ok) throw new Error('Génération du PDF impossible.')
      const url = URL.createObjectURL(await res.blob())
      if (mode === 'preview' && win) {
        win.location.href = url
      } else {
        const a = document.createElement('a')
        a.href = url
        a.download = `carte-cadeau-${card.code}.pdf`
        document.body.appendChild(a)
        a.click()
        a.remove()
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch (err) {
      if (win) win.close()
      setPdfError(
        err instanceof TypeError
          ? 'Connexion au serveur impossible. Réessayez.'
          : (err as Error).message
      )
    } finally {
      setPdfBusy(null)
    }
  }

  return (
    <Modal title={card.code} subtitle={`Créée le ${fmtDate(card.createdAt)} · ${card.source}`} onClose={onClose}>
      <div className="space-y-5">
        {/* Solde restant + statut */}
        <div className="rounded-xl bg-beige-light p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-foreground/45">
                Solde restant
              </p>
              <p className="mt-1 font-display text-4xl font-medium leading-none text-foreground">
                {eur(card.balance)}
              </p>
              {card.balance !== card.initialAmount && (
                <p className="mt-1.5 text-xs text-foreground/50">
                  sur {eur(card.initialAmount)} au départ
                </p>
              )}
            </div>
            <span
              className={cn(
                'rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
                STATUS_CLASS[card.status]
              )}
            >
              {STATUS_LABEL[card.status]}
            </span>
          </div>
          <p className="mt-3 text-xs text-foreground/55">
            Solde utilisable en plusieurs fois
            {card.expiresAt ? ` · valable jusqu'au ${fmtDate(card.expiresAt)}` : ''}
          </p>
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

        {/* PDF de la carte (le même que celui envoyé par email) */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground/55">
            Carte PDF
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button onClick={() => openPdf('preview')} disabled={!!pdfBusy} className={cn(btnOutline, 'w-full')}>
              {pdfBusy === 'preview' ? <Loader2 className="size-4 animate-spin" /> : <Eye className="size-4" />}
              Aperçu
            </button>
            <button onClick={() => openPdf('download')} disabled={!!pdfBusy} className={cn(btnOutline, 'w-full')}>
              {pdfBusy === 'download' ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
              Télécharger
            </button>
          </div>
          {pdfError && <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{pdfError}</p>}
        </div>

        <div className="space-y-2.5">
          {card.status === 'cancelled' ? (
            <button onClick={() => onReactivate(card._id)} className={cn(btnPrimary, 'w-full')}>
              <RefreshCw className="size-4" /> Réactiver la carte
            </button>
          ) : (
            <button onClick={() => onCancel(card._id)} className={btnDanger}>
              <Ban className="size-4" /> Annuler la carte
            </button>
          )}

          {/* Suppression définitive (irréversible), distincte de l'annulation. */}
          <button
            onClick={() => onDelete(card._id)}
            className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-md text-sm font-medium text-foreground/50 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="size-4" /> Supprimer définitivement
          </button>
        </div>
      </div>
    </Modal>
  )
}
