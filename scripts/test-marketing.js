/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Tests du module marketing (popup + bandeau).
 *
 *   npm run test:marketing
 *
 * Ne demande ni réseau, ni base, ni clé.
 *
 * Deux volets :
 *   1. les règles de src/lib/marketing.ts (valeurs par défaut, dates, couleurs) ;
 *   2. un garde-fou de câblage. La panne d'origine n'était pas un bug de code :
 *      la popup et le bandeau existaient, l'admin les enregistrait en base…
 *      et AUCUNE page du site ne montait le composant. Un composant que
 *      personne n'affiche ressemble en tout point à un composant cassé, sauf
 *      qu'aucune erreur n'apparaît nulle part. Ce test refuse ce silence.
 */
const fs = require('fs')
const path = require('path')
const Module = require('module')
const ts = require('typescript')

const ROOT = process.cwd()
const SRC = path.join(ROOT, 'src')

/* ---------- alias @/ + transpilation TS à la volée ---------- */
const origResolve = Module._resolveFilename
Module._resolveFilename = function (request, ...rest) {
  if (request.startsWith('@/')) request = path.join(SRC, request.slice(2))
  return origResolve.call(this, request, ...rest)
}
require.extensions['.ts'] = function (module, filename) {
  const js = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: 'commonjs', target: 'es2019', esModuleInterop: true },
    fileName: filename,
  }).outputText
  module._compile(js, filename)
}

const M = require('@/lib/marketing')

