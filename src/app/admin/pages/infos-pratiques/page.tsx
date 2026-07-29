'use client'

import { PageEditor } from '@/components/admin/page-editor'
import { FieldEditor, SectionEditor } from '@/components/admin/field-editor'
import { infosDefaults } from '@/lib/content-defaults'

export default function AdminInfosPratiquesPage() {
  return (
    <PageEditor pageId="infos-pratiques" title="Page Infos pratiques" defaultContent={infosDefaults}>
      {(content, update) => (
        <>
          <SectionEditor title="En-tête + carte">
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
              label="Description"
              value={content.hero?.description}
              onChange={(v) => update('hero.description', v)}
              type="textarea"
            />
            <FieldEditor
              label="Adresse affichée sur la carte Google Maps"
              value={content.hero?.mapQuery}
              onChange={(v) => update('hero.mapQuery', v)}
              placeholder="10 rue Poullain Duparc Rennes"
            />
          </SectionEditor>

          <SectionEditor title="Réservation en ligne (module Zenchef)">
            <FieldEditor
              label="Titre"
              value={content.reservation?.title}
              onChange={(v) => update('reservation.title', v)}
            />
            <FieldEditor
              label="Texte d'introduction"
              value={content.reservation?.intro1}
              onChange={(v) => update('reservation.intro1', v)}
              type="textarea"
            />
            <FieldEditor
              label="Deuxième ligne (ex. « À très bientôt ! »)"
              value={content.reservation?.intro2}
              onChange={(v) => update('reservation.intro2', v)}
            />
            <FieldEditor
              label="Lien du module Zenchef (bookings.zenchef.com…)"
              value={content.reservation?.zenchefUrl}
              onChange={(v) => update('reservation.zenchefUrl', v)}
              type="url"
            />
          </SectionEditor>
        </>
      )}
    </PageEditor>
  )
}
