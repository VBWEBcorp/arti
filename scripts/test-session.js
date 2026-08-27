/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Tests de la session admin.
 *
 *   npm run test:session
 *
 * Ne demande ni réseau, ni base, ni clé : tout est simulé.
 *
 * Deux volets :
 *   1. le module src/lib/admin-session.ts (navigateur simulé) ;
 *   2. le scénario de régression lui-même : avec un jeton EXPIRÉ, l'ancienne
 *      logique de layout bouclait entre /admin/login et le tableau de bord ;
 *      la nouvelle doit s'arrêter sur la page de connexion.
 */
const fs = require('fs')
const path = require('path')
const Module = require('module')
const ts = require('typescript')
const jwt = require('jsonwebtoken')

const ROOT = process.cwd()
const SRC = path.join(ROOT, 'src')

/* ---------- navigateur simulé (avant tout require du module testé) ---------- */
const store = new Map()
const redirects = []
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
}
globalThis.window = {
  localStorage: globalThis.localStorage,
  location: { search: '', replace: (url) => redirects.push(url) },
}

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

const session = require('@/lib/admin-session')

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

const SECRET = 'secret-de-test'
const token = (payload, opts) => jwt.sign(payload, SECRET, opts)
const reset = () => {
  store.clear()
  redirects.length = 0
}

console.log('\n\x1b[1mSession admin — module admin-session\x1b[0m\n')

test('getTokenExpiry lit le claim exp du jeton', () => {
  const t = token({ userId: 'admin', role: 'admin' }, { expiresIn: '30d' })
  const exp = session.getTokenExpiry(t)
  const jours = Math.round((exp - Date.now()) / 86400000)
  eq(jours, 30, 'durée lue')
})

test('getTokenExpiry renvoie null sur un jeton illisible', () => {
  eq(session.getTokenExpiry('pas-un-jwt'), null, 'jeton bidon')
  eq(session.getTokenExpiry('a.b.c'), null, 'segments non base64')
})

test('getTokenExpiry décode un payload accentué (base64url + non-ASCII)', () => {
  const t = token({ email: 'hélène@café-céramique.fr' }, { expiresIn: '1h' })
  assert(session.getTokenExpiry(t) > Date.now(), 'exp future')
})

test('hasValidSession : faux sans jeton', () => {
  reset()
  eq(session.hasValidSession(), false, 'aucun jeton')
})

test('hasValidSession : FAUX sur jeton expiré — le bug d’origine', () => {
  reset()
  // Exactement la situation de la cliente : jeton de 7 jours, émis il y a 27 jours.
  localStorage.setItem('authToken', token({ userId: 'admin' }, { expiresIn: '-27d' }))
  localStorage.setItem('authUser', JSON.stringify({ email: 'hello@articafeceramique.fr' }))
  eq(session.hasValidSession(), false, 'jeton périmé')
})

test('hasValidSession : vrai sur jeton frais', () => {
  reset()
  localStorage.setItem('authToken', token({ userId: 'admin' }, { expiresIn: '30d' }))
  eq(session.hasValidSession(), true, 'jeton valable')
})

test('hasValidSession : faux dans la marge de sécurité (expire dans 10 s)', () => {
  reset()
  localStorage.setItem('authToken', token({ userId: 'admin' }, { expiresIn: '10s' }))
  eq(session.hasValidSession(), false, 'marge de 30 s')
})

test('hasValidSession : vrai si le jeton n’a pas d’exp (le serveur tranchera)', () => {
  reset()
  localStorage.setItem('authToken', token({ userId: 'admin' }))
  eq(session.hasValidSession(), true, 'sans exp')
})

test('clearSession efface jeton ET profil', () => {
  reset()
  localStorage.setItem('authToken', 'x')
  localStorage.setItem('authUser', '{}')
  session.clearSession()
  eq(localStorage.getItem('authToken'), null, 'jeton')
  eq(localStorage.getItem('authUser'), null, 'profil')
})

test('endSession purge la session PUIS renvoie vers la connexion', () => {
  reset()
  localStorage.setItem('authToken', token({ userId: 'admin' }, { expiresIn: '-1d' }))
  localStorage.setItem('authUser', '{"email":"x"}')
  session.endSession()
  eq(localStorage.getItem('authToken'), null, 'jeton purgé')
  eq(redirects.length, 1, 'une redirection')
  eq(redirects[0], '/admin/login?expired=1', 'destination')
})

test('authHeaders porte le jeton courant', () => {
  reset()
  localStorage.setItem('authToken', 'jeton-123')
  const h = session.authHeaders()
  eq(h.Authorization, 'Bearer jeton-123', 'en-tête')
  eq(h['Content-Type'], 'application/json', 'content-type')
})

