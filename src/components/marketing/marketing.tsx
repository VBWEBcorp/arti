'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'

import { MarketingBannerBar } from '@/components/marketing/banner-bar'
import { MarketingPopupCard } from '@/components/marketing/popup-card'
import {
  type MarketingSettings,
  classesLargeurPopup,
  isBannerLive,
  isPopupLive,
  normalizeMarketing,
} from '@/lib/marketing'
import { cn } from '@/lib/utils'

/**
 * Bandeau d'annonce + popup marketing sur le site public.
 *
 * C'est LE point de montage : sans ce composant dans l'ossature du site, les
 * réglages enregistrés dans l'espace admin n'atteignaient personne — la popup
 * existait en base et n'était affichée nulle part.
 *
 * Un seul appel à /api/marketing alimente les deux (le bandeau et la popup
 * partagent le même enregistrement).
 *
 * Mode test : ouvrir n'importe quelle page avec `?apercu-popup=1` force
 * l'affichage immédiat, même désactivée, même déjà fermée, sans rien mémoriser.
 * C'est le bouton « Tester sur le site » de l'espace admin.
 */

const CLE_POPUP = 'arti-popup'
const CLE_BANNIERE = 'arti-banniere'

/** Mémoire de fermeture : selon la fréquence choisie, la session ou la journée. */
function dejaFerme(cle: string, frequence: MarketingSettings['frequency'], campagne: string): boolean {
  if (frequence === 'toujours') return false
  try {
    if (frequence === 'session') {
      return sessionStorage.getItem(`${cle}:${campagne}`) !== null
    }
    const jusqua = localStorage.getItem(`${cle}:${campagne}`)
    return jusqua !== null && Date.now() < Number(jusqua)
  } catch {
    // Navigation privée ou stockage refusé : on n'empêche pas l'affichage.
    return false
  }
}

function memoriserFermeture(cle: string, frequence: MarketingSettings['frequency'], campagne: string): void {
  if (frequence === 'toujours') return
  try {
    if (frequence === 'session') {
      sessionStorage.setItem(`${cle}:${campagne}`, '1')
    } else {
      localStorage.setItem(`${cle}:${campagne}`, String(Date.now() + 24 * 60 * 60 * 1000))
    }
  } catch {
    // Sans stockage, la popup réapparaîtra : ce n'est pas une raison de casser.
  }
}

export function Marketing() {
  const [settings, setSettings] = useState<MarketingSettings | null>(null)
  const [campagne, setCampagne] = useState('')
  const [test, setTest] = useState(false)
  const [popupVisible, setPopupVisible] = useState(false)
  const [banniereVisible, setBanniereVisible] = useState(false)
  const carteRef = useRef<HTMLDivElement>(null)

  /* ---------------------------------------------------------------- */
  /* Chargement des réglages                                          */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    let annule = false
    const modeTest = new URLSearchParams(window.location.search).get('apercu-popup') === '1'
    setTest(modeTest)

    const charger = async () => {
      try {
        // En mode test on court-circuite le cache du CDN : la gérante doit voir
        // sa dernière modification, pas la version d'il y a une minute.
        const res = await fetch('/api/marketing', modeTest ? { cache: 'no-store' } : {})
        if (!res.ok) return
        const brut = await res.json()
        if (annule) return

        const reglages = normalizeMarketing(brut)
        // La campagne change dès que la boutique modifie son message : les
        // visiteurs qui avaient fermé l'ancien voient le nouveau.
        const signature = String(brut?.updatedAt ?? reglages.title).slice(0, 40)
        setSettings(reglages)
        setCampagne(signature)

        const banniereOuverte =
          isBannerLive(reglages) &&
          (modeTest || !dejaFerme(CLE_BANNIERE, reglages.frequency, signature))
        setBanniereVisible(banniereOuverte)
      } catch {
        // Le marketing ne doit jamais empêcher le site de fonctionner.
      }
    }

    charger()
    return () => {
      annule = true
    }
  }, [])

  /* ---------------------------------------------------------------- */
  /* Apparition de la popup après le délai réglé                      */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (!settings) return
    if (!test && !isPopupLive(settings)) return
    if (!test && dejaFerme(CLE_POPUP, settings.frequency, campagne)) return

    const delai = test ? 0 : settings.delay * 1000
    const minuteur = setTimeout(() => setPopupVisible(true), delai)
    return () => clearTimeout(minuteur)
  }, [settings, campagne, test])

  const fermerPopup = useCallback(() => {
    setPopupVisible(false)
    if (!test && settings) memoriserFermeture(CLE_POPUP, settings.frequency, campagne)
  }, [settings, campagne, test])

  const fermerBanniere = useCallback(() => {
    setBanniereVisible(false)
    if (!test && settings) memoriserFermeture(CLE_BANNIERE, settings.frequency, campagne)
  }, [settings, campagne, test])

  /* ---------------------------------------------------------------- */
  /* Clavier + défilement pendant que la modale est ouverte            */
  /* ---------------------------------------------------------------- */
  const modale = popupVisible && settings?.layout === 'centre'

  useEffect(() => {
    if (!popupVisible) return

    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fermerPopup()
    }
    document.addEventListener('keydown', surTouche)

    // Le focus part sur la carte : au clavier comme au lecteur d'écran, on
    // arrive dans la popup et non derrière elle.
    carteRef.current?.focus()

    const overflow = document.body.style.overflow
    if (modale) document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', surTouche)
      if (modale) document.body.style.overflow = overflow
    }
  }, [popupVisible, modale, fermerPopup])

  if (!settings) return null

  const coin = settings.layout === 'coin'

  return (
    <>
      {/* Bandeau — dans le flux, juste au-dessus de la barre de navigation */}
      <AnimatePresence initial={false}>
        {banniereVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <MarketingBannerBar settings={settings} onClose={fermerBanniere} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popup */}
      <AnimatePresence>
        {popupVisible && (
          <div
            className={
              coin
                ? 'pointer-events-none fixed inset-0 z-[120] flex items-end justify-center p-3 sm:justify-end sm:p-6'
                : 'fixed inset-0 z-[120] flex items-center justify-center p-4'
            }
            onClick={coin ? undefined : fermerPopup}
          >
            {!coin && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-navy/50 backdrop-blur-[3px]"
              />
            )}

            <motion.div
              ref={carteRef}
              role="dialog"
              aria-modal={coin ? undefined : true}
              aria-label={settings.title || 'Message de la boutique'}
              tabIndex={-1}
              initial={coin ? { opacity: 0, y: 24 } : { opacity: 0, scale: 0.92, y: 24 }}
              animate={coin ? { opacity: 1, y: 0 } : { opacity: 1, scale: 1, y: 0 }}
              exit={coin ? { opacity: 0, y: 16 } : { opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                'pointer-events-auto relative z-10 w-full outline-none',
                // La carte gère elle-même sa hauteur et son défilement : le
                // cadre ne fait que lui donner sa largeur.
                coin ? 'max-w-[420px]' : classesLargeurPopup(settings)
              )}
            >
              <MarketingPopupCard settings={settings} onClose={fermerPopup} compact={coin} />

              {test && (
                <p className="mt-3 text-center text-[11px] font-medium tracking-wide text-white/80">
                  Aperçu forcé (visible seulement avec ?apercu-popup=1)
                </p>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
