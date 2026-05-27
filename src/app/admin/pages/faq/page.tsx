'use client'

import { Plus, Trash2 } from 'lucide-react'

import { PageEditor } from '@/components/admin/page-editor'
import { FieldEditor, SectionEditor } from '@/components/admin/field-editor'
import { Button } from '@/components/ui/button'
import { faqDefaults, type FaqItem } from '@/lib/content-defaults'

export default function AdminFaqPage() {
  return (
    <PageEditor pageId="faq" title="Page FAQ" defaultContent={faqDefaults}>
      {(content, update) => {
        const items: FaqItem[] = content.items || []
        const setItems = (next: FaqItem[]) => update('items', next)

        return (
          <>
            <SectionEditor title="En-tête">
              <FieldEditor
                label="Accroche"
                value={content.eyebrow}
                onChange={(v) => update('eyebrow', v)}
              />
              <FieldEditor label="Titre" value={content.title} onChange={(v) => update('title', v)} />
              <FieldEditor
                label="Introduction"
                value={content.intro}
                onChange={(v) => update('intro', v)}
                type="textarea"
              />
            </SectionEditor>

            <SectionEditor title="Questions / réponses">
              <div className="space-y-4">
                {items.map((item, i) => (
                  <div key={i} className="space-y-3 rounded-lg border border-border/40 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Question {i + 1}
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                      >
                        <Trash2 className="size-3.5" /> Supprimer
                      </Button>
                    </div>
                    <FieldEditor
                      label="Question"
                      value={item.q}
                      onChange={(v) => {
                        const next = [...items]
                        next[i] = { ...next[i], q: v }
                        setItems(next)
                      }}
                    />
                    <FieldEditor
                      label="Réponse"
                      value={item.a}
                      onChange={(v) => {
                        const next = [...items]
                        next[i] = { ...next[i], a: v }
                        setItems(next)
                      }}
                      type="textarea"
                    />
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => setItems([...items, { q: '', a: '' }])}
                className="mt-2"
              >
                <Plus className="size-4" /> Ajouter une question
              </Button>
            </SectionEditor>
          </>
        )
      }}
    </PageEditor>
  )
}
