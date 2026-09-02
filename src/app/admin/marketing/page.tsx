'use client'

import { AlignCenter, ArrowLeft, Check, ExternalLink, Megaphone } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import { ImageField } from '@/components/admin/field-editor'
import { MarketingBannerBar } from '@/components/marketing/banner-bar'
import { MarketingPopupCard } from '@/components/marketing/popup-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { adminFetch, endSession, hasValidSession, messageErreur } from '@/lib/admin-session'
import {
  BANNER_THEMES,
  DEFAULT_MARKETING,
  type MarketingSettings,
  POPUP_THEMES,
  type PopupFrequency,
  type PopupLayout,
  isBannerLive,
  isPopupLive,
  normalizeMarketing,
  raisonNonAffichage,
} from '@/lib/marketing'
import { cn } from '@/lib/utils'

/**
 * Espace admin — Marketing.
 *
 * L'aperçu n'est plus une maquette dessinée à part : il affiche les composants
 * que voient réellement les visiteurs (`MarketingPopupCard`, `MarketingBannerBar`),
 * alimentés par le formulaire en cours de saisie. Ce qui est à l'écran ici est
 * ce qui sera à l'écran sur le site.
 */

type Tab = 'popup' | 'banner'

const LOGO_ARTI = '/brand/logo-arti.png'

const FREQUENCES: { id: PopupFrequency; label: string; aide: string }[] = [
  { id: 'session', label: 'Une fois par visite', aide: 'Refermée, elle revient à la prochaine visite du site.' },
  { id: 'jour', label: 'Une fois par jour', aide: 'Refermée, elle ne revient pas avant 24 h.' },
  { id: 'toujours', label: 'À chaque page', aide: 'Insistant : réservé aux annonces courtes et importantes.' },
]

const MISES_EN_PAGE: { id: PopupLayout; label: string; aide: string }[] = [
  { id: 'centre', label: 'Au centre', aide: 'Impossible à manquer, le reste de la page est assombri.' },
  { id: 'coin', label: 'En bas à droite', aide: 'Discret, le visiteur continue sa lecture.' },
]

