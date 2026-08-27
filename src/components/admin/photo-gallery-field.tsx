'use client'

import { useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Star, Trash2 } from 'lucide-react'

import { adminFetch, messageErreur } from '@/lib/admin-session'
import { cn } from '@/lib/utils'

/**
 * Champ galerie : gère une liste d'URLs d'images.
 * - Upload multiple (sélection de plusieurs fichiers d'un coup) + glisser-déposer.
 * - Réordonnancement (flèches) et suppression au survol de chaque vignette.
 * - La première photo est la couverture.
 */
export function PhotoGalleryField({
  value,
  onChange,
  label,
}: {
  value: string[]
  onChange: (next: string[]) => void
  label?: string
}) {
  const photos = Array.isArray(value) ? value : []
  const [uploading, setUploading] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadFiles = async (files: File[]) => {
    const images = files.filter((f) => f.type.startsWith('image/'))
    if (!images.length) return
    setError(null)
    setUploading((n) => n + images.length)
    const done: string[] = []
    for (const file of images) {
      try {
        const fd = new FormData()
        fd.append('file', file)
        const res = await adminFetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json().catch(() => ({}))
        if (res.ok && data.url) done.push(data.url)
        else setError(data.error || "Échec de l'envoi d'une image.")
      } catch (err) {
        // Session expirée : messageErreur renvoie null, la redirection est déjà
        // lancée, inutile d'afficher quoi que ce soit.
        const msg = messageErreur(err)
        if (msg) setError(msg)
      } finally {
        setUploading((n) => Math.max(0, n - 1))
      }
      // Ajout au fil de l'eau pour un retour visuel immédiat.
      if (done.length) {
        onChange([...photos, ...done])
        done.length = 0
      }
    }
  }

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= photos.length) return
    const next = [...photos]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  const remove = (i: number) => onChange(photos.filter((_, idx) => idx !== i))
  const makeCover = (i: number) => {
    if (i === 0) return
    const next = [...photos]
    const [picked] = next.splice(i, 1)
    next.unshift(picked)
    onChange(next)
  }

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <span className="text-[11px] text-muted-foreground/70">
            {photos.length} photo{photos.length > 1 ? 's' : ''}
          </span>
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          uploadFiles(Array.from(e.dataTransfer.files || []))
        }}
        className={cn(
          'grid grid-cols-3 gap-2 rounded-lg p-1 transition-colors sm:grid-cols-4',
          dragOver && 'bg-primary/5 ring-2 ring-primary/40'
        )}
      >
        {photos.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="group relative aspect-square overflow-hidden rounded-lg border border-border/40 bg-muted"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" />

            {i === 0 && (
              <span className="absolute left-1 top-1 rounded bg-black/65 px-1.5 py-0.5 text-[10px] font-medium text-white">
                Couverture
              </span>
            )}

            <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/70 via-transparent to-black/20 p-1 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => remove(i)}
                  title="Supprimer cette photo"
                  className="rounded bg-red-600 p-1 text-white transition-colors hover:bg-red-700"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
              <div className="flex items-center justify-between gap-1">
                <div className="flex gap-0.5">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    title="Déplacer avant"
                    className="rounded bg-white/90 p-1 text-neutral-800 transition-opacity hover:bg-white disabled:opacity-30"
                  >
                    <ArrowLeft className="size-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === photos.length - 1}
                    title="Déplacer après"
                    className="rounded bg-white/90 p-1 text-neutral-800 transition-opacity hover:bg-white disabled:opacity-30"
                  >
                    <ArrowRight className="size-3" />
                  </button>
                </div>
                {i !== 0 && (
                  <button
                    type="button"
                    onClick={() => makeCover(i)}
                    title="Définir comme couverture"
                    className="rounded bg-white/90 p-1 text-neutral-800 transition-colors hover:bg-white"
                  >
                    <Star className="size-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Vignettes d'upload en cours */}
        {Array.from({ length: uploading }).map((_, i) => (
          <div
            key={`up-${i}`}
            className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-border/50 bg-muted/30"
          >
            <Loader2 className="size-5 animate-spin text-primary" />
          </div>
        ))}

        {/* Tuile Ajouter */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border/50 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/30 hover:text-foreground"
        >
          <ImagePlus className="size-5" />
          <span className="text-[11px] font-medium">Ajouter</span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = e.target.files ? Array.from(e.target.files) : []
          uploadFiles(files)
          e.target.value = ''
        }}
      />

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Glissez-déposez ou cliquez sur « Ajouter » pour envoyer plusieurs photos d’un coup. La
        1re photo est la couverture ; réordonnez avec les flèches ou l’étoile ⭐.
      </p>
    </div>
  )
}
