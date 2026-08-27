/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Vérification de la PRODUCTION après déploiement.
 *
 *   netlify dev:exec --context production node scripts/test-prod.js
 *
 * (le dossier doit être relié : `netlify link`. Les variables de prod sont
 * injectées par le CLI, aucune clé n'est écrite sur le disque.)
 *
 * LECTURE SEULE : rien n'est écrit en base, aucun PaymentIntent n'est ouvert
 * sur le compte Stripe, aucun email n'est envoyé. Le nombre de cartes est
 * relevé avant et après et doit être identique.
 */
const fs = require('fs')
const path = require('path')
const Module = require('module')
const ts = require('typescript')
const jwt = require('jsonwebtoken')

const ROOT = process.cwd()
const SRC = path.join(ROOT, 'src')
const BASE = process.env.SITE_URL || 'https://articafeceramique.fr'

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

const { connectDB } = require('@/lib/db')
const { GiftCard } = require('@/models/GiftCard')
const giftcard = require('@/lib/giftcard')
const { getStripe, verifyGiftCardPayment } = require('@/lib/stripe')
const { getApiKeys } = require('@/lib/apikeys')
const mongoose = require('mongoose')

let passed = 0
let failed = 0
async function test(name, fn) {
  try {
    await fn()
    passed++
    console.log(`  \x1b[32m✓\x1b[0m ${name}`)
  } catch (err) {
    failed++
    console.log(`  \x1b[31m✗\x1b[0m ${name}\n      ${err.message}`)
  }
}
const assert = (cond, msg) => {
  if (!cond) throw new Error(msg || 'assertion échouée')
}
const eq = (a, b, msg) => {
  if (a !== b) throw new Error(`${msg || 'égalité'} — reçu ${JSON.stringify(a)}, attendu ${JSON.stringify(b)}`)
}

const get = (p, token) =>
  fetch(BASE + p, { headers: token ? { Authorization: 'Bearer ' + token } : {} })

/**
 * Cherche un texte dans un bundle minifié. Les caractères non-ASCII y sont
 * échappés (« Dernières » s'écrit « Derni\xe8res »), donc on accepte les trois
 * écritures : littérale, \xHH et \uXXXX.
 */
const contient = (js, texte) => {
  const META = new Set(['.', '*', '+', '?', '^', '$', '{', '}', '(', ')', '|', '[', ']', '/', '\\'])
  const motif = [...texte]
    .map((c) => {
      const code = c.codePointAt(0)
      if (code < 128) return META.has(c) ? '\\' + c : c
      const hex = code.toString(16)
      return '(?:' + c + '|\\\\x' + hex.padStart(2, '0') + '|\\\\u' + hex.padStart(4, '0') + ')'
    })
    .join('')
  return new RegExp(motif, 'i').test(js)
}

const chunkDe = async (page) => {
  const html = await (await fetch(BASE + page)).text()
  const m = html.match(new RegExp(`/_next/static/chunks/app${page}/page-[^"]+\\.js`))
  assert(m, `chunk introuvable pour ${page}`)
  return (await fetch(BASE + m[0])).text()
}

;(async () => {
  console.log(`\nSite testé : ${BASE}`)
  await connectDB()
  const avant = await GiftCard.countDocuments()

  /* ---------------------------------------------------- authentification --- */
  console.log('\n\x1b[1mAuthentification\x1b[0m\n')

  let token = null

  await test('login avec les bons identifiants → 200 + jeton admin', async () => {
    const r = await fetch(BASE + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD }),
    })
    eq(r.status, 200, 'statut')
    const d = await r.json()
    token = d.token
    eq(d.user.role, 'admin', 'rôle')
    assert(token, 'jeton présent')
  })

  await test('le jeton dure bien 30 jours', async () => {
    const exp = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()).exp
    eq(Math.round((exp * 1000 - Date.now()) / 86400000), 30, 'durée')
  })

  await test('mauvais mot de passe → 401', async () => {
    const r = await fetch(BASE + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: process.env.ADMIN_EMAIL, password: 'mauvais-mot-de-passe' }),
    })
    eq(r.status, 401, 'statut')
  })

  await test('sans jeton → 401', async () => {
    eq((await get('/api/gift-cards?limit=5')).status, 401, 'statut')
  })

  await test('jeton EXPIRÉ signé avec le vrai secret → 401', async () => {
    const perime = jwt.sign(
      { userId: 'admin', email: process.env.ADMIN_EMAIL, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '-27d' }
    )
    eq((await get('/api/gift-cards?limit=5', perime)).status, 401, 'statut')
  })

  await test('jeton signé avec un mauvais secret → 401', async () => {
    const faux = jwt.sign({ userId: 'admin', role: 'admin' }, 'mauvais-secret', { expiresIn: '30d' })
    eq((await get('/api/gift-cards?limit=5', faux)).status, 401, 'statut')
  })

  await test('jeton bricolé en rôle admin (alg none) → 401', async () => {
    const entete = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')
    const corps = Buffer.from(
      JSON.stringify({ userId: 'admin', role: 'admin', exp: Math.floor(Date.now() / 1000) + 9999 })
    ).toString('base64url')
    eq((await get('/api/gift-cards?limit=5', `${entete}.${corps}.`)).status, 401, 'statut')
  })

  await test('toutes les écritures admin refusent l’anonyme', async () => {
    const cas = [
      ['POST', '/api/gift-cards', { initialAmount: 50 }],
      ['POST', '/api/gift-cards/redeem', { code: 'GC-XXXX', amount: 5 }],
      ['PUT', '/api/gallery/settings', { enabled: false }],
      ['POST', '/api/gallery/images', { title: 'x', imageUrl: 'x' }],
      ['PUT', '/api/blog/settings', { enabled: false }],
      ['POST', '/api/blog/posts', { title: 'x' }],
      ['PUT', '/api/marketing', { enabled: false }],
      ['PUT', '/api/content/accueil', { content: {} }],
      ['POST', '/api/seed', {}],
    ]
    const ouverts = []
    for (const [method, url, body] of cas) {
      const r = await fetch(BASE + url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (r.status !== 401) ouverts.push(`${method} ${url} → ${r.status}`)
    }
    eq(ouverts.length, 0, `écritures accessibles sans jeton : ${ouverts.join(', ')}`)
  })

  /* ------------------------------------------------------- les données ----- */
  console.log('\n\x1b[1mCe qu’elle voit une fois connectée\x1b[0m\n')

  let cartes = []

  await test('la liste complète des cartes remonte', async () => {
    const r = await get('/api/gift-cards?limit=1000', token)
    eq(r.status, 200, 'statut')
    const d = await r.json()
    cartes = d.giftCards
    assert(cartes.length > 0, 'liste non vide')
    eq(cartes.length, d.pagination.total, 'tout tient en une page')
  })

  await test('chaque carte porte son historique de transactions', async () => {
    const sans = cartes.filter((c) => !(c.transactions || []).length)
    eq(sans.length, 0, `cartes sans historique : ${sans.map((c) => c.code).join(', ')}`)
  })

  await test('chaque carte a code, montant, solde, statut et date', async () => {
    const bancales = cartes.filter(
      (c) =>
        !/^GC-[A-Z0-9]{4}$/.test(c.code) ||
        typeof c.initialAmount !== 'number' ||
        typeof c.balance !== 'number' ||
        !c.status ||
        !c.createdAt
    )
    eq(bancales.length, 0, 'cartes incomplètes')
  })

  await test('la corbeille reste hors des listes normales', async () => {
    eq(cartes.filter((c) => c.deletedAt).length, 0, 'aucune supprimée dans la liste')
    const d = await (await get('/api/gift-cards?limit=100&status=deleted', token)).json()
    assert(d.giftCards.every((c) => c.deletedAt), 'la corbeille ne contient que des supprimées')
    console.log(`      corbeille : ${d.giftCards.length} carte(s)`)
  })

  await test('filtre par statut et recherche fonctionnent', async () => {
    const actives = await (await get('/api/gift-cards?limit=1000&status=active', token)).json()
    assert(actives.giftCards.every((c) => c.status === 'active'), 'filtre statut')

    const cible = cartes[0]
    const parCode = await (await get(`/api/gift-cards?search=${cible.code}`, token)).json()
    assert(parCode.giftCards.some((c) => c.code === cible.code), 'recherche par code')

    const avecEmail = cartes.find((c) => c.purchasedBy?.email)
    const parEmail = await (
      await get(`/api/gift-cards?search=${encodeURIComponent(avecEmail.purchasedBy.email)}`, token)
    ).json()
    assert(parEmail.giftCards.some((c) => c.code === avecEmail.code), 'recherche par email')
  })

  await test('les chiffres du tableau de bord sont cohérents', async () => {
    const actives = cartes.filter((c) => c.status === 'active')
    const enLigne = cartes.filter((c) => c.source === 'online')
    const circulation = actives.reduce((s, c) => s + c.balance, 0)
    const emis = cartes.reduce((s, c) => s + c.initialAmount, 0)
    assert(circulation <= emis, 'circulation supérieure au total émis')
    assert(cartes.every((c) => c.balance <= c.initialAmount), 'solde supérieur au montant initial')
    console.log(
      `      ${cartes.length} cartes · ${actives.length} actives · ${circulation} € en circulation · ` +
        `${enLigne.length} en ligne / ${cartes.length - enLigne.length} en magasin`
    )
  })

  await test('la config publique n’expose aucune clé secrète', async () => {
    const d = await (await get('/api/gift-cards/config')).json()
    eq(d.stripeConfigured, true, 'Stripe configuré')
    assert(d.stripePublishableKey.startsWith('pk_'), 'clé publique')
    assert(!JSON.stringify(d).includes('sk_'), 'clé secrète exposée')
  })

  /* --------------------------------------------------- pages déployées ----- */
  console.log('\n\x1b[1mPages déployées\x1b[0m\n')

  await test('la page de connexion se sert', async () => {
    eq((await fetch(BASE + '/admin/login')).status, 200, 'statut')
  })

  await test('le tableau de bord embarque le récapitulatif cartes cadeaux', async () => {
    const js = await chunkDe('/admin/dashboard')
    for (const s of [
      'Vos cartes cadeaux',
      'Cartes actives',
      'Valeur en circulation',
      'Dernières cartes',
      'En magasin',
      'Voir toute la liste',
    ]) {
      assert(contient(js, s), `« ${s} » absent du tableau de bord`)
    }
  })

  await test('le bouton « données d’exemple » a disparu du tableau de bord', async () => {
    const js = await chunkDe('/admin/dashboard')
    assert(!contient(js, 'Charger les donn'), 'bouton de seed encore présent')
    assert(!contient(js, '/api/seed'), 'appel au seed encore présent')
  })

  await test('la page cartes cadeaux gère l’erreur et la session expirée', async () => {
    const js = await chunkDe('/admin/gift-cards')
    assert(contient(js, 'Réessayer'), 'bandeau d’erreur absent')
    assert(contient(js, 'expired=1'), 'redirection de session expirée absente')
    assert(contient(js, 'Connexion au serveur impossible'), 'message réseau absent')
  })

  /* --------------------------------------- Stripe (compte live, lecture) --- */
  console.log('\n\x1b[1mStripe — lecture seule\x1b[0m\n')

  const stripe = await getStripe()
  const avecPi = await GiftCard.findOne({ stripePaymentIntentId: { $type: 'string' } }).lean()

  await test('un vrai paiement carte cadeau est reconnu pour son montant', async () => {
    const v = await verifyGiftCardPayment(avecPi.stripePaymentIntentId, avecPi.initialAmount)
    eq(v.ok, true, `vérification (${v.reason || ''})`)
    eq(v.testMode, false, 'mode live')
  })

  await test('le même paiement avec un montant divergent est refusé', async () => {
    const v = await verifyGiftCardPayment(avecPi.stripePaymentIntentId, avecPi.initialAmount + 10)
    eq(v.ok, false, 'refusé')
    assert(/montant/i.test(v.reason || ''), `motif « montant » attendu, reçu « ${v.reason} »`)
  })

  await test('un paiement qui n’est PAS une carte cadeau est refusé (anti-rejeu)', async () => {
    let autre = null
    for await (const pi of stripe.paymentIntents.list({ limit: 100 })) {
      if (pi.status === 'succeeded' && pi.metadata?.kind !== 'gift_card') {
        autre = pi
        break
      }
    }
    assert(autre, 'aucun paiement non-carte-cadeau trouvé')
    const v = await verifyGiftCardPayment(autre.id, autre.amount_received / 100)
    eq(v.ok, false, 'refusé')
    assert(/ne correspond pas/i.test(v.reason || ''), `motif attendu, reçu « ${v.reason} »`)
  })

  await test('rejouer un paiement encaissé ne crée pas de seconde carte', async () => {
    const n = await GiftCard.countDocuments()
    const carte = await giftcard.purchaseGiftCard(
      { amount: avecPi.initialAmount, purchaser: { email: 'verification@exemple.fr' } },
      avecPi.stripePaymentIntentId
    )
    eq(carte.code, avecPi.code, 'carte existante renvoyée')
    eq(await GiftCard.countDocuments(), n, 'aucune carte créée')
  })

  await test('tous les paiements carte cadeau encaissés ont leur carte', async () => {
    const enBase = new Set(
      (await GiftCard.find({ stripePaymentIntentId: { $type: 'string' } }, 'stripePaymentIntentId').lean())
        .map((d) => d.stripePaymentIntentId)
    )
    const orphelins = []
    let encaisse = 0
    let n = 0
    for await (const pi of stripe.paymentIntents.list({ limit: 100 })) {
      if (pi.status !== 'succeeded' || pi.metadata?.kind !== 'gift_card') continue
      n++
      encaisse += pi.amount_received
      if (!enBase.has(pi.id)) orphelins.push(pi.id)
    }
    console.log(`      ${n} paiements · ${(encaisse / 100).toFixed(2)} € encaissés`)
    eq(orphelins.length, 0, `paiements sans carte : ${orphelins.join(', ')}`)
  })

  /* --------------------------------------------------------- Resend ------- */
  console.log('\n\x1b[1mConfiguration\x1b[0m\n')

  await test('Resend : clé API et adresse expéditeur présentes', async () => {
    const k = getApiKeys()
    assert(k.resendApiKey, 'RESEND_API_KEY manquante')
    assert(k.resendFromEmail, 'RESEND_FROM_EMAIL manquante')
  })

  // Constat, pas un échec : documente l'état du filet anti-paiement-orphelin.
  console.log(
    getApiKeys().stripeWebhookSecret
      ? '  \x1b[32m✓\x1b[0m Stripe : secret de webhook présent (filet anti-orphelin actif)'
      : '  \x1b[33m∅\x1b[0m Stripe : STRIPE_WEBHOOK_SECRET absent — filet anti-orphelin inactif'
  )

  /* ------------------------------------------------------- garde-fou ------- */
  const apres = await GiftCard.countDocuments()
  console.log(
    `\nCartes en base : ${avant} avant, ${apres} après — ${
      avant === apres ? 'inchangé' : '\x1b[31mMODIFIÉ\x1b[0m'
    }`
  )
  if (avant !== apres) failed++

  console.log(`\n\x1b[1mRésultat : ${passed} réussi(s), ${failed} échec(s)\x1b[0m\n`)
  await mongoose.disconnect()
  process.exit(failed ? 1 : 0)
})().catch(async (err) => {
  console.error('\n\x1b[31mÉchec global :\x1b[0m', err)
  try {
    await mongoose.disconnect()
  } catch {}
  process.exit(1)
})