test('getUser renvoie null sur un profil corrompu', () => {
  reset()
  localStorage.setItem('authUser', '{ceci nest pas du json')
  eq(session.getUser(), null, 'profil illisible')
})

/* ---------- volet 2 : le scénario de régression ---------- */
console.log('\n\x1b[1mScénario de régression — jeton expiré, où atterrit-elle ?\x1b[0m\n')

/**
 * Rejoue la navigation : la cliente est sur /admin/gift-cards avec un jeton
 * expiré. À chaque étape, le layout décide où l'envoyer. On s'arrête dès qu'une
 * page s'affiche, ou au bout de 12 sauts (= boucle).
 */
function parcours(decide) {
  let page = '/admin/gift-cards'
  const vus = [page]
  for (let i = 0; i < 12; i++) {
    const suite = decide(page)
    if (suite === null) return { affiche: page, sauts: vus, boucle: false }
    page = suite
    vus.push(page)
  }
  return { affiche: null, sauts: vus, boucle: true }
}

const estPublique = (p) => p === '/admin/login' || p === '/admin/register'

// ANCIENNE logique : ne teste que la PRÉSENCE du jeton, ne purge jamais.
const ancienLayout = (page) => {
  const jetonPresent = localStorage.getItem('authToken') !== null
  if (estPublique(page)) return jetonPresent ? '/admin/dashboard' : null
  if (!jetonPresent) return '/admin/login'
  return null // la page s'affiche… puis l'API répond 401
}
// La page protégée reçoit un 401 et repart vers la connexion.
const ancienAvec401 = (page) => {
  const suite = ancienLayout(page)
  if (suite === null && !estPublique(page)) return '/admin/login'
  return suite
}

// NOUVELLE logique : teste la VALIDITÉ et purge la session morte.
const nouveauLayout = (page) => {
  const valide = session.hasValidSession()
  if (!valide) session.clearSession()
  if (estPublique(page)) return valide ? '/admin/dashboard' : null
  if (!valide) return '/admin/login'
  return null
}

test('AVANT : jeton expiré → boucle sans fin, elle ne voit jamais la connexion', () => {
  reset()
  localStorage.setItem('authToken', token({ userId: 'admin' }, { expiresIn: '-27d' }))
  const r = parcours(ancienAvec401)
  assert(r.boucle, 'une boucle était attendue')
  assert(
    r.sauts.includes('/admin/dashboard') && r.sauts.includes('/admin/login'),
    'le va-et-vient login ↔ dashboard était attendu'
  )
  eq(r.affiche, null, 'aucune page ne s’affiche')
})

test('APRÈS : jeton expiré → elle atterrit sur la page de connexion', () => {
  reset()
  localStorage.setItem('authToken', token({ userId: 'admin' }, { expiresIn: '-27d' }))
  const r = parcours(nouveauLayout)
  assert(!r.boucle, 'aucune boucle attendue')
  eq(r.affiche, '/admin/login', 'page affichée')
  eq(localStorage.getItem('authToken'), null, 'jeton purgé au passage')
})

test('APRÈS : jeton valide → la page demandée s’affiche directement', () => {
  reset()
  localStorage.setItem('authToken', token({ userId: 'admin' }, { expiresIn: '30d' }))
  const r = parcours(nouveauLayout)
  eq(r.affiche, '/admin/gift-cards', 'page affichée')
  eq(r.sauts.length, 1, 'aucune redirection')
})

test('APRÈS : reconnexion → le tableau de bord s’affiche', () => {
  reset()
  // Elle se reconnecte : un jeton frais est posé, on repart de la connexion.
  localStorage.setItem('authToken', token({ userId: 'admin' }, { expiresIn: '30d' }))
  let page = '/admin/login'
  const suite = nouveauLayout(page)
  eq(suite, '/admin/dashboard', 'redirigée vers le tableau de bord')
  eq(nouveauLayout('/admin/dashboard'), null, 'le tableau de bord s’affiche')
})

test('APRÈS : sans jeton, la page de connexion s’affiche (pas de rebond)', () => {
  reset()
  eq(nouveauLayout('/admin/login'), null, 'la connexion s’affiche')
})

/* ---------- volet 3 : garde-fou, le motif fautif ne doit pas revenir ---------- */
console.log('\n\x1b[1mGarde-fou du code source\x1b[0m\n')

const SESSION_MODULE = path.join('src', 'lib', 'admin-session.ts').replace(/\\/g, '/')

