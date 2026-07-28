'use client'

import { PageEditor } from '@/components/admin/page-editor'
import { FieldEditor, SectionEditor, ImageField } from '@/components/admin/field-editor'
import { homeDefaults } from '@/lib/content-defaults'

export default function AdminAccueilPage() {
  return (
    <PageEditor pageId="home" title="Page Accueil" defaultContent={homeDefaults}>
      {(content, update) => (
        <>
          <SectionEditor title="Mot de présentation (bandeau d'accueil)">
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
            <FieldEditor
              label="Paragraphe 3"
              value={content.hero?.paragraph3}
              onChange={(v) => update('hero.paragraph3', v)}
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
              label="Image du bandeau"
              value={content.hero?.image}
              onChange={(v) => update('hero.image', v)}
            />
          </SectionEditor>

          <SectionEditor title="Le mot de la Fondatrice (Chloé)">
            <FieldEditor
              label="Titre"
              value={content.fondatrice?.title}
              onChange={(v) => update('fondatrice.title', v)}
            />
            <FieldEditor
              label="Paragraphe 1"
              value={content.fondatrice?.paragraph1}
              onChange={(v) => update('fondatrice.paragraph1', v)}
              type="textarea"
            />
            <FieldEditor
              label="Paragraphe 2"
              value={content.fondatrice?.paragraph2}
              onChange={(v) => update('fondatrice.paragraph2', v)}
              type="textarea"
            />
            <FieldEditor
              label="Paragraphe 3"
              value={content.fondatrice?.paragraph3}
              onChange={(v) => update('fondatrice.paragraph3', v)}
              type="textarea"
            />
            <FieldEditor
              label="Signature"
              value={content.fondatrice?.signature}
              onChange={(v) => update('fondatrice.signature', v)}
            />
            <ImageField
              label="Photo (Chloé / l'équipe)"
              value={content.fondatrice?.image}
              onChange={(v) => update('fondatrice.image', v)}
            />
          </SectionEditor>
        </>
      )}
    </PageEditor>
  )
}
