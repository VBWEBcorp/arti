/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Test fonctionnel de bout en bout — cartes cadeaux + Resend.
 *
 *   npm run test:giftcards                 # logique + Stripe (test) + PDF + config Resend
 *   npm run test:giftcards -- --send-email=qqn@exemple.fr   # + 1 envoi réel via Resend
 *
 * Exécute le vrai cycle de vie (création, solde, utilisation, annulation,
 * réactivation, achat Stripe en mode test) contre la base MongoDB configurée,
 * puis SUPPRIME toutes les cartes de test créées. Aucune dépendance de test
 * ajoutée : on charge directement les modules de l'app via un hook TS.
 *
 * NB : l'envoi d'email réel est opt-in (quota Resend limité). La construction
 * du payload + du PDF joint est toujours vérifiée.
 */
const fs = require('fs')
const path = require('path')
const Module = require('module')
const ts = require('typescript')

const ROOT = process.cwd()
const SRC = path.join(ROOT, 'src')

// --- charge .env.local dans process.env ---
function loadEnv(file) {
  if (!fs.existsSync(file)) return
  for (const raw of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    let val = line.slice(eq + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = val
  }
}
loadEnv(path.join(ROOT, '.env.local'))

// --- résout les alias '@/...' vers src/... ---
const origResolve = Module._resolveFilename
Module._resolveFilename = function (request, ...rest) {
  if (request.startsWith('@/')) request = path.join(SRC, request.slice(2))
  return origResolve.call(this, request, ...rest)
}

// --- transpile .ts à la volée (CommonJS) ---
const compileTs = function (module, filename) {
  const src = fs.readFileSync(filename, 'utf8')
  const js = ts.transpileModule(src, {
    compilerOptions: { module: 'commonjs', target: 'es2019', esModuleInterop: true },
    fileName: filename,
  }).outputText
  module._compile(js, filename)
}
require.extensions['.ts'] = compileTs

// --- modules de l'app ---
const { connectDB } = require('@/lib/db')
const giftcard = require('@/lib/giftcard')
const { GiftCard } = require('@/models/GiftCard')
const { getStripe, isStripeConfigured } = require('@/lib/stripe')
const { renderGiftCardPdf } = require('@/lib/gift-card-pdf')
const { sendEmail } = require('@/lib/resend')
const { getApiKeys } = require('@/lib/apikeys')
const mongoose = require('mongoose')

// --- mini-harnais d'assertions ---
let passed = 0
let failed = 0
const created = [] // _id des cartes créées, supprimées à la fin
const track = (card) => {
  if (card && card._id) created.push(card._id)
  return card
}

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
function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion échouée')
}
function eq(a, b, msg) {
  if (a !== b) throw new Error(`${msg || 'égalité attendue'} — reçu ${JSON.stringify(a)}, attendu ${JSON.stringify(b)}`)
}
async function throwsWith(fn, sub) {
  try {
    await fn()
  } catch (err) {
    if (sub && !String(err.message).toLowerCase().includes(sub.toLowerCase())) {
      throw new Error(`erreur attendue contenant « ${sub} », reçu « ${err.message} »`)
    }
    return err
  }
  throw new Error(`une erreur était attendue${sub ? ` (« ${sub} »)` : ''}, aucune levée`)
}

const argEmail = (process.argv.find((a) => a.startsWith('--send-email=')) || '').split('=')[1] || ''

