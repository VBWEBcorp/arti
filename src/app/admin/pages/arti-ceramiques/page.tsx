'use client'

import { Plus, Trash2 } from 'lucide-react'

import { PageEditor } from '@/components/admin/page-editor'
import { FieldEditor, SectionEditor, ImageField } from '@/components/admin/field-editor'
import { Button } from '@/components/ui/button'
import { artiCeramiquesDefaults, type Ceramic } from '@/lib/content-defaults'

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
        const patch = (i: number, key: keyof Ceramic, v: string) => {
          const next = [...items]
          next[i] = { ...next[i], [key]: v }
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
            </SectionEditor>

            <SectionEditor title="Catalogue des céramiques">
              <div className="space-y-4">
                {items.map((item, i) => (
                  <div key={i} className="space-y-3 rounded-lg border border-border/40 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Pièce {i + 1}
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                      >
                        <Trash2 className="size-3.5" /> Supprimer
                      </Button>
                    </div>
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
                    <ImageField
                      label="Photo"
                      value={item.src}
                      onChange={(v) => patch(i, 'src', v)}
                    />
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  setItems([...items, { src: '', name: '', category: '', price: '', alt: '' }])
                }
                className="mt-2"
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