function fichiersAdmin() {
  const racines = [
    path.join(ROOT, 'src', 'app', 'admin'),
    path.join(ROOT, 'src', 'components', 'admin'),
    path.join(ROOT, 'src', 'components', 'layout'),
    path.join(ROOT, 'src', 'lib'),
  ]
  const out = []
  const parcourir = (dir) => {
    if (!fs.existsSync(dir)) return
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name)
      if (e.isDirectory()) parcourir(p)
      else if (/\.(ts|tsx)$/.test(e.name)) out.push(p)
    }
  }
  racines.forEach(parcourir)
  return out
}

const fichiers = fichiersAdmin().map((abs) => ({
  rel: path.relative(ROOT, abs).replace(/\\/g, '/'),
  src: fs.readFileSync(abs, 'utf8'),
}))

// On ignore les commentaires : ils citent le motif pour l'expliquer.
const sansCommentaires = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

test(`le jeton n'est lu ou écrit que dans ${SESSION_MODULE}`, () => {
  const coupables = fichiers
    .filter((f) => f.rel !== SESSION_MODULE)
    .filter((f) => /localStorage\s*\.\s*\w+\s*\(\s*['"](authToken|authUser)['"]/.test(sansCommentaires(f.src)))
    .map((f) => f.rel)
  eq(coupables.length, 0, `accès direct au jeton dans : ${coupables.join(', ')}`)
})

test('aucune page ne fabrique son en-tête Authorization à la main', () => {
  const coupables = fichiers
    .filter((f) => f.rel !== SESSION_MODULE)
    .filter((f) => /Authorization\s*:\s*[`'"]Bearer/.test(sansCommentaires(f.src)))
    .map((f) => f.rel)
  eq(coupables.length, 0, `en-tête fabriqué à la main dans : ${coupables.join(', ')}`)
})

test('le layout admin contrôle la validité de la session, pas sa présence', () => {
  const layout = fichiers.find((f) => f.rel === 'src/app/admin/layout.tsx')
  assert(layout, 'layout admin introuvable')
  const src = sansCommentaires(layout.src)
  assert(src.includes('hasValidSession'), 'le layout doit appeler hasValidSession')
  assert(src.includes('clearSession'), 'le layout doit purger la session morte')
})

// Seules pages dispensées : elles n'appellent que /api/auth/*, qui est public
// par nature (on ne peut pas présenter un jeton pour aller le chercher).
const PAGES_PUBLIQUES = ['src/app/admin/login/page.tsx', 'src/app/admin/register/page.tsx']

test('tout appel admin qui écrit passe par adminFetch', () => {
  const coupables = fichiers
    .filter((f) => f.rel.startsWith('src/app/admin/') || f.rel.startsWith('src/components/admin/'))
    .filter((f) => !PAGES_PUBLIQUES.includes(f.rel))
    .filter((f) => {
      const src = sansCommentaires(f.src)
      return /method:\s*'?"?(POST|PUT|DELETE|PATCH)/.test(src) && !src.includes('adminFetch')
    })
    .map((f) => f.rel)
  eq(coupables.length, 0, `écriture sans adminFetch dans : ${coupables.join(', ')}`)
})

test('les pages dispensées n’appellent bien que /api/auth', () => {
  for (const rel of PAGES_PUBLIQUES) {
    const f = fichiers.find((x) => x.rel === rel)
    if (!f) continue
    const cibles = [...sansCommentaires(f.src).matchAll(/fetch\(\s*['"`](\/api\/[^'"`]+)/g)].map((m) => m[1])
    const hors = cibles.filter((u) => !u.startsWith('/api/auth/'))
    eq(hors.length, 0, `${rel} appelle hors /api/auth : ${hors.join(', ')}`)
  }
})

test('la durée du jeton et la marge du navigateur restent cohérentes', () => {
  const auth = fs.readFileSync(path.join(SRC, 'lib', 'auth.ts'), 'utf8')
  const m = auth.match(/TOKEN_TTL\s*=\s*'(\d+)d'/)
  assert(m, 'TOKEN_TTL introuvable dans src/lib/auth.ts')
  const jours = Number(m[1])
  assert(jours >= 1 && jours <= 90, `durée de jeton déraisonnable : ${jours} j`)
  // Le test « jeton frais » plus haut pose 30 j : si la durée change, il faut
  // le savoir ici plutôt que de le découvrir en production.
  eq(jours, 30, 'durée du jeton')
})

console.log(`\n\x1b[1mRésultat : ${passed} réussi(s), ${failed} échec(s)\x1b[0m\n`)
process.exit(failed ? 1 : 0)