;(async () => {
  console.log('\n\x1b[1mTest cartes cadeaux + Resend\x1b[0m')
  await connectDB()
  console.log(`  base : ${mongoose.connection.name} · Stripe configuré : ${await isStripeConfigured()}\n`)

  // ---------------------------------------------------------------- création
  console.log('Création & solde')
  let card
  await test('createGiftCard : carte active, code GC-XXXX-XXXX, validité +1 an, tx purchase', async () => {
    card = track(await giftcard.createGiftCard({ initialAmount: 30 }))
    eq(card.status, 'active', 'statut')
    eq(card.balance, 30, 'solde')
    eq(card.initialAmount, 30, 'montant initial')
    assert(/^GC-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(card.code), `format de code invalide : ${card.code}`)
    assert(!/[IO01]/.test(card.code.replace(/^GC-/, '').replace('-', '')), 'le code ne doit pas contenir I/O/0/1')
    const days = (new Date(card.expiresAt) - Date.now()) / 86400000
    assert(days > 360 && days < 370, `validité ~1 an attendue, reçu ${days.toFixed(0)} j`)
    eq(card.transactions[0].type, 'purchase', 'type de la 1re transaction')
  })

  await test('createGiftCard : codes uniques sur 5 créations', async () => {
    const codes = new Set([card.code])
    for (let i = 0; i < 5; i++) {
      const c = track(await giftcard.createGiftCard({ initialAmount: 10 }))
      assert(!codes.has(c.code), `collision de code : ${c.code}`)
      codes.add(c.code)
    }
  })

  await test('createGiftCard : expiresAt explicite respecté', async () => {
    const exp = new Date('2030-01-15')
    const c = track(await giftcard.createGiftCard({ initialAmount: 20, expiresAt: exp }))
    eq(new Date(c.expiresAt).toISOString(), exp.toISOString(), 'expiresAt')
  })

  await test('checkBalance : renvoie le solde d’une carte active', async () => {
    const r = await giftcard.checkBalance(card.code)
    eq(r.balance, 30, 'solde')
    eq(r.status, 'active', 'statut')
  })

  await test('checkBalance : code en minuscules / avec espaces normalisé', async () => {
    const r = await giftcard.checkBalance(`  ${card.code.toLowerCase()}  `)
    eq(r.code, card.code, 'code normalisé')
  })

  await test('checkBalance : carte inconnue → erreur 404', async () => {
    const e = await throwsWith(() => giftcard.checkBalance('GC-ZZZZ-ZZZZ'), 'introuvable')
    eq(e.statusCode, 404, 'statusCode')
  })

  await test('checkBalance : carte expirée → statut « expirée » mais solde renvoyé (utilisable)', async () => {
    const past = track(await giftcard.createGiftCard({ initialAmount: 15, expiresAt: new Date('2000-01-01') }))
    const r = await giftcard.checkBalance(past.code)
    eq(r.balance, 15, 'solde renvoyé malgré expiration')
    eq(r.status, 'expired', 'statut expirée')
    const reloaded = await GiftCard.findById(past._id)
    eq(reloaded.status, 'expired', 'statut persistant')
  })

  // -------------------------------------------------------------- utilisation
  console.log('\nUtilisation sur place (débit partiel — solde réutilisable)')
  await test('redeemOnSite : débit partiel → solde décrémenté, carte encore active', async () => {
    const c = track(await giftcard.createGiftCard({ initialAmount: 50 }))
    const after = await giftcard.redeemOnSite(c.code, { id: 'admin', name: 'Test' }, 30, 'Atelier')
    eq(after.status, 'active', 'statut')
    eq(after.balance, 20, 'solde restant')
    assert(
      after.transactions.some((t) => t.type === 'redemption_on_site' && t.amount === 30),
      'transaction de débit (30€) absente'
    )
  })

  await test('redeemOnSite : plusieurs débits successifs jusqu’à épuisement', async () => {
    const c = track(await giftcard.createGiftCard({ initialAmount: 50 }))
    await giftcard.redeemOnSite(c.code, { id: 'admin', name: 'Test' }, 30)
    const after = await giftcard.redeemOnSite(c.code, { id: 'admin', name: 'Test' }, 20)
    eq(after.balance, 0, 'solde')
    eq(after.status, 'used', 'statut épuisé')
  })

  await test('redeemOnSite : débit supérieur au solde refusé', async () => {
    const c = track(await giftcard.createGiftCard({ initialAmount: 30 }))
    await throwsWith(() => giftcard.redeemOnSite(c.code, { id: 'admin', name: 'Test' }, 50), 'dépasse')
  })

  await test('redeemOnSite : montant nul refusé', async () => {
    const c = track(await giftcard.createGiftCard({ initialAmount: 30 }))
    await throwsWith(() => giftcard.redeemOnSite(c.code, { id: 'admin', name: 'Test' }, 0), 'supérieur à 0')
  })

  await test('redeemOnSite : carte épuisée refusée', async () => {
    const c = track(await giftcard.createGiftCard({ initialAmount: 20 }))
    await giftcard.redeemOnSite(c.code, { id: 'admin', name: 'Test' }, 20)
    await throwsWith(() => giftcard.redeemOnSite(c.code, { id: 'admin', name: 'Test' }, 5), 'épuisée')
  })

  await test('redeemOnSite : code inconnu → erreur 404', async () => {
    const e = await throwsWith(() => giftcard.redeemOnSite('GC-ZZZZ-ZZZZ', { id: 'admin', name: 'Test' }, 10), 'introuvable')
    eq(e.statusCode, 404, 'statusCode')
  })

  await test('redeemOnSite : carte expirée reste utilisable (débit OK, statut « expirée »)', async () => {
    const c = track(await giftcard.createGiftCard({ initialAmount: 25, expiresAt: new Date('2000-01-01') }))
    const after = await giftcard.redeemOnSite(c.code, { id: 'admin', name: 'Test' }, 10)
    eq(after.balance, 15, 'solde restant')
    eq(after.status, 'expired', 'statut expirée conservé (solde restant)')
  })

  // --------------------------------------------------- annulation / réactivation
  console.log('\nAnnulation & réactivation')
  await test('cancelGiftCard : actif → annulé, solde 0, tx cancellation', async () => {
    const c = track(await giftcard.createGiftCard({ initialAmount: 50 }))
    const cancelled = await giftcard.cancelGiftCard(c._id.toString(), { id: 'admin', name: 'Test' })
    eq(cancelled.status, 'cancelled', 'statut')
    eq(cancelled.balance, 0, 'solde')
    assert(cancelled.transactions.some((t) => t.type === 'cancellation'), 'transaction d’annulation absente')
  })

  await test('cancelGiftCard : double annulation refusée', async () => {
    const c = track(await giftcard.createGiftCard({ initialAmount: 50 }))
    await giftcard.cancelGiftCard(c._id.toString(), { id: 'admin', name: 'Test' })
    await throwsWith(() => giftcard.cancelGiftCard(c._id.toString(), { id: 'admin', name: 'Test' }), 'déjà annulée')
  })

  await test('reactivateGiftCard : annulé → actif, solde restauré', async () => {
    const c = track(await giftcard.createGiftCard({ initialAmount: 60 }))
    await giftcard.cancelGiftCard(c._id.toString(), { id: 'admin', name: 'Test' })
    const re = await giftcard.reactivateGiftCard(c._id.toString(), { id: 'admin', name: 'Test' })
    eq(re.status, 'active', 'statut')
    eq(re.balance, 60, 'solde restauré')
    assert(re.transactions.some((t) => t.type === 'reactivation'), 'transaction de réactivation absente')
  })

  await test('reactivateGiftCard : carte non annulée refusée', async () => {
    const c = track(await giftcard.createGiftCard({ initialAmount: 60 }))
    await throwsWith(() => giftcard.reactivateGiftCard(c._id.toString(), { id: 'admin', name: 'Test' }), 'annulée peut être réactivée')
  })

  // ------------------------------------------------------- achat Stripe (test)
  console.log('\nAchat en ligne (Stripe, mode test)')
  const stripeOn = await isStripeConfigured()
  if (!stripeOn) {
    console.log('  \x1b[33m∅\x1b[0m Stripe non configuré — tests d’achat ignorés')
  } else {
    const stripe = await getStripe()
    await test('purchaseGiftCard : PaymentIntent payé → carte créée', async () => {
      const pi = await stripe.paymentIntents.create({
        amount: 2500, currency: 'eur', confirm: true,
        payment_method: 'pm_card_visa', payment_method_types: ['card'],
        metadata: { kind: 'gift_card' },
      })
      eq(pi.status, 'succeeded', 'statut PaymentIntent')
      const c = track(await giftcard.purchaseGiftCard({ amount: 25 }, pi.id))
      eq(c.balance, 25, 'solde')
      eq(c.source, 'online', 'source')
      eq(c.stripePaymentIntentId, pi.id, 'PaymentIntent lié')

      // idempotence : 2e appel même PI → même carte
      const again = await giftcard.purchaseGiftCard({ amount: 25 }, pi.id)
      eq(again._id.toString(), c._id.toString(), 'idempotence (même carte)')
    })

    await test('purchaseGiftCard : paiement non confirmé → refus 402', async () => {
      const pi = await stripe.paymentIntents.create({
        amount: 2500, currency: 'eur', payment_method_types: ['card'], metadata: { kind: 'gift_card' },
      })
      const e = await throwsWith(() => giftcard.purchaseGiftCard({ amount: 25 }, pi.id))
      eq(e.statusCode, 402, 'statusCode (paiement refusé)')
    })

    await test('purchaseGiftCard : paiement sans tag gift_card → refusé (anti-rejeu)', async () => {
      const pi = await stripe.paymentIntents.create({
        amount: 2500, currency: 'eur', confirm: true,
        payment_method: 'pm_card_visa', payment_method_types: ['card'],
      })
      await throwsWith(() => giftcard.purchaseGiftCard({ amount: 25 }, pi.id), 'ne correspond pas')
    })

    await test('purchaseGiftCard : montant divergent → refusé', async () => {
      const pi = await stripe.paymentIntents.create({
        amount: 2500, currency: 'eur', confirm: true,
        payment_method: 'pm_card_visa', payment_method_types: ['card'],
        metadata: { kind: 'gift_card' },
      })
      await throwsWith(() => giftcard.purchaseGiftCard({ amount: 30 }, pi.id), 'montant')
    })
  }

  // --------------------------------------------------------------------- PDF
  console.log('\nRendu PDF de la carte')
  const isPdf = (buf) => Buffer.isBuffer(buf) && buf.length > 1000 && buf.subarray(0, 5).toString() === '%PDF-'
  const cases = [
    ['minimal (montant seul)', { code: 'GC-AAAA-BBBB', amount: 10 }],
    ['complet (nom + message court)', { code: 'GC-AAAA-BBBB', amount: 50, expiresAt: new Date('2027-06-18'), recipientName: 'Camille', message: 'Joyeux anniversaire !' }],
    ['message long (>5 lignes → tronqué)', { code: 'GC-AAAA-BBBB', amount: 50, message: 'a '.repeat(400).trim() }],
    ['accents & caractères spéciaux + emoji', { code: 'GC-AAAA-BBBB', amount: 49.5, recipientName: 'Éloïse', message: 'Café à l’atelier — œuf, ½ tarif, €, « guillemets » 😀🎁' }],
    ['nom destinataire très long (tronqué)', { code: 'GC-AAAA-BBBB', amount: 20, recipientName: 'Jean-Baptiste-Alexandre-Maximilien de la Tour du Pin' }],
  ]
  for (const [label, input] of cases) {
    await test(`renderGiftCardPdf : ${label}`, async () => {
      const buf = await renderGiftCardPdf(input)
      assert(isPdf(buf), 'sortie PDF invalide')
    })
  }

  // ------------------------------------------------------------------ Resend
  console.log('\nResend (email)')
  await test('configuration : clé API + adresse expéditeur présentes', async () => {
    const keys = getApiKeys()
    assert(keys.resendApiKey, 'RESEND_API_KEY manquante')
    assert(keys.resendFromEmail, 'RESEND_FROM_EMAIL manquante')
  })

  if (argEmail) {
    await test(`envoi réel à ${argEmail} (carte + PDF joint)`, async () => {
      const c = track(await giftcard.createGiftCard({ initialAmount: 25 }))
      const pdf = await renderGiftCardPdf({ code: c.code, amount: c.initialAmount, expiresAt: c.expiresAt })
      const res = await sendEmail({
        to: argEmail,
        subject: 'Test cartes cadeaux ARTI',
        html: `<p>Email de test — carte <strong>${c.code}</strong> (PDF joint).</p>`,
        attachments: [{ filename: `carte-${c.code}.pdf`, content: pdf.toString('base64') }],
      })
      assert(res, 'sendEmail a renvoyé null (Resend a refusé l’email — voir logs)')
    })
  } else {
    console.log('  \x1b[33m∅\x1b[0m envoi réel ignoré (passez --send-email=adresse pour l’activer)')
  }

  // ---------------------------------------------------------------- nettoyage
  if (created.length) {
    const r = await GiftCard.deleteMany({ _id: { $in: created } })
    console.log(`\nNettoyage : ${r.deletedCount} carte(s) de test supprimée(s).`)
  }

  console.log(`\n\x1b[1mRésultat : ${passed} réussi(s), ${failed} échec(s)\x1b[0m\n`)
  await mongoose.disconnect()
  process.exit(failed ? 1 : 0)
})().catch(async (err) => {
  console.error('\n\x1b[31mÉchec global du test :\x1b[0m', err)
  try {
    if (created.length) await GiftCard.deleteMany({ _id: { $in: created } })
    await mongoose.disconnect()
  } catch {}
  process.exit(1)
})
