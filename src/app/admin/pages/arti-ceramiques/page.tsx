'use client'

import { ImageOff, Plus, Trash2 } from 'lucide-react'

import { PageEditor } from '@/components/admin/page-editor'
import { FieldEditor, SectionEditor, ImageField } from '@/components/admin/field-editor'
import { PhotoGalleryField } from '@/components/admin/photo-gallery-field'
import { Button } from '@/components/ui/button'
import { artiCeramiquesDefaults, type Ceramic } from '@/lib/content-defaults'

type CeramicTextKey = 'name' | 'category' | 'price' | 'alt'

export default function AdminArtiCeramiquesPage() {
  return (
    <PageEditor
      pageId="arti-ceramiques"
      title="Page Les céramiques"
      defaultContent={artiCeramiquesDefaults}
    >
      {(content, update) => {
        const items: Ceramic[] = content.catalogue || []
        const setItems = (next: Ceramic[]) => update('catalogue', next)
        const patch = (i: number, key: CeramicTextKey, v: string) => {
          const next = [...items]
          next[i] = { ...next[i], [key]: v }
          setItems(next)
        }
        const setImages = (i: number, imgs: string[]) => {
          const next = [...items]
          next[i] = { ...next[i], images: imgs }
          setItems(next)
        }
        const moveItem = (i: number, dir: -1 | 1) => {
          const j = i + dir
          if (j < 0 || j >= items.length) return
          const next = [...items]
          ;[next[i], next[j]] = [next[j], next[i]]
          setItems(next)
        }

        return (
          <>
            <SectionEditor title="Bandeau d'accueil (hero)">
              <FieldEditor
                label="Titre"
                value={content.hero?.title}
                onChange={(v) => update('hero.title', v)}
              />
              <FieldEditor
                label="Paragraphe 1"
                value={content.hero?.paragraph1}
                onChange={(v) => update('hero.paragraph1', v)}
                type="textarea"
              />
              <FieldEditor
                label="Paragraphe 2"
                value={content.hero?.paragraph2}
                onChange={(v) => update('hero.paragraph2', v)}
                type="textarea"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <ImageField
                  label="Image 1"
                  value={content.hero?.image1}
                  onChange={(v) => update('hero.image1', v)}
                />
                <ImageField
                  label="Image 2"
                  value={content.hero?.image2}
                  onChange={(v) => update('hero.image2', v)}
                />
              </div>
            </SectionEditor>

            <SectionEditor title={`Catalogue des céramiques — ${items.length} pièce${items.length > 1 ? 's' : ''}`}>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Chaque pièce peut avoir <strong>plusieurs photos</strong> : sur le site, elles
                défilent automatiquement en carousel. Réordonnez les pièces avec les flèches à
                gauche.
              </p>

              <div className="space-y-3">
                {items.map((item, i) => {
                  const images: string[] = Array.isArray(item.images) ? item.images : []
                  const cover = images[0]
                  return (
                    <div
                      key={i}
                      className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-[var(--shadow-xs)]"
                    >
                      {/* En-tête de la fiche */}
                      <div className="flex items-center gap-3 border-b border-border/40 bg-muted/30 px-3 py-2.5">
                        {/* Flèches de réordonnancement */}
                        <div className="flex flex-col text-muted-foreground">
                          <button
                            type="button"
                            onClick={() => moveItem(i, -1)}
                            disabled={i === 0}
                            title="Monter"
                            className="leading-none transition-colors hover:text-foreground disabled:opacity-25"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() => moveItem(i, 1)}
                            disabled={i === items.length - 1}
                            title="Descendre"
                            className="leading-none transition-colors hover:text-foreground disabled:opacity-25"
                          >
                            ▼
                          </button>
                        </div>

                        {/* Miniature de couverture */}
                        <div className="relative size-11 shrink-0 overflow-hidden rounded-md border border-border/40 bg-muted">
                          {cover ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={cover} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground/50">
                              <ImageOff className="size-4" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {item.name || `Pièce ${i + 1}`}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {[item.category, item.price].filter(Boolean).join(' · ') || 'À compléter'}
                            {images.length ? ` · ${images.length} photo${images.length > 1 ? 's' : ''}` : ''}
                          </p>
                        </div>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                        >
                          <Trash2 className="size-3.5" /> Supprimer
                        </Button>
                      </div>

                      {/* Corps de la fiche */}
                      <div className="space-y-4 p-4">
                        <div className="grid gap-3 sm:grid-cols-3">
                          <FieldEditor label="Nom" value={item.name} onChange={(v) => patch(i, 'name', v)} />
                          <FieldEditor label="Catégorie" value={item.category} onChange={(v) => patch(i, 'category', v)} />
                          <FieldEditor label="Prix" value={item.price} onChange={(v) => patch(i, 'price', v)} />
                        </div>
                        <FieldEditor
                          label="Texte alternatif (accessibilité / SEO)"
                          value={item.alt}
                          onChange={(v) => patch(i, 'alt', v)}
                        />
                        <PhotoGalleryField
                          label="Photos de la pièce"
                          value={images}
                          onChange={(imgs) => setImages(i, imgs)}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              <Button
                variant="outline"
                onClick={() =>
                  setItems([...items, { images: [], name: '', category: '', price: '', alt: '' }])
                }
                className="mt-1 w-full"
              >
                <Plus className="size-4" /> Ajouter une pièce
              </Button>
            </SectionEditor>
          </>
        )
      }}
    </PageEditor>
  )
}
