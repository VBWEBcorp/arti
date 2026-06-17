import path from 'path'
import { readFile } from 'fs/promises'

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

// Visuel officiel de la carte (PDF 2 pages : recto illustre + verso a champs).
const TEMPLATE_PATH = path.join(process.cwd(), 'public', 'brand', 'carte-cadeau-template.pdf')

const eur = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)

const longDate = (d: Date) =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(d)

/**
 * Remplace les espaces insecables/fines par un espace simple. Intl en glisse
 * (ex. avant le « EUR ») et l'encodage WinAnsi des polices standard pdf-lib ne
 * sait pas les coder : sans ca, drawText leverait.
 */
function clean(s: string): string {
  return Array.from(s, (ch) => {
    const c = ch.charCodeAt(0)
    // NBSP, narrow NBSP, thin space, figure space, word joiner
    return c === 0x00a0 || c === 0x202f || c === 0x2009 || c === 0x2007 || c === 0x2060
      ? ' '
      : ch
  }).join('')
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1).trimEnd() + '…' : s
}

/**
 * Remplit le verso du visuel officiel (numero, montant, destinataire, date de
 * validite) et renvoie le PDF pret a joindre a l'email. Le recto illustre est
 * laisse intact ; on ecrit en vectoriel (qualite impression, pas de raster).
 *
 * Coordonnees en points (origine bas-gauche), calees sur la maquette
 * 297.8 x 425.2 pt. Centrage horizontal sur la largeur de la carte.
 */
export async function renderGiftCardPdf(card: {
  code: string
  amount: number
  expiresAt?: Date | null
  recipientName?: string | null
}): Promise<Buffer> {
  const bytes = await readFile(TEMPLATE_PATH)
  const doc = await PDFDocument.load(bytes)
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)

  const verso = doc.getPages()[1]
  const { width } = verso.getSize()
  const center = width / 2
  const ink = rgb(0.12, 0.14, 0.13) // proche du #1f2421 de la marque

  const drawCentered = (text: string, y: number, size: number, f = font) => {
    const t = clean(text)
    const w = f.widthOfTextAtSize(t, size)
    verso.drawText(t, { x: center - w / 2, y, size, font: f, color: ink })
  }

  // Numero : a droite du libelle (cale pour ne pas deborder sur @arti.rennes).
  {
    const size = 11
    const w = bold.widthOfTextAtSize(card.code, size)
    const x = Math.min(242, 286 - w)
    verso.drawText(card.code, { x, y: 356, size, font: bold, color: ink })
  }

  // Valeur (montant)
  drawCentered(eur(card.amount), 307, 13, bold)

  // A l'attention de (si destinataire nomme)
  if (card.recipientName) drawCentered(truncate(card.recipientName, 28), 257, 12)

  // Valable jusqu'au (date de peremption)
  if (card.expiresAt) drawCentered(longDate(new Date(card.expiresAt)), 207, 12)

  return Buffer.from(await doc.save())
}
