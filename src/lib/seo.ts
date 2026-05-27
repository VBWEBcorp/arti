export const siteConfig = {
  name: 'ARTI Café Céramique',
  shortName: 'ARTI',
  url: 'https://articafeceramique.fr',
  locale: 'fr_FR',
  description:
    'ARTI est un coffee shop et atelier de peinture sur céramique au cœur de Rennes. Vivez un moment créatif unique en personnalisant la pièce de votre choix tout en dégustant un délicieux goûter.',
  ogImage: 'https://articafeceramique.fr/og.png',
  twitterHandle: '@articafeceramique',
  themeColor: '#9CAA8B',
  phone: '+33 6 33 11 30 54',
  phoneDisplay: '06 33 11 30 54',
  email: 'hello@articafeceramique.fr',
  instagram: 'https://www.instagram.com/arti.rennes/?hl=fr',
  address: {
    street: '10 rue Poullain Duparc',
    city: 'Rennes',
    postalCode: '35000',
    country: 'FR',
    access: 'Métro République, Bus C4',
  },
  openingHours: [
    { day: 'Lundi', value: 'fermé' },
    { day: 'Mardi', value: 'fermé' },
    { day: 'Mercredi', value: '10H-19H' },
    { day: 'Jeudi', value: '14H-20H' },
    { day: 'Vendredi', value: '14H-20H' },
    { day: 'Samedi', value: '10H-19H' },
    { day: 'Dimanche', value: '10H-17H' },
  ],
  reservationUrl: 'https://articafeceramique.fr/reserver',
} as const

export type SeoMeta = {
  title?: string
  description?: string
  canonical?: string
  ogImage?: string
  ogType?: 'website' | 'article'
  noindex?: boolean
  jsonLd?: Record<string, unknown>
}

export function buildTitle(page?: string) {
  if (!page) return siteConfig.name
  return `${page} | ${siteConfig.name}`
}

export const routes = [
  '/',
  '/le-concept',
  '/arti-ceramiques',
  '/peinture-sur-ceramique-a-rennes',
  '/infos-pratiques',
  '/arti-cadeaux',
  '/boutique',
  '/produit/carte-cadeau',
  '/faq',
  '/mentions-legales',
  '/politique-de-confidentialite',
] as const
