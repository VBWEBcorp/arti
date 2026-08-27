'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  Ban,
  FileText,
  Gift,
  Home,
  Images,
  Loader2,
  MessageSquare,
  Phone,
  Sparkles,
  Store,
  Wallet,
} from 'lucide-react'

import { adminFetch, endSession, getUser, hasValidSession, messageErreur } from '@/lib/admin-session'
import { cn } from '@/lib/utils'

const modules = [
  { href: '/admin/pages/accueil', label: 'Accueil', desc: 'Bandeau d’accueil (hero)', icon: Home },
  { href: '/admin/pages/infos-pratiques', label: 'Infos pratiques', desc: 'En-tête, carte, FAQ', icon: Phone },
  { href: '/admin/pages/faq', label: 'FAQ', desc: 'Questions / réponses', icon: MessageSquare },
  { href: '/admin/gallery', label: 'Galerie', desc: 'Photos du site', icon: Images },
  { href: '/admin/blog', label: 'Blog', desc: 'Articles et actualités', icon: FileText },
  { href: '/admin/gift-cards', label: 'Cartes cadeaux', desc: 'Vendre, créer et utiliser', icon: Gift },
]

type GiftCard = {
  _id: string
  code: string
  initialAmount: number
  balance: number
  status: 'active' | 'used' | 'expired' | 'cancelled'
  source: string
  purchasedBy?: { name?: string; email?: string }
  recipient?: { name?: string; email?: string }
  createdAt: string
}

const eur = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)

const fmtDate = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' })
    : '—'

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

// « En ligne » = achat payé sur le site ; tout le reste (comptoir, avoir,
// avantage) = « En magasin ». Même règle que la page Cartes cadeaux.
const isOnline = (c: GiftCard) => c.source === 'online'

