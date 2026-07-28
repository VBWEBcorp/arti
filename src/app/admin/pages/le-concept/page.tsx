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
            <SectionEditor title="Mot de présentation (identique à l'accueil)">
              <FieldEditor
                label="Titre 1 (accroche)"
                value={content.hero?.eyebrow}
                onChange={(v) => update('hero.eyebrow', v)}
              />
              <FieldEditor
                label="Titre 2 (grand titre)"
                value={content.hero?.title}
                onChange={(v) => update('hero.title', v)}
              />
              <FieldEditor label="Paragraphe 1" value={content.hero?.paragraph1} onChange={(v) => update('hero.paragraph1', v)} type="textarea" />
              <FieldEditor label="Paragraphe 2" value={content.hero?.paragraph2} onChange={(v) => update('hero.paragraph2', v)} type="textarea" />
              <FieldEditor label="Paragraphe 3" value={content.hero?.paragraph3} onChange={(v) => update('hero.paragraph3', v)} type="textarea" />
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldEditor label="Libellé du bouton" value={content.hero?.buttonLabel} onChange={(v) => update('hero.buttonLabel', v)} />
                <FieldEditor label="Lien du bouton" value={content.hero?.buttonHref} onChange={(v) => update('hero.buttonHref', v)} />
              </div>
              <ImageField label="Image du bandeau" value={content.hero?.image} onChange={(v) => update('hero.image', v)} />
            </SectionEditor>

            <SectionEditor title="Le Concept — les 4 étapes">
              <div className="space-y-4">
                {steps.map((step, i) => (
                  <div key={i} className="space-y-3 rounded-lg border border-border/40 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">Étape {i + 1}</span>
                      <Button variant="destructive" size="sm" onClick={() => setSteps(steps.filter((_, idx) => idx !== i))}>
                        <Trash2 className="size-3.5" /> Supprimer
                      </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-[80px_1fr]">
                      <FieldEditor label="N°" value={step.n} onChange={(v) => { const n = [...steps]; n[i] = { ...n[i], n: v }; setSteps(n) }} />
                      <FieldEditor label="Titre" value={step.title} onChange={(v) => { const n = [...steps]; n[i] = { ...n[i], title: v }; setSteps(n) }} />
                    </div>
                    <FieldEditor label="Description" value={step.body} onChange={(v) => { const n = [...steps]; n[i] = { ...n[i], body: v }; setSteps(n) }} type="textarea" />
                    <ImageField label="Icône" value={step.icon} onChange={(v) => { const n = [...steps]; n[i] = { ...n[i], icon: v }; setSteps(n) }} />
                  </div>
                ))}
              </div>
              <Button variant="outline" onClick={() => setSteps([...steps, { n: String(steps.length + 1), title: '', icon: '', body: '' }])} className="mt-2">
                <Plus className="size-4" /> Ajouter une étape
              </Button>
            </SectionEditor>

            <SectionEditor title="Pour qui ? + inspirations Pinterest">
              <FieldEditor label="Titre" value={content.pourQui?.title} onChange={(v) => update('pourQui.title', v)} />
              <FieldEditor label="Paragraphe 1" value={content.pourQui?.paragraph1} onChange={(v) => update('pourQui.paragraph1', v)} type="textarea" />
              <FieldEditor label="Paragraphe 2" value={content.pourQui?.paragraph2} onChange={(v) => update('pourQui.paragraph2', v)} type="textarea" />
              <FieldEditor label="Paragraphe 3" value={content.pourQui?.paragraph3} onChange={(v) => update('pourQui.paragraph3', v)} type="textarea" />
              <FieldEditor label="Paragraphe 4 (intro Pinterest)" value={content.pourQui?.paragraph4} onChange={(v) => update('pourQui.paragraph4', v)} type="textarea" />
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldEditor label="Libellé du bouton Pinterest" value={content.pourQui?.buttonLabel} onChange={(v) => update('pourQui.buttonLabel', v)} />
                <FieldEditor label="Lien Pinterest" value={content.pourQui?.buttonHref} onChange={(v) => update('pourQui.buttonHref', v)} />
              </div>
              <ImageField label="Photo" value={content.pourQui?.image} onChange={(v) => update('pourQui.image', v)} />
            </SectionEditor>

            <SectionEditor title="Partie Café">
              <FieldEditor label="Titre" value={content.cafe?.title} onChange={(v) => update('cafe.title', v)} />
              <FieldEditor label="Paragraphe 1" value={content.cafe?.paragraph1} onChange={(v) => update('cafe.paragraph1', v)} type="textarea" />
              <FieldEditor label="Paragraphe 2" value={content.cafe?.paragraph2} onChange={(v) => update('cafe.paragraph2', v)} type="textarea" />
              <FieldEditor label="Paragraphe 3" value={content.cafe?.paragraph3} onChange={(v) => update('cafe.paragraph3', v)} type="textarea" />
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldEditor label="Libellé du bouton (carte)" value={content.cafe?.buttonLabel} onChange={(v) => update('cafe.buttonLabel', v)} />
                <FieldEditor label="Lien du bouton (carte / PDF)" value={content.cafe?.buttonHref} onChange={(v) => update('cafe.buttonHref', v)} />
              </div>
              <ImageField label="Photo" value={content.cafe?.image} onChange={(v) => update('cafe.image', v)} />
            </SectionEditor>
          </>
        )
      }}
    </PageEditor>
  )
}
