'use client'

import { PageEditor } from '@/components/admin/page-editor'
import { FieldEditor, SectionEditor, ImageField } from '@/components/admin/field-editor'
import { homeDefaults } from '@/lib/content-defaults'

export default function AdminAccueilPage() {
  return (
    <PageEditor pageId="home" title="Page Accueil" defaultContent={homeDefaults}>
      {(content, update) => (
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
      )}
    </PageEditor>
  )
}
