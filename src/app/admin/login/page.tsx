'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Lock, Mail } from 'lucide-react'

const ease = [0.22, 1, 0.36, 1] as const

const inputCls =
  'h-11 w-full rounded-md border border-foreground/15 bg-beige-light pl-10 pr-3 text-sm text-foreground placeholder:text-foreground/40 focus:border-sauge focus:bg-white focus:outline-none focus:ring-1 focus:ring-sauge'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Identifiants invalides')
      }

      const data = await response.json()
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('authUser', JSON.stringify(data.user))

      router.push('/admin/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen">
      {/* Fond plein écran : visuel de marque */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/brand/hero-cafe.png"
          alt="Le café céramique ARTI à Rennes"
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-navy/80 via-sauge-deep/55 to-sauge/40" />
        {/* Vignette douce pour la lisibilité */}
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_40%,transparent_45%,rgba(27,46,74,0.45)_100%)]" />
      </div>

      {/* Halo de profondeur derrière la carte */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-beige-light/20 blur-[120px]"
      />

      {/* En-tête */}
      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-6 sm:px-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white/80 transition-colors hover:text-white"
        >
          <ArrowLeft className="size-4" /> Retour au site
        </Link>
      </header>

      {/* Carte centrée */}
      <main className="flex min-h-screen items-center justify-center px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="w-full max-w-sm"
        >
          <div className="mb-7 flex flex-col items-center">
            <Image
              src="/brand/logo-arti.png"
              alt="ARTI"
              width={160}
              height={64}
              className="h-12 w-auto object-contain brightness-0 invert"
            />
            <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.32em] text-white/70">
              Café céramique · Rennes
            </p>
          </div>

          <div className="rounded-2xl border border-white/40 bg-white/95 p-7 shadow-[var(--shadow-lg)] backdrop-blur-sm sm:p-8">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-sauge-deep">
              Espace admin
            </p>
            <h1 className="mt-2 font-display text-5xl font-medium leading-none text-foreground">
              Connexion
            </h1>
            <p className="mt-2 text-sm text-foreground/60">
              Connectez-vous pour gérer le contenu du site.
            </p>

            <form onSubmit={handleLogin} className="mt-7 space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-foreground/55"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/40" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="vous@exemple.fr"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-foreground/55"
                >
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/40" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={inputCls}
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600"
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex h-11 w-full items-center justify-center gap-2 rounded-md bg-sauge text-sm font-medium tracking-wide text-white transition-colors hover:bg-sauge-deep disabled:opacity-50"
              >
                {loading ? (
                  'Connexion en cours…'
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </main>

      {/* Pied de page */}
      <footer className="absolute inset-x-0 bottom-0 px-6 py-6 text-center sm:px-10">
        <Link
          href="/politique-de-confidentialite"
          className="text-[11px] text-white/60 transition-colors hover:text-white"
        >
          Politique de confidentialité
        </Link>
      </footer>
    </div>
  )
}
