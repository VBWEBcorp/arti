import sharp from 'sharp'

interface OptimizeOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

export async function optimizeImage(
  buffer: Buffer,
  options: OptimizeOptions = {}
): Promise<{ buffer: Buffer; contentType: string; ext: string }> {
  const { maxWidth = 1920, maxHeight = 1080, quality = 80 } = options

  const image = sharp(buffer)
  const metadata = await image.metadata()

  // Resize si nécessaire
  if (
    (metadata.width && metadata.width > maxWidth) ||
    (metadata.height && metadata.height > maxHeight)
  ) {
    image.resize(maxWidth, maxHeight, { fit: 'inside', withoutEnlargement: true })
  }

  // Convertir en WebP
  const optimized = await image.webp({ quality }).toBuffer()

  return {
    buffer: optimized,
    contentType: 'image/webp',
    ext: 'webp',
  }
}

/**
 * Luminance moyenne perçue d'une image (0 = noir, 255 = blanc).
 * Sert à choisir automatiquement une couleur de texte lisible par-dessus.
 */
export async function averageLuminance(buffer: Buffer): Promise<number> {
  const { channels } = await sharp(buffer).stats()
  const [r, g, b] = channels
  if (!r || !g || !b) return 255 // image mono / sans couleur : on suppose claire
  return 0.299 * r.mean + 0.587 * g.mean + 0.114 * b.mean
}
