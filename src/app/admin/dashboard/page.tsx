'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Home,
  Phone,
  MessageSquare,
  Images,
  ArrowRight,
  FileText,
  Database,
  Gift,
} from 'lucide-react'

interface AdminUser {
  email: string
  name?: string
}

const modules = [
  { href: '/admin/pages/accueil', label: 'Accueil', desc: 'Bandeau d’accueil (hero)', icon: Home },
  { href: '/admin/pages/infos-pratiques', label: 'Infos pratiques', desc: 'En-tête, carte, FAQ', icon: Phone },
  { href: '/admin/pages/faq', label: 'FAQ', desc: 'Questions / réponses', icon: MessageSquare },
  { href: '/admin/gallery', label: 'Galerie', desc: 'Photos du site', icon: Images },
  { href: '/admin/blog', label: 'Blog', desc: 'Articles et actualités', icon: FileText },
  { href: '/admin/gift-cards', label: 'Cartes cadeaux', desc: 'Vendre, créer et utiliser', icon: Gift },
]

export default function AdminDashboardPage() {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [seedDone, setSeedDone] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const userStr = localStorage.getItem('authUser')

    if (!token || !userStr) {
      router.push('/admin/login')
      return
    }

    try {
      setUser(JSON.parse(userStr))
    } catch {
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  if (loading || !user) return null

  const firstName = user.name?.split(' ')[0] || 'admin'

  const runSeed = async () => {
    setSeeding(true)
    try {
      const token = localStorage.getItem('authToken')
      const res = await fetch('/api/seed', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setSeedDone(true)
      else alert('Erreur lors du seed')
    } catch {
      alert('Erreur réseau')
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="min-h-screen bg-beige-light/50">
      {/* En-tête */}
      <header className="border-b border-foreground/10 bg-white">
        <div className="mx-auto max-w-6xl px-5 pb-8 pt-16 sm:px-8 sm:pt-12">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-sauge-deep">
            Espace admin
          </p>
          <h1 className="mt-1 font-display text-5xl font-medium leading-none text-foreground sm:text-6xl">
            Bonjour {firstName}
          </h1>
          <p className="mt-2 text-sm text-foreground/60">
            Gérez le contenu de votre site depuis cet espace.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        {/* Modules */}
        <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/50">
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

        {/* Données d'exemple */}
        {!seedDone && (
          <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-xl border border-dashed border-sauge/40 bg-beige-light p-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sauge/15 text-sauge-deep">
                <Database className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">Données d&apos;exemple</p>
                <p className="text-xs text-foreground/55">
                  Ajouter des photos galerie et articles blog pour tester le template.
                </p>
              </div>
            </div>
            <button
              onClick={runSeed}
              disabled={seeding}
              className="w-full shrink-0 rounded-md bg-sauge px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sauge-deep disabled:opacity-50 sm:w-auto"
            >
              {seeding ? 'Chargement…' : 'Charger les données'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
