import { cn } from '@/lib/utils'

type ImagePlaceholderProps = {
  label?: string
  className?: string
  tone?: 'beige' | 'sauge' | 'cream' | 'dark'
  aspect?: 'square' | 'video' | 'portrait' | 'wide'
}

/**
 * Placeholder photo en attendant les visuels réels de la cliente.
 * À remplacer par <Image src=… /> via le back-office CMS.
 */
export function ImagePlaceholder({
  label = 'Photo ARTI',
  className,
  tone = 'beige',
  aspect = 'square',
}: ImagePlaceholderProps) {
  const tones = {
    beige: 'bg-gradient-to-br from-[#E8DFC6] via-[#D8CEB3] to-[#C8BD9D] text-[#1B2E4A]/55',
    sauge: 'bg-gradient-to-br from-[#A6AC92] via-[#91977D] to-[#757A65] text-white/70',
    cream: 'bg-gradient-to-br from-[#F5EFE0] via-[#EFE7D2] to-[#E3DABE] text-[#1B2E4A]/45',
    dark: 'bg-gradient-to-br from-[#3A4C66] via-[#2A3D5A] to-[#1B2E4A] text-white/70',
  }
  const aspects = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    wide: 'aspect-[4/3]',
  }
  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden text-xs uppercase tracking-[0.2em]',
        tones[tone],
        aspects[aspect],
        className
      )}
      role="img"
      aria-label={label}
    >
      <span className="opacity-60">{label}</span>
    </div>
  )
}