export default function AdminMarketingPage() {
  const [settings, setSettings] = useState<MarketingSettings>(DEFAULT_MARKETING)
  const [enregistre, setEnregistre] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'erreur'; texte: string } | null>(null)
  const [tab, setTab] = useState<Tab>('popup')

  useEffect(() => {
    if (!hasValidSession()) endSession()
  }, [])

  useEffect(() => {
    const charger = async () => {
      try {
        // `no-store` : l'admin doit voir l'état réel de la base, jamais une
        // réponse gardée en cache par le navigateur ou le CDN.
        const res = await fetch('/api/marketing', { cache: 'no-store' })
        const data = await res.json()
        const reglages = normalizeMarketing(data)
        setSettings(reglages)
        setEnregistre(JSON.stringify(reglages))
      } catch {
        setMessage({ type: 'erreur', texte: 'Impossible de charger les réglages actuels.' })
      } finally {
        setLoading(false)
      }
    }
    charger()
  }, [])

  const modifie = useMemo(
    () => enregistre !== '' && JSON.stringify(settings) !== enregistre,
    [settings, enregistre]
  )

  const patch = (p: Partial<MarketingSettings>) => setSettings((s) => ({ ...s, ...p }))
  const patchBanner = (p: Partial<MarketingSettings['banner']>) =>
    setSettings((s) => ({ ...s, banner: { ...s.banner, ...p } }))

  const enregistrer = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const res = await adminFetch('/api/marketing', {
        method: 'PUT',
        body: JSON.stringify(settings),
      })
      // Un enregistrement refusé ne doit pas passer pour un succès.
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Enregistrement impossible.')
      }
      const sauve = normalizeMarketing(await res.json())
      setSettings(sauve)
      setEnregistre(JSON.stringify(sauve))
      setMessage({ type: 'ok', texte: 'Enregistré. Le site est à jour dans la minute.' })
    } catch (error) {
      const texte = messageErreur(error)
      if (texte) setMessage({ type: 'erreur', texte })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Chargement…</div>
  }

  const empeche = raisonNonAffichage(settings)
  const popupEnLigne = isPopupLive(settings)
  const banniereEnLigne = isBannerLive(settings)

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* ---------------------------------------------------------- */}
      {/* En-tête                                                     */}
      {/* ---------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-8 md:pt-0">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard"
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-foreground">Marketing</h1>
            <p className="text-xs text-muted-foreground">
              Popup et bandeau d&apos;annonce affichés aux visiteurs du site
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/?apercu-popup=1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
            title="Ouvre le site et force l'affichage de la popup enregistrée"
          >
            <ExternalLink className="size-4" />
            Tester sur le site
          </a>
          <Button onClick={enregistrer} disabled={saving} className="gap-2">
            <Check className="size-4" />
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      {/* Bandeau d'état : dit à voix haute pourquoi la popup se voit ou non */}
      <div
        className={cn(
          'flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border px-4 py-3 text-sm',
          popupEnLigne
            ? 'border-primary/30 bg-primary/5 text-foreground'
            : 'border-border/60 bg-muted/40 text-muted-foreground'
        )}
      >
        <span
          className={cn(
            'inline-flex items-center gap-2 font-semibold',
            popupEnLigne ? 'text-primary' : ''
          )}
        >
          <span
            className={cn(
              'size-2 rounded-full',
              popupEnLigne ? 'bg-primary' : 'bg-muted-foreground/40'
            )}
          />
          {popupEnLigne ? 'Popup en ligne' : 'Popup hors ligne'}
        </span>
        <span>{empeche ?? `Elle apparaît après ${settings.delay} s sur le site.`}</span>
        {modifie && (
          <span className="ml-auto text-xs font-medium text-accent">
            Modifications non enregistrées : « Tester sur le site » montre la version enregistrée.
          </span>
        )}
      </div>

      {message && (
        <div
          className={cn(
            'rounded-xl border px-4 py-3 text-sm',
            message.type === 'ok'
              ? 'border-primary/30 bg-primary/5 text-foreground'
              : 'border-destructive/30 bg-destructive/5 text-destructive'
          )}
        >
          {message.texte}
        </div>
      )}

      {/* Onglets */}
      <div className="inline-flex items-center gap-1 rounded-lg bg-muted/60 p-1">
        <button
          onClick={() => setTab('popup')}
          className={cn(
            'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            tab === 'popup' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Megaphone className="size-4" />
          Popup
          {popupEnLigne && <span className="size-1.5 rounded-full bg-primary" />}
        </button>
        <button
          onClick={() => setTab('banner')}
          className={cn(
            'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            tab === 'banner' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <AlignCenter className="size-4" />
          Bandeau
          {banniereEnLigne && <span className="size-1.5 rounded-full bg-primary" />}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        {/* ---------------------------------------------------------- */}
        {/* Colonne formulaire                                          */}
        {/* ---------------------------------------------------------- */}
        <div className="order-2 space-y-6 lg:order-1">
          {tab === 'popup' ? (
            <>
              <Bloc titre="Affichage">
                <Interrupteur
                  actif={settings.enabled}
                  onChange={(v) => patch({ enabled: v })}
                  libelle={settings.enabled ? 'Popup activée' : 'Popup désactivée'}
                  aide="Rien ne s'affiche sur le site tant que cet interrupteur est éteint."
                />
              </Bloc>

              <Bloc titre="Contenu">
                <Champ label="Titre">
                  <Input
                    value={settings.title}
                    onChange={(e) => patch({ title: e.target.value })}
                    placeholder="Atelier du dimanche"
                  />
                </Champ>

                <Champ label="Texte" aide="Les retours à la ligne sont conservés à l'écran.">
                  <textarea
                    value={settings.description}
                    onChange={(e) => patch({ description: e.target.value })}
                    rows={6}
                    placeholder="Décrivez votre offre ou votre événement…"
                    className="w-full min-w-0 resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  />
                </Champ>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Champ label="Texte du bouton" aide="Laissez vide pour une annonce sans bouton.">
                    <Input
                      value={settings.buttonText}
                      onChange={(e) => patch({ buttonText: e.target.value })}
                      placeholder="Réserver ma place"
                    />
                  </Champ>
                  <Champ label="Lien du bouton" aide="Une page du site (/infos-pratiques) ou une adresse complète.">
                    <Input
                      value={settings.buttonLink}
                      onChange={(e) => patch({ buttonLink: e.target.value })}
                      placeholder="/infos-pratiques"
                    />
                  </Champ>
                </div>

                <ImageField
                  label="Image (optionnelle)"
                  value={settings.imageUrl}
                  onChange={(v) => patch({ imageUrl: v })}
                />

                <div className="space-y-2">
                  <ImageField
                    label="Logo (optionnel)"
                    value={settings.logoUrl}
                    onChange={(v) => patch({ logoUrl: v })}
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => patch({ logoUrl: LOGO_ARTI })}
                      className="rounded-md border border-border/60 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                    >
                      Utiliser le logo ARTI
                    </button>
                    {settings.logoUrl && (
                      <button
                        type="button"
                        onClick={() => patch({ logoUrl: '' })}
                        className="rounded-md border border-border/60 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                      >
                        Retirer le logo
                      </button>
                    )}
                  </div>
                </div>
              </Bloc>

              <Bloc titre="Apparence">
                <Champ label="Thème" aide="Accords de couleurs tirés de la charte du site.">
                  <div className="flex flex-wrap gap-2">
                    {POPUP_THEMES.map((t) => {
                      const actif =
                        settings.bgColor.toLowerCase() === t.bgColor.toLowerCase() &&
                        settings.textColor.toLowerCase() === t.textColor.toLowerCase() &&
                        settings.buttonColor.toLowerCase() === t.buttonColor.toLowerCase()
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() =>
                            patch({ bgColor: t.bgColor, textColor: t.textColor, buttonColor: t.buttonColor })
                          }
                          className={cn(
                            'flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors',
                            actif
                              ? 'border-primary bg-primary/10 text-foreground'
                              : 'border-border/60 text-muted-foreground hover:text-foreground'
                          )}
                        >
                          <span
                            className="size-4 rounded-full border border-black/10"
                            style={{ backgroundColor: t.bgColor }}
                          />
                          <span
                            className="-ml-3.5 size-4 rounded-full border border-black/10"
                            style={{ backgroundColor: t.buttonColor }}
                          />
                          {t.label}
                        </button>
                      )
                    })}
                  </div>
                </Champ>

                <div className="grid grid-cols-3 gap-4">
                  <Couleur
                    label="Fond"
                    value={settings.bgColor}
                    onChange={(v) => patch({ bgColor: v })}
                  />
                  <Couleur
                    label="Texte"
                    value={settings.textColor}
                    onChange={(v) => patch({ textColor: v })}
                  />
                  <Couleur
                    label="Bouton"
                    value={settings.buttonColor}
                    onChange={(v) => patch({ buttonColor: v })}
                  />
                </div>

                <Champ label="Mise en page">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {MISES_EN_PAGE.map((m) => (
                      <Choix
                        key={m.id}
                        actif={settings.layout === m.id}
                        onClick={() => patch({ layout: m.id })}
                        titre={m.label}
                        aide={m.aide}
                      />
                    ))}
                  </div>
                </Champ>
              </Bloc>

              <Bloc titre="Diffusion">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Champ label="Délai avant apparition" aide="En secondes, après l'ouverture d'une page.">
                    <Input
                      type="number"
                      min={0}
                      max={60}
                      value={settings.delay}
                      onChange={(e) => patch({ delay: Number(e.target.value) })}
                    />
                  </Champ>
                </div>

                <Champ label="Fréquence">
                  <div className="grid gap-2 sm:grid-cols-3">
                    {FREQUENCES.map((f) => (
                      <Choix
                        key={f.id}
                        actif={settings.frequency === f.id}
                        onClick={() => patch({ frequency: f.id })}
                        titre={f.label}
                        aide={f.aide}
                      />
                    ))}
                  </div>
                </Champ>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Champ label="Début (optionnel)" aide="Avant cette date, rien ne s'affiche.">
                    <Input
                      type="date"
                      value={settings.startDate}
                      onChange={(e) => patch({ startDate: e.target.value })}
                    />
                  </Champ>
                  <Champ label="Fin (optionnel)" aide="Dernier jour d'affichage, inclus.">
                    <Input
                      type="date"
                      value={settings.endDate}
                      onChange={(e) => patch({ endDate: e.target.value })}
                    />
                  </Champ>
                </div>
                {(settings.startDate || settings.endDate) && (
                  <button
                    type="button"
                    onClick={() => patch({ startDate: '', endDate: '' })}
                    className="text-xs font-medium text-muted-foreground underline-offset-2 hover:underline"
                  >
                    Retirer les dates (diffusion permanente)
                  </button>
                )}
              </Bloc>
            </>
          ) : (
            <>
              <Bloc titre="Affichage">
                <Interrupteur
                  actif={settings.banner.enabled}
                  onChange={(v) => patchBanner({ enabled: v })}
                  libelle={settings.banner.enabled ? 'Bandeau activé' : 'Bandeau désactivé'}
                  aide="Le bandeau se place tout en haut, au-dessus du menu."
                />
              </Bloc>

              <Bloc titre="Contenu">
                <Champ label="Texte">
                  <Input
                    value={settings.banner.text}
                    onChange={(e) => patchBanner({ text: e.target.value })}
                    placeholder="Atelier linogravure le 20 septembre, réservez votre place"
                  />
                </Champ>
                <Champ label="Lien (optionnel)" aide="Laissez vide pour un bandeau non cliquable.">
                  <Input
                    value={settings.banner.link}
                    onChange={(e) => patchBanner({ link: e.target.value })}
                    placeholder="/infos-pratiques"
                  />
                </Champ>
              </Bloc>

              <Bloc titre="Apparence">
                <Champ label="Thème">
                  <div className="flex flex-wrap gap-2">
                    {BANNER_THEMES.map((t) => {
                      const actif =
                        settings.banner.bgColor.toLowerCase() === t.bgColor.toLowerCase() &&
                        settings.banner.textColor.toLowerCase() === t.textColor.toLowerCase()
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => patchBanner({ bgColor: t.bgColor, textColor: t.textColor })}
                          className={cn(
                            'flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors',
                            actif
                              ? 'border-primary bg-primary/10 text-foreground'
                              : 'border-border/60 text-muted-foreground hover:text-foreground'
                          )}
                        >
                          <span
                            className="size-4 rounded-full border border-black/10"
                            style={{ backgroundColor: t.bgColor }}
                          />
                          {t.label}
                        </button>
                      )
                    })}
                  </div>
                </Champ>

                <div className="grid grid-cols-2 gap-4">
                  <Couleur
                    label="Fond"
                    value={settings.banner.bgColor}
                    onChange={(v) => patchBanner({ bgColor: v })}
                  />
                  <Couleur
                    label="Texte"
                    value={settings.banner.textColor}
                    onChange={(v) => patchBanner({ textColor: v })}
                  />
                </div>
              </Bloc>

              <p className="text-xs text-muted-foreground">
                Les dates de diffusion réglées dans l&apos;onglet « Popup » s&apos;appliquent aussi au
                bandeau.
              </p>
            </>
          )}

          <Button onClick={enregistrer} disabled={saving} className="w-full gap-2">
            <Check className="size-4" />
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </div>

        {/* ---------------------------------------------------------- */}
        {/* Colonne aperçu                                              */}
        {/* ---------------------------------------------------------- */}
        <div className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                Aperçu en direct
              </p>
              <p className="text-[10px] text-muted-foreground/60">Ce que voit le visiteur</p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border/60 bg-beige shadow-sm">
              {/* Bandeau, à sa vraie place : au-dessus du menu */}
              {settings.banner.enabled && (
                <MarketingBannerBar settings={settings} preview />
              )}

              {/* Menu du site, esquissé, pour situer le bandeau */}
              <div className="flex items-center justify-between border-b border-navy/5 px-4 py-3">
                <span className="text-[10px] text-navy/40">☰</span>
                <span className="font-serif text-sm tracking-[0.2em] text-navy/70">ARTI</span>
                <span className="text-[10px] text-navy/40">Réserver</span>
              </div>

              {/* Scène : la popup posée sur la page */}
              <div
                className={cn(
                  'relative flex min-h-[420px] p-4',
                  settings.layout === 'coin' ? 'items-end justify-end' : 'items-center justify-center',
                  settings.layout === 'centre' && 'bg-navy/40'
                )}
              >
                {settings.layout === 'centre' && (
                  <div className="pointer-events-none absolute inset-0 backdrop-blur-[2px]" />
                )}
                <div className="relative z-10 w-full max-w-[330px]">
                  <MarketingPopupCard
                    settings={settings}
                    onClose={() => {}}
                    compact
                    preview
                  />
                </div>
              </div>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              L&apos;aperçu utilise le composant réel du site : ce qui est affiché ici est ce qui
              s&apos;affichera. Sur le site, la popup apparaît après{' '}
              <strong className="font-semibold text-foreground">{settings.delay} s</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Petites briques d'interface                                         */