export default function AdminDashboardPage() {
  const [name, setName] = useState('admin')
  const [cards, setCards] = useState<GiftCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCards = useCallback(async () => {
    setLoading(true)
    try {
      // Limite large : le récapitulatif porte sur l'ensemble des cartes, pas
      // sur une page de résultats.
      // adminFetch traite lui-même la session expirée (purge + reconnexion).
      const res = await adminFetch('/api/gift-cards?limit=1000')
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Chargement impossible.')
      setCards(data.giftCards || [])
      setError(null)
    } catch (err) {
      setError(messageErreur(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Le layout admin a déjà écarté les sessions expirées ; ce garde-fou évite
    // simplement un appel voué au 401 si le jeton meurt entre-temps.
    if (!hasValidSession()) {
      endSession()
      return
    }
    setName(getUser()?.name?.split(' ')[0] || 'admin')
    loadCards()
  }, [loadCards])

  const stats = useMemo(() => {
    const active = cards.filter((c) => c.status === 'active')
    const online = cards.filter(isOnline)
    const shop = cards.filter((c) => !isOnline(c))
    const sum = (a: GiftCard[]) => a.reduce((s, c) => s + c.initialAmount, 0)
    return {
      total: cards.length,
      activeCount: active.length,
      circulating: active.reduce((s, c) => s + c.balance, 0),
      used: cards.filter((c) => c.status === 'used').length,
      onlineCount: online.length,
      onlineTotal: sum(online),
      shopCount: shop.length,
      shopTotal: sum(shop),
      emitted: sum(cards),
    }
  }, [cards])

  // Les 8 dernières cartes : l'historique récent, directement sous les yeux.
  const recent = useMemo(
    () =>
      [...cards]
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        .slice(0, 8),
    [cards]
  )

  return (
    <div className="min-h-screen bg-beige-light/50">
      {/* En-tête */}
      <header className="border-b border-foreground/10 bg-white">
        <div className="mx-auto max-w-6xl px-5 pb-8 pt-16 sm:px-8 sm:pt-12">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-sauge-deep">
            Espace admin
          </p>
          <h1 className="mt-1 font-display text-5xl font-medium leading-none text-foreground sm:text-6xl">
            Bonjour {name}
          </h1>
          <p className="mt-2 text-sm text-foreground/60">
            Gérez le contenu de votre site depuis cet espace.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        {/* ───────── Cartes cadeaux ───────── */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/50">
            Vos cartes cadeaux
          </h2>
          <Link
            href="/admin/gift-cards"
            className="inline-flex items-center gap-1 text-xs font-medium text-sauge-deep hover:underline"
          >
            Tout gérer <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {error && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="flex items-center gap-2">
              <AlertTriangle className="size-4 shrink-0" /> {error}
            </span>
            <button onClick={loadCards} className="font-medium underline underline-offset-2">
              Réessayer
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-foreground/10 bg-white py-16 text-sm text-foreground/60 shadow-[var(--shadow-sm)]">
            <Loader2 className="size-4 animate-spin" /> Chargement de vos cartes cadeaux…
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              <StatCard icon={Gift} tone="sauge" label="Cartes actives" value={String(stats.activeCount)} />
              <StatCard
                icon={Wallet}
                tone="terracotta"
                label="Valeur en circulation"
                value={eur(stats.circulating)}
              />
              <StatCard
                icon={Sparkles}
                tone="navy"
                label="Total émis"
                value={eur(stats.emitted)}
                hint={`${stats.total} carte${stats.total > 1 ? 's' : ''}`}
              />
              <StatCard icon={Ban} tone="muted" label="Utilisées" value={String(stats.used)} />
            </div>

            {/* Répartition par canal */}
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <ChannelCard
                icon={Gift}
                label="En ligne"
                hint="Achats payés sur le site"
                count={stats.onlineCount}
                total={stats.onlineTotal}
                tone="sauge"
              />
              <ChannelCard
                icon={Store}
                label="En magasin"
                hint="Comptoir, avoirs, avantages…"
                count={stats.shopCount}
                total={stats.shopTotal}
                tone="navy"
              />
            </div>

            {/* Dernières cartes */}
            <div className="mt-4 overflow-hidden rounded-xl border border-foreground/10 bg-white shadow-[var(--shadow-sm)]">
              <div className="flex items-center justify-between border-b border-foreground/10 px-4 py-3">
                <p className="text-sm font-semibold text-foreground">Dernières cartes</p>
                <Link
                  href="/admin/gift-cards"
                  className="inline-flex items-center gap-1 text-xs font-medium text-sauge-deep hover:underline"
                >
                  Voir toute la liste <ArrowRight className="size-3.5" />
                </Link>
              </div>

              {recent.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-14 text-center">
                  <span className="flex size-12 items-center justify-center rounded-full bg-beige text-sauge-deep">
                    <Gift className="size-5" />
                  </span>
                  <p className="text-sm text-foreground/60">Aucune carte cadeau pour le moment.</p>
                </div>
              ) : (
                <ul className="divide-y divide-foreground/10">
                  {recent.map((c) => (
                    <li key={c._id}>
                      <Link
                        href="/admin/gift-cards"
                        className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 transition-colors hover:bg-beige-light/70"
                      >
                        <span className="font-mono text-sm font-semibold tracking-wide text-foreground">
                          {c.code}
                        </span>
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-[11px] font-medium',
                            STATUS_CLASS[c.status] || 'bg-foreground/10 text-foreground/60'
                          )}
                        >
                          {STATUS_LABEL[c.status] || c.status}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm text-foreground/70">
                          {c.purchasedBy?.name || c.purchasedBy?.email || 'Vente au comptoir'}
                        </span>
                        <span className="text-[11px] uppercase tracking-wide text-foreground/45">
                          {isOnline(c) ? 'En ligne' : 'En magasin'}
                        </span>
                        <span className="text-xs text-foreground/50">{fmtDate(c.createdAt)}</span>
                        <span className="w-20 text-right text-sm font-semibold text-foreground">
                          {eur(c.initialAmount)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        {/* ───────── Modules ───────── */}
        <h2 className="mb-4 mt-10 text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/50">
          Gérer le site
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => {
            const Icon = mod.icon
            return (
              <Link
                key={mod.href}
                href={mod.href}
                className="group flex items-center gap-4 rounded-xl border border-foreground/10 bg-white p-4 shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:border-sauge/40 hover:shadow-[var(--shadow-md)]"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-sauge/15 text-sauge-deep transition-colors group-hover:bg-sauge group-hover:text-white">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{mod.label}</p>
                  <p className="truncate text-xs text-foreground/55">{mod.desc}</p>
                </div>
                <ArrowRight className="size-4 text-foreground/30 transition-all group-hover:translate-x-0.5 group-hover:text-sauge-deep" />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ---------- Briques d'affichage ---------- */

const TONES = {
  sauge: 'bg-sauge/15 text-sauge-deep',
  terracotta: 'bg-terracotta/15 text-terracotta',
  navy: 'bg-navy/10 text-navy',
  muted: 'bg-foreground/10 text-foreground/55',
} as const

function StatCard({
  icon: Icon,
  tone,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>
  tone: keyof typeof TONES
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-xl border border-foreground/10 bg-white p-4 shadow-[var(--shadow-sm)]">
      <span className={cn('flex size-9 items-center justify-center rounded-lg', TONES[tone])}>
        <Icon className="size-4" />
      </span>
      <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-foreground/50">
        {label}
      </p>
      <p className="mt-0.5 text-2xl font-semibold leading-tight text-foreground">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-foreground/45">{hint}</p>}
    </div>
  )
}

function ChannelCard({
  icon: Icon,
  label,
  hint,
  count,
  total,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  hint: string
  count: number
  total: number
  tone: keyof typeof TONES
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-foreground/10 bg-white p-4 shadow-[var(--shadow-sm)]">
      <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-lg', TONES[tone])}>
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="truncate text-xs text-foreground/55">{hint}</p>
      </div>
      <div className="text-right">
        <p className="text-lg font-semibold leading-tight text-foreground">{eur(total)}</p>
        <p className="text-xs text-foreground/50">
          {count} carte{count > 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}
