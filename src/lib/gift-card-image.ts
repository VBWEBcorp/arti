import path from 'path'
import { readFile } from 'fs/promises'

import sharp from 'sharp'

import { type GiftCardDesign, hexToRgb, isLightColor } from './gift-card-design'

const W = 720
const H = 450 // ratio 1.6:1, comme le visuel web

const eur = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)

function escapeXml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1).trimEnd() + '…' : s
}

/** Récupère le buffer de l'image de fond (URL http(s) ou chemin local /uploads/...). */
async function loadBackground(url: string): Promise<Buffer | null> {
  try {
    if (/^https?:\/\//i.test(url)) {
      const res = await fetch(url)
      if (!res.ok) return null
      return Buffer.from(await res.arrayBuffer())
    }
    // Chemin relatif servi depuis public/
    const rel = url.replace(/^\//, '')
    return await readFile(path.join(process.cwd(), 'public', rel))
  } catch {
    return null
  }
}

/**
 * Rend la carte cadeau comme une image PNG (fond + texte + code « gravés »).
 * Insensible au dark mode et identique dans tous les clients mail, contrairement
 * au HTML. Reproduit la mise en page du composant web GiftCardVisual.
 */
export async function renderGiftCardImage(
  design: GiftCardDesign,
  card: { amount: number; code: string; recipientName?: string; message?: string }
): Promise<Buffer> {
  const light = isLightColor(design.textColor)
  const { r, g, b } = hexToRgb(design.textColor)
  const ink = `rgb(${r},${g},${b})`
  const scrimOpacity = design.scrim / 100
  const scrimFill = light ? 'black' : 'white' // assombrit (texte clair) / éclaircit (texte foncé)

  // Couche de fond
  let baseBuf: Buffer
  const bgBuf = design.backgroundUrl ? await loadBackground(design.backgroundUrl) : null
  if (bgBuf) {
    baseBuf = await sharp(bgBuf).resize(W, H, { fit: 'cover', position: 'centre' }).png().toBuffer()
  } else {
    baseBuf = await sharp({ create: { width: W, height: H, channels: 4, background: '#7d8a6f' } })
      .png()
      .toBuffer()
  }

  const heading = escapeXml((design.heading || 'Carte cadeau').toUpperCase())
  const amount = escapeXml(eur(card.amount))
  const code = escapeXml(card.code)

  // Couche SVG : voile de lisibilité + textes
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  ${scrimOpacity > 0 ? `<rect width="${W}" height="${H}" fill="${scrimFill}" fill-opacity="${scrimOpacity}"/>` : ''}
  <text x="48" y="62" font-family="sans-serif" font-size="30" font-weight="700" fill="${ink}">ARTI</text>
  <text x="49" y="90" font-family="sans-serif" font-size="14" letter-spacing="4" fill="${ink}" opacity="0.82">${heading}</text>
  <text x="${W - 48}" y="84" text-anchor="end" font-family="sans-serif" font-size="58" font-weight="600" fill="${ink}">${amount}</text>
  ${
    card.recipientName
      ? `<text x="48" y="${H - 104}" font-family="sans-serif" font-size="20" fill="${ink}" opacity="0.9">Offert à ${escapeXml(card.recipientName)}</text>`
      : ''
  }
  ${
    card.message
      ? `<text x="48" y="${H - 76}" font-family="sans-serif" font-size="16" font-style="italic" fill="${ink}" opacity="0.82">« ${escapeXml(truncate(card.message, 56))} »</text>`
      : ''
  }
  <text x="48" y="${H - 34}" font-family="monospace" font-size="32" font-weight="700" letter-spacing="6" fill="${ink}">${code}</text>
</svg>`

  return sharp(baseBuf)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png()
    .toBuffer()
}
