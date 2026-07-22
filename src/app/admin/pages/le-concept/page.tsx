'use client'

import { Plus, Trash2 } from 'lucide-react'

import { PageEditor } from '@/components/admin/page-editor'
import { FieldEditor, SectionEditor, ImageField } from '@/components/admin/field-editor'
import { Button } from '@/components/ui/button'
import { leConceptDefaults, type ConceptStep } from '@/lib/content-defaults'

export default function AdminLeConceptPage() {
  return (
    <PageEditor pageId="le-concept" title="Page Le concept" defaultContent={leConceptDefaults}>
      {(content, update) => {
        const steps: ConceptStep[] = content.steps || []
        const setSteps = (next: ConceptStep[]) => update('steps', next)

        return (
          <>
            <SectionEditor title="Bandeau d'accueil (hero)">
              <FieldEditor
                label="Titre"
                value={content.hero?.title}
                onChange={(v) => update('hero.title', v)}
                type="textarea"
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
                label="Image principale"
                value={content.hero?.image}
                onChange={(v) => update('hero.image', v)}
              />
              <ImageField
                label="Image secondaire (devanture)"
                value={content.hero?.imageSecondary}
                onChange={(v) => update('hero.imageSecondary', v)}
              />
            </SectionEditor>

            <SectionEditor title="Introduction">
              <FieldEditor
                label="Titre"
                value={content.intro?.title}
                onChange={(v) => update('intro.title', v)}
              />
              <FieldEditor
                label="Texte"
                value={content.intro?.text}
                onChange={(v) => update('intro.text', v)}
                type="textarea"
              />
              <ImageField
                label="Icône / illustration"
                value={content.intro?.icon}
                onChange={(v) => update('intro.icon', v)}
              />
            </SectionEditor>

            <SectionEditor title="Les 4 étapes">
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

            <SectionEditor title="Comment ça marche ?">
              <FieldEditor
                label="Titre"
                value={content.howItWorks?.title}
                onChange={(v) => update('howItWorks.title', v)}
              />
              <FieldEditor
                label="Paragraphe 1"
                value={content.howItWorks?.paragraph1}
                onChange={(v) => update('howItWorks.paragraph1', v)}
                type="textarea"
              />
              <FieldEditor
                label="Paragraphe 2"
                value={content.howItWorks?.paragraph2}
                onChange={(v) => update('howItWorks.paragraph2', v)}
                type="textarea"
              />
              <FieldEditor
                label="Paragraphe 3"
                value={content.howItWorks?.paragraph3}
                onChange={(v) => update('howItWorks.paragraph3', v)}
                type="textarea"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldEditor
                  label="Libellé du bouton"
                  value={content.howItWorks?.buttonLabel}
                  onChange={(v) => update('howItWorks.buttonLabel', v)}
                />
                <FieldEditor
                  label="Lien du bouton"
                  value={content.howItWorks?.buttonHref}
                  onChange={(v) => update('howItWorks.buttonHref', v)}
                />
              </div>
            </SectionEditor>

            <SectionEditor title="Aperçu du coffee shop">
              <FieldEditor
                label="Titre"
                value={content.apercu?.title}
                onChange={(v) => update('apercu.title', v)}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldEditor
                  label="Libellé du bouton"
                  value={content.apercu?.buttonLabel}
                  onChange={(v) => update('apercu.buttonLabel', v)}
                />
                <FieldEditor
                  label="Lien du bouton"
                  value={content.apercu?.buttonHref}
                  onChange={(v) => update('apercu.buttonHref', v)}
                />
              </div>
              <ImageField
                label="Photo 1"
                value={content.apercu?.image1}
                onChange={(v) => update('apercu.image1', v)}
              />
              <ImageField
                label="Photo 2"
                value={content.apercu?.image2}
                onChange={(v) => update('apercu.image2', v)}
              />
              <ImageField
                label="Photo 3"
                value={content.apercu?.image3}
                onChange={(v) => update('apercu.image3', v)}
              />
            </SectionEditor>

            <SectionEditor title="Nos partenaires locaux">
              <FieldEditor
                label="Titre"
                value={content.partenaires?.title}
                onChange={(v) => update('partenaires.title', v)}
              />
              <FieldEditor
                label="Paragraphe 1"
                value={content.partenaires?.paragraph1}
                onChange={(v) => update('partenaires.paragraph1', v)}
                type="textarea"
              />
              <FieldEditor
                label="Paragraphe 2"
                value={content.partenaires?.paragraph2}
                onChange={(v) => update('partenaires.paragraph2', v)}
                type="textarea"
              />
              <FieldEditor
                label="Paragraphe 3"
                value={content.partenaires?.paragraph3}
                onChange={(v) => update('partenaires.paragraph3', v)}
                type="textarea"
              />
              <ImageField
                label="Photo des partenaires"
                value={content.partenaires?.image}
                onChange={(v) => update('partenaires.image', v)}
              />
            </SectionEditor>
          </>
        )
      }}
    </PageEditor>
  )
}
