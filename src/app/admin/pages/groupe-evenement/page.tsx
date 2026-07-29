'use client'

import { Plus, Trash2 } from 'lucide-react'

import { PageEditor } from '@/components/admin/page-editor'
import { FieldEditor, SectionEditor, ImageField } from '@/components/admin/field-editor'
import { PhotoGalleryField } from '@/components/admin/photo-gallery-field'
import { Button } from '@/components/ui/button'
import { groupeDefaults } from '@/lib/content-defaults'

export default function AdminGroupeEvenementPage() {
  return (
    <PageEditor
      pageId="groupe-evenement"
      title="Page Groupe & Évènement"
      defaultContent={groupeDefaults}
    >
      {(content, update) => {
        const paras: string[] = content.hero?.paragraphs || []
        const setParas = (next: string[]) => update('hero.paragraphs', next)

        return (
          <>
            <SectionEditor title="Bandeau (texte + photo)">
              <FieldEditor
                label="Titre"
                value={content.hero?.title}
                onChange={(v) => update('hero.title', v)}
                type="textarea"
              />

              <div className="space-y-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Paragraphes
                </span>
                {paras.map((p, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="flex-1">
                      <FieldEditor
                        label={`Paragraphe ${i + 1}`}
                        value={p}
                        onChange={(v) => {
                          const next = [...paras]
                          next[i] = v
                          setParas(next)
                        }}
                        type="textarea"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setParas(paras.filter((_, idx) => idx !== i))}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setParas([...paras, ''])}>
                  <Plus className="size-4" /> Ajouter un paragraphe
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FieldEditor
                  label="Libellé du bouton"
                  value={content.hero?.buttonLabel}
                  onChange={(v) => update('hero.buttonLabel', v)}
                />
                <FieldEditor
                  label="Lien du bouton (mailto: ou URL)"
                  value={content.hero?.buttonHref}
                  onChange={(v) => update('hero.buttonHref', v)}
                />
              </div>

              <ImageField
                label="Photo principale (bandeau)"
                value={content.hero?.image}
                onChange={(v) => update('hero.image', v)}
              />
            </SectionEditor>

            <SectionEditor title="Photos d'événements">
              <PhotoGalleryField
                label="Photos affichées sous le texte"
                value={content.photos || []}
                onChange={(imgs) => update('photos', imgs)}
              />
            </SectionEditor>
          </>
        )
      }}
    </PageEditor>
  )
}