/* ---------- mini-harnais ---------- */
let passed = 0
let failed = 0
function test(name, fn) {
  try {
    fn()
    passed++
    console.log(`  \x1b[32m✓\x1b[0m ${name}`)
  } catch (err) {
    failed++
    console.log(`  \x1b[31m✗\x1b[0m ${name}\n      ${err.message}`)
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion échouée')
}
function eq(a, b, msg) {
  if (a !== b) throw new Error(`${msg || 'égalité'} — reçu ${JSON.stringify(a)}, attendu ${JSON.stringify(b)}`)
}

const lire = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8')
const sansCommentaires = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

console.log('\n\x1b[1mCâblage : la popup atteint-elle vraiment le site ?\x1b[0m\n')

test('le site monte le composant Marketing dans son ossature', () => {
  const wrapper = sansCommentaires(lire('src/components/layout/root-wrapper.tsx'))
  assert(
    /import\s*\{\s*Marketing\s*\}\s*from\s*'@\/components\/marketing\/marketing'/.test(wrapper),
    'root-wrapper doit importer Marketing'
  )
  assert(/<Marketing\s*\/>/.test(wrapper), 'root-wrapper doit afficher <Marketing />')
})

test('le composant monté lit bien /api/marketing', () => {
  const src = sansCommentaires(lire('src/components/marketing/marketing.tsx'))
  assert(src.includes("fetch('/api/marketing'"), 'Marketing doit interroger /api/marketing')
})

test('le bandeau est monté au-dessus de la barre de navigation', () => {
  const wrapper = sansCommentaires(lire('src/components/layout/root-wrapper.tsx'))
  const posMarketing = wrapper.indexOf('<Marketing />')
  const posNavbar = wrapper.indexOf('<Navbar />')
  assert(posMarketing !== -1 && posNavbar !== -1, 'les deux composants doivent être là')
  assert(posMarketing < posNavbar, 'le bandeau doit précéder le menu, pas le suivre')
})

test("l'aperçu de l'admin affiche le composant réel du site", () => {
  const admin = sansCommentaires(lire('src/app/admin/marketing/page.tsx'))
  assert(
    admin.includes("from '@/components/marketing/popup-card'"),
    "l'aperçu doit réutiliser MarketingPopupCard, pas une copie du balisage"
  )
  assert(
    admin.includes("from '@/components/marketing/banner-bar'"),
    "l'aperçu du bandeau doit réutiliser MarketingBannerBar"
  )
})

test("l'API et le modèle partagent les valeurs par défaut du site", () => {
  const api = sansCommentaires(lire('src/app/api/marketing/route.ts'))
  const modele = sansCommentaires(lire('src/models/Marketing.ts'))
  assert(api.includes("from '@/lib/marketing'"), "l'API doit se référer à src/lib/marketing")
  assert(modele.includes("from '@/lib/marketing'"), 'le modèle doit se référer à src/lib/marketing')
})

test('aucun composant marketing orphelin ne traîne dans src/components', () => {
  const orphelins = fs
    .readdirSync(path.join(SRC, 'components'), { withFileTypes: true })
    .filter((e) => e.isFile() && /^marketing-/.test(e.name))
    .map((e) => e.name)
  eq(orphelins.length, 0, `anciens composants non montés : ${orphelins.join(', ')}`)
})

console.log('\n\x1b[1mRéglages : valeurs par défaut et garde-fous\x1b[0m\n')

test('des réglages vides donnent les valeurs par défaut ARTI', () => {
  const s = M.normalizeMarketing({})
  eq(s.enabled, false, 'désactivée par défaut')
  eq(s.bgColor, M.DEFAULT_MARKETING.bgColor, 'fond')
  eq(s.layout, 'centre', 'mise en page')
  eq(s.frequency, 'session', 'fréquence')
  eq(s.banner.enabled, false, 'bandeau')
})

test('un délai absurde est ramené dans des bornes raisonnables', () => {
  eq(M.normalizeMarketing({ delay: -10 }).delay, 0, 'délai négatif')
  eq(M.normalizeMarketing({ delay: 9999 }).delay, 60, 'délai démesuré')
  eq(M.normalizeMarketing({ delay: '4' }).delay, 4, 'délai en texte')
  eq(M.normalizeMarketing({ delay: 'abc' }).delay, M.DEFAULT_MARKETING.delay, 'délai illisible')
})

test('une mise en page ou une fréquence inconnue retombe sur la valeur sûre', () => {
  eq(M.normalizeMarketing({ layout: 'diagonale' }).layout, 'centre', 'mise en page')
  eq(M.normalizeMarketing({ frequency: 'jamais' }).frequency, 'session', 'fréquence')
})

test('une date mal formée est ignorée plutôt que de bloquer la diffusion', () => {
  eq(M.normalizeMarketing({ startDate: '20 septembre' }).startDate, '', 'date libre')
  eq(M.normalizeMarketing({ startDate: '2026-09-20' }).startDate, '2026-09-20', 'date ISO')
})

test('les couleurs du template jamais modifiées passent au thème ARTI', () => {
  // Le document réellement enregistré par la boutique portait ces trois-là.
  const s = M.normalizeMarketing({ bgColor: '#ffffff', textColor: '#111827', buttonColor: '#2563eb' })
  eq(s.buttonColor, M.ARTI.sauge, 'bleu du template remplacé par le sauge ARTI')
  eq(s.textColor, M.ARTI.navy, 'texte navy')
})

test('une couleur choisie par la boutique est respectée', () => {
  const s = M.normalizeMarketing({ bgColor: '#ffffff', textColor: '#111827', buttonColor: '#E89A6A' })
  eq(s.bgColor, '#ffffff', 'fond intact')
  eq(s.buttonColor, '#E89A6A', 'bouton intact')
})

console.log('\n\x1b[1mAffichage : qui voit la popup, et quand ?\x1b[0m\n')

const base = (p) => M.normalizeMarketing({ enabled: true, title: 'Atelier', ...p })
const le = (iso) => {
  const [a, m, j] = iso.split('-').map(Number)
  return new Date(a, m - 1, j, 12, 0, 0)
}

test('activée et remplie, la popup est en ligne', () => {
  assert(M.isPopupLive(base({})), 'devrait être en ligne')
  eq(M.raisonNonAffichage(base({})), null, 'aucune raison de ne pas afficher')
})

test('désactivée, elle ne sort pas — et l’admin sait pourquoi', () => {
  const s = M.normalizeMarketing({ enabled: false, title: 'Atelier' })
  assert(!M.isPopupLive(s), 'ne doit pas s’afficher')
  assert(/désactivée/i.test(M.raisonNonAffichage(s)), 'message explicite attendu')
})

test('vide, elle ne sort pas', () => {
  const s = M.normalizeMarketing({ enabled: true, title: '', description: '' })
  assert(!M.isPopupLive(s), 'une popup sans texte ne s’affiche pas')
})

test('programmée, elle attend sa date de début', () => {
  const s = base({ startDate: '2026-09-20' })
  assert(!M.isPopupLive(s, le('2026-09-15')), 'avant le début')
  assert(M.isPopupLive(s, le('2026-09-20')), 'le jour même')
  assert(/20 septembre 2026/.test(M.raisonNonAffichage(s, le('2026-09-15'))), 'date annoncée')
})

test('la date de fin est incluse, et la popup s’arrête ensuite', () => {
  const s = base({ endDate: '2026-09-20' })
  assert(M.isPopupLive(s, le('2026-09-20')), 'dernier jour inclus')
  assert(!M.isPopupLive(s, le('2026-09-21')), 'le lendemain, terminé')
})

test('le bandeau suit les mêmes dates et exige un texte', () => {
  const avecTexte = M.normalizeMarketing({
    banner: { enabled: true, text: 'Atelier le 20' },
    endDate: '2026-09-20',
  })
  assert(M.isBannerLive(avecTexte, le('2026-09-19')), 'dans la fenêtre')
  assert(!M.isBannerLive(avecTexte, le('2026-09-25')), 'après la fin')
  const sansTexte = M.normalizeMarketing({ banner: { enabled: true, text: '  ' } })
  assert(!M.isBannerLive(sansTexte), 'un bandeau vide ne s’affiche pas')
})

console.log('\n\x1b[1mLisibilité et liens\x1b[0m\n')

test('le texte du bouton reste lisible quelle que soit sa couleur', () => {
  eq(M.readableTextOn('#1B2E4A'), M.ARTI.blanc, 'blanc sur navy')
  eq(M.readableTextOn('#EFE7D2'), M.ARTI.navy, 'navy sur beige clair')
  eq(M.readableTextOn('#FFFFFF'), M.ARTI.navy, 'navy sur blanc')
  eq(M.readableTextOn('#91977D'), M.ARTI.blanc, 'blanc sur sauge')
})

test('un lien vide ou « # » ne fabrique pas de bouton mort', () => {
  eq(M.lienSur(''), null, 'vide')
  eq(M.lienSur('#'), null, 'ancre vide')
  eq(M.lienSur('  '), null, 'espaces')
})

test('un lien interne, externe ou sans protocole est traité correctement', () => {
  eq(M.lienSur('/infos-pratiques').href, '/infos-pratiques', 'interne')
  eq(M.lienSur('/infos-pratiques').externe, false, 'interne, même onglet')
  eq(M.lienSur('https://arti.fr').externe, true, 'externe')
  eq(M.lienSur('articafeceramique.fr').href, 'https://articafeceramique.fr', 'protocole ajouté')
  eq(M.lienSur('mailto:bonjour@arti.fr').href, 'mailto:bonjour@arti.fr', 'courriel')
})

test('un lien javascript: est refusé', () => {
  eq(M.lienSur('javascript:alert(1)'), null, 'aucun lien exécutable')
})

console.log(`\n\x1b[1mRésultat : ${passed} réussi(s), ${failed} échec(s)\x1b[0m\n`)
process.exit(failed ? 1 : 0)
