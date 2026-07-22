'use client'

import { Plus, Trash2 } from 'lucide-react'

import { PageEditor } from '@/components/admin/page-editor'
import { FieldEditor, SectionEditor, ImageField } from '@/components/admin/field-editor'
import { Button } from '@/components/ui/button'
import { carteDefaults, type MenuCategory, type MenuItem } from '@/lib/content-defaults'

export default function AdminCartePage() {
  return (
    <PageEditor pageId="carte" title="Page La carte" defaultContent={carteDefaults}>
      {(content, update) => {
        const menu: MenuCategory[] = content.menu || []
        const setMenu = (next: MenuCategory[]) => update('menu', next)

        const patchCat = (ci: number, partial: Partial<MenuCategory>) => {
          const next = [...menu]
          next[ci] = { ...next[ci], ...partial }
          setMenu(next)
        }
        const patchItem = (ci: number, ii: number, partial: Partial<MenuItem>) => {
          const next = [...menu]
          const items = [...(next[ci].items || [])]
          items[ii] = { ...items[ii], ...partial }
          next[ci] = { ...next[ci], items }
          setMenu(next)
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
                label="Image du hero"
                value={content.hero?.image}
                onChange={(v) => update('hero.image', v)}
              />
            </SectionEditor>

            {menu.map((cat, ci) => (
              <SectionEditor key={ci} title={`Catégorie : ${cat.title || '(sans titre)'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Catégorie {ci + 1}
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setMenu(menu.filter((_, idx) => idx !== ci))}
                  >
                    <Trash2 className="size-3.5" /> Supprimer la catégorie
                  </Button>
                </div>
                <FieldEditor
                  label="Titre de la catégorie"
                  value={cat.title}
                  onChange={(v) => patchCat(ci, { title: v })}
                />
                <FieldEditor
                  label="Note (optionnel)"
                  value={cat.note || ''}
                  onChange={(v) => patchCat(ci, { note: v })}
                />

                <div className="space-y-3">
                  {(cat.items || []).map((item, ii) => (
                    <div key={ii} className="space-y-3 rounded-lg border border-border/40 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Article {ii + 1}
                        </span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            patchCat(ci, { items: cat.items.filter((_, idx) => idx !== ii) })
                          }
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_100px]">
                        <FieldEditor
                          label="Nom"
                          value={item.name}
                          onChange={(v) => patchItem(ci, ii, { name: v })}
                        />
                        <FieldEditor
                          label="Description (optionnel)"
                          value={item.desc || ''}
                          onChange={(v) => patchItem(ci, ii, { desc: v })}
                        />
                        <FieldEditor
                          label="Prix"
                          value={item.price}
                          onChange={(v) => patchItem(ci, ii, { price: v })}
                        />
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => patchCat(ci, { items: [...(cat.items || []), { name: '', price: '' }] })}
                  >
                    <Plus className="size-4" /> Ajouter un article
                  </Button>
                </div>
              </SectionEditor>
            ))}

            <Button
              variant="outline"
              onClick={() => setMenu([...menu, { title: 'Nouvelle catégorie', items: [] }])}
            >
              <Plus className="size-4" /> Ajouter une catégorie
            </Button>

            <SectionEditor title="Note de bas de page">
              <FieldEditor
                label="Mention"
                value={content.footnote}
                onChange={(v) => update('footnote', v)}
                type="textarea"
              />
            </SectionEditor>
          </>
        )
      }}
    </PageEditor>
  )
}
