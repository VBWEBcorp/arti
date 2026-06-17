import path from 'path'
import { readFile } from 'fs/promises'

import { PDFDocument, PDFFont, StandardFonts, rgb } from 'pdf-lib'

// Visuel officiel de la carte (PDF 2 pages : recto illustre + verso a champs).
const TEMPLATE_PATH = path.join(process.cwd(), 'public', 'brand', 'carte-cadeau-template.pdf')

const eur = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)

const longDate = (d: Date) =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(d)

// Codepoints > 0xFF encodables en WinAnsi (CP1252) ; tout le reste est retire.
const WINANSI_EXTRA = new Set([
  0x20ac, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020, 0x2021, 0x02c6, 0x2030, 0x0160, 0x2039, 0x0152,
  0x017d, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2013, 0x2014, 0x02dc, 0x2122, 0x0161, 0x203a,
  0x0153, 0x017e, 0x0178,
])

/**
 * Rend une chaine sure pour l'encodage WinAnsi des polices standard pdf-lib :
 * normalise les espaces insecables/fines (Intl en glisse, ex. avant « EUR ») et
 * retire les caracteres non encodables (emoji...) qui feraient lever drawText.
 */
function pdfSafe(s: string): string {
  let out = ''
  for (const ch of s) {
    const c = ch.codePointAt(0) as number
    if (c === 0x00a0 || c === 0x202f || c === 0x2009 || c === 0x2007 || c === 0x2060) out += ' '
    else if (c >= 0x20 && c <= 0x7e) out += ch
    else if (c >= 0xa0 && c <= 0xff) out += ch
    else if (WINANSI_EXTRA.has(c)) out += ch
    // sinon : caractere non encodable -> ignore
  }
  return out
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1).trimEnd() + '…' : s
}

/** Decoupe un texte en lignes tenant dans `maxWidth` (mots entiers). */
function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let cur = ''
  for (const word of words) {
    const trial = cur ? `${cur} ${word}` : word
    if (cur && font.widthOfTextAtSize(trial, size) > maxWidth) {
      lines.push(cur)
      cur = word
    } else {
      cur = trial
    }
  }
  if (cur) lines.push(cur)
  return lines
}

// Lignes du modele (verso), mesurees en pt (origine bas-gauche).
const RULE_VALEUR = 297.3
const RULE_ATTENTION = 251.0
const RULE_VALABLE = 205.8
const RULES_MESSAGE = [169.8, 158.8, 147.5, 136.0, 124.8]

/**
 * Remplit le verso du visuel officiel (numero, montant, destinataire, date de
 * validite, message) et renvoie le PDF pret a joindre a l'email. Le recto
 * illustre est laisse intact ; on ecrit en vectoriel (qualite impression).
 *
 * Chaque valeur est posee ~10 pt au-dessus de sa ligne pour degager le libelle
 * place dessous ; le message est decoupe sur les lignes « Message ».
 */
export async function renderGiftCardPdf(card: {
  code: string
  amount: number
  expiresAt?: Date | null
  recipientName?: string | null
  message?: string | null
}): Promise<Buffer> {
  const bytes = await readFile(TEMPLATE_PATH)
  const doc = await PDFDocument.load(bytes)
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique)

  const verso = doc.getPages()[1]
  const { width } = verso.getSize()
  const center = width / 2
  const ink = rgb(0.12, 0.14, 0.13) // proche du #1f2421 de la marque

  const drawCentered = (text: string, y: number, size: number, f = font) => {
    const t = pdfSafe(text)
    const w = f.widthOfTextAtSize(t, size)
    verso.drawText(t, { x: center - w / 2, y, size, font: f, color: ink })
  }

  // Numero : sous le libelle « N » (cale a gauche du N, pas de chevauchement).
  verso.drawText(pdfSafe(card.code), { x: 210, y: 337, size: 11, font: bold, color: ink })

  // Valeur (montant)
  drawCentered(eur(card.amount), RULE_VALEUR + 10.5, 13, bold)

  // A l'attention de (si destinataire nomme)
  if (card.recipientName) drawCentered(truncate(card.recipientName, 28), RULE_ATTENTION + 10, 12)

  // Valable jusqu'au (date de peremption)
  if (card.expiresAt) drawCentered(longDate(new Date(card.expiresAt)), RULE_VALABLE + 10, 12)

  // Message : decoupe sur les lignes « Message », aligne a gauche et pose sur
  // les lignes (comme une note manuscrite). Italique, tronque a 5 lignes.
  const rawMsg = card.message ? pdfSafe(card.message).replace(/\s+/g, ' ').trim() : ''
  if (rawMsg) {
    const size = 10
    const left = 40
    const maxWidth = width - left * 2 // marges symetriques
    const max = RULES_MESSAGE.length
    let lines = wrapText(rawMsg, italic, size, maxWidth)
    if (lines.length > max) {
      lines = lines.slice(0, max)
      let last = lines[max - 1]
      while (last && italic.widthOfTextAtSize(`${last}…`, size) > maxWidth) last = last.slice(0, -1)
      lines[max - 1] = `${last.replace(/\s+$/, '')}…`
    }
    lines.forEach((line, i) => {
      verso.drawText(line, { x: left, y: RULES_MESSAGE[i] + 2.5, size, font: italic, color: ink })
    })
  }

  return Buffer.from(await doc.save())
}