/* ------------------------------------------------------------------ */

function Bloc({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/40 bg-card">
      <div className="border-b border-border/40 bg-muted/30 px-5 py-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
          {titre}
        </h3>
      </div>
      <div className="space-y-5 p-5">{children}</div>
    </div>
  )
}

function Champ({
  label,
  aide,
  children,
}: {
  label: string
  aide?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
      {aide && <p className="text-[11px] text-muted-foreground/60">{aide}</p>}
    </div>
  )
}

function Interrupteur({
  actif,
  onChange,
  libelle,
  aide,
}: {
  actif: boolean
  onChange: (v: boolean) => void
  libelle: string
  aide: string
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-foreground">{libelle}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground/70">{aide}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={actif}
        aria-label={libelle}
        onClick={() => onChange(!actif)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors',
          actif ? 'bg-primary' : 'bg-muted-foreground/30'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform',
            actif && 'translate-x-5'
          )}
        />
      </button>
    </div>
  )
}

function Couleur({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className="size-9 shrink-0 cursor-pointer rounded-lg border border-input bg-transparent"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-xs"
        />
      </div>
    </div>
  )
}

function Choix({
  actif,
  onClick,
  titre,
  aide,
}: {
  actif: boolean
  onClick: () => void
  titre: string
  aide: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-lg border p-3 text-left transition-colors',
        actif ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-border'
      )}
    >
      <span className="block text-sm font-medium text-foreground">{titre}</span>
      <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground/70">{aide}</span>
    </button>
  )
}
