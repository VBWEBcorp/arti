'use client'

import { Plus, Trash2 } from 'lucide-react'

import { PageEditor } from '@/components/admin/page-editor'
import { FieldEditor, SectionEditor, ImageField } from '@/components/admin/field-editor'
import { Button } from '@/components/ui/button'
import { kitDefaults, type ConceptStep } from '@/lib/content-defaults'

export default function AdminKitAEmporterPage() {
  return (
    <PageEditor pageId="kit-a-emporter" title="Page Le kit à emporter" defaultContent={kitDefaults}>
      {(content, update) => {
        const included: string[] = content.contient?.items || []
        const setIncluded = (next: string[]) => update('contient.items', next)
        const steps: ConceptStep[] = content.howItWorks?.steps || []
        const setSteps = (next: ConceptStep[]) => update('howItWorks.steps', next)

        return (
          <>
            <SectionEditor title="Bandeau d'accueil (hero)">
              <FieldEditor
                label="Accroche"
                value={content.hero?.eyebrow}
                onChange={(v) => update('hero.eyebrow', v)}
              />
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
                <FieldEditor
                  label="Libellé du bouton"
                  value={content.hero?.buttonLabel}
                  onChange={(v) => update('hero.buttonLabel', v)}
                />
                <FieldEditor
                  label="Lien du bouton"
                  value={content.hero?.buttonHref}
                  onChange={(v) => update('hero.buttonHref', v)}
                />
              </div>
              <ImageField
                label="Image du hero"
                value={content.hero?.image}
                onChange={(v) => update('hero.image', v)}
              />
            </SectionEditor>

            <SectionEditor title="Ce que contient le kit">
              <FieldEditor
                label="Titre"
                value={content.contient?.title}
                onChange={(v) => update('contient.title', v)}
              />
              <div className="space-y-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Éléments inclus
                </span>
                {included.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex-1">
                      <FieldEditor
                        label={`Élément ${i + 1}`}
                        value={item}
                        onChange={(v) => {
                          const next = [...included]
                          next[i] = v
                          setIncluded(next)
                        }}
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setIncluded(included.filter((_, idx) => idx !== i))}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIncluded([...included, ''])}
                >
                  <Plus className="size-4" /> Ajouter un élément
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldEditor
                  label="Note (tarif)"
                  value={content.contient?.note}
                  onChange={(v) => update('contient.note', v)}
                />
                <FieldEditor
                  label="Note secondaire"
                  value={content.contient?.noteSecondary}
                  onChange={(v) => update('contient.noteSecondary', v)}
                />
              </div>
              <ImageField
                label="Photo"
                value={content.contient?.image}
                onChange={(v) => update('contient.image', v)}
              />
            </SectionEditor>

            <SectionEditor title="Comment ça marche ? (4 étapes)">
              <FieldEditor
                label="Titre de section"
                value={content.howItWorks?.title}
                onChange={(v) => update('howItWorks.title', v)}
              />
              <div className="space-y-4">
                {steps.map((step, i) => (
                  <div key={i} className="space-y-3 rounded-lg border border-border/40 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Étape {i + 1}
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setSteps(steps.filter((_, idx) => idx !== i))}
                      >
                        <Trash2 className="size-3.5" /> Supprimer
                      </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-[80px_1fr]">
                      <FieldEditor
                        label="N°"
                        value={step.n}
                        onChange={(v) => {
                          const next = [...steps]
                          next[i] = { ...next[i], n: v }
                          setSteps(next)
                        }}
                      />
                      <FieldEditor
                        label="Titre"
                        value={step.title}
                        onChange={(v) => {
                          const next = [...steps]
                          next[i] = { ...next[i], title: v }
                          setSteps(next)
                        }}
                      />
                    </div>
                    <FieldEditor
                      label="Description"
                      value={step.body}
                      onChange={(v) => {
                        const next = [...steps]
                        next[i] = { ...next[i], body: v }
                        setSteps(next)
                      }}
                      type="textarea"
                    />
                    <ImageField
                      label="Icône"
                      value={step.icon}
                      onChange={(v) => {
                        const next = [...steps]
                        next[i] = { ...next[i], icon: v }
                        setSteps(next)
                      }}
                    />
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => setSteps([...steps, { n: String(steps.length + 1), title: '', icon: '', body: '' }])}
                className="mt-2"
              >
                <Plus className="size-4" /> Ajouter une étape
              </Button>
            </SectionEditor>
          </>
        )
      }}
    </PageEditor>
  )
}
