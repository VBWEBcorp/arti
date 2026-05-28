import type { Metadata } from 'next'
import Image from 'next/image'

import { CeramicsCatalogue, type Ceramic } from '@/components/arti/ceramics-catalogue'
import { InfoCards } from '@/components/arti/info-cards'

export const metadata: Metadata = {
  title: 'Les céramiques',
  description:
    "Découvrez la sélection de céramiques d'ARTI : tasses, bols, assiettes, pichets, vases, théières… Des pièces de céramistes français de 15€ à 50€.",
  alternates: { canonical: '/arti-ceramiques' },
}

// NB : noms réels des pièces, catégories et prix indicatifs (15 à 50 €)
// à ajuster avec le vrai catalogue ARTI.
const ceramics: Ceramic[] = [
  { src: '/brand/produits/Assiette-Moma.jpg', name: 'Assiette Moma', category: 'Assiettes', price: '25 €', alt: 'Assiette Moma peinte à la main' },
  { src: '/brand/produits/Assiette-Fleur-Ours-de-Noel.jpg', name: 'Assiette Fleur & Ours de Noël', category: 'Assiettes', price: '25 €', alt: 'Assiette Fleur & Ours de Noël' },
  { src: '/brand/produits/Tasse-Lila-Univers-marin.jpg', name: 'Tasse Lila Univers marin', category: 'Tasses & mugs', price: '18 €', alt: 'Tasse Lila Univers marin' },
  { src: '/brand/produits/Grand-pichet-Serpent.jpg', name: 'Grand pichet Serpent', category: 'Pichets & vases', price: '45 €', alt: 'Grand pichet Serpent' },
  { src: '/brand/produits/Plateau-de-Noel.jpg', name: 'Plateau de Noël', category: 'Plateaux', price: '35 €', alt: 'Plateau de Noël' },
  { src: '/brand/produits/Bol-breton.jpg', name: 'Bol breton', category: 'Bols', price: '20 €', alt: 'Bol breton' },
  { src: '/brand/produits/Coquetiers-Matchy.jpg', name: 'Coquetiers Matchy', category: 'Coquetiers', price: '15 €', alt: 'Coquetiers Matchy' },
  { src: '/brand/produits/Mug-Take-Away-x-Camille-Esnee.jpg', name: 'Mug Take Away × Camille Esnée', category: 'Tasses & mugs', price: '22 €', alt: 'Mug Take Away x Camille Esnée' },
  { src: '/brand/produits/Assiette-moma-Dinosaure.jpg', name: 'Assiette Moma Dinosaure', category: 'Assiettes', price: '25 €', alt: 'Assiette Moma Dinosaure' },
  { src: '/brand/produits/Soliflore-conique-Floral.jpg', name: 'Soliflore conique Floral', category: 'Pichets & vases', price: '30 €', alt: 'Soliflore conique Floral' },
  { src: '/brand/produits/Bol-conique-Oursons.jpg', name: 'Bol conique Oursons', category: 'Bols', price: '20 €', alt: 'Bol conique Oursons' },
  { src: '/brand/produits/Assiette-moma-Ocean.jpg', name: 'Assiette Moma Océan', category: 'Assiettes', price: '25 €', alt: 'Assiette Moma Océan' },
  { src: '/brand/produits/Plateau-De-Gaston.jpg', name: 'Plateau de Gaston', category: 'Plateaux', price: '35 €', alt: 'Plateau de Gaston' },
  { src: '/brand/produits/Assiette-Noel-chez-Arti.jpg', name: 'Assiette Noël chez Arti', category: 'Assiettes', price: '25 €', alt: 'Assiette Noël chez Arti' },
  { src: '/brand/produits/Coupelle-Leopard.jpg', name: 'Coupelle Léopard', category: 'Coupelles', price: '16 €', alt: 'Coupelle Léopard' },
  { src: '/brand/produits/Coquetiers-Matching.jpg', name: 'Coquetiers Matching', category: 'Coquetiers', price: '15 €', alt: 'Coquetiers Matching' },
]

export default function ArtiCeramiquesPage() {
  return (
    <>
      {/* HERO */}
      <section className="bg-white">
        <div className="grid items-stretch gap-0 md:grid-cols-2">
          {/* Visuel à gauche, sauge — deux pièces qui se chevauchent */}
          <div className="relative z-20 flex items-center bg-sauge px-6 py-16 sm:px-10 sm:py-20 md:px-0 md:py-28">
            <div className="relative w-full">
              <Image
                src="/brand/atelier-3.png"
                alt="Mugs en céramique chez ARTI"
                width={800}
                height={800}
                priority
                className="ml-auto mr-[6%] h-auto w-[50%] shadow-2xl"
              />
              <Image
                src="/brand/ceramiques-2.png"
                alt="Décoration d'une tasse en céramique chez ARTI"
                width={800}
                height={640}
                className="absolute -bottom-12 left-[12%] w-[44%] shadow-xl sm:-bottom-16"
              />
            </div>
          </div>

          {/* Texte à droite, blanc */}
          <div className="flex items-center bg-white px-6 py-16 sm:px-12 md:py-28 lg:px-20">
            <div className="max-w-md">
              <h1 className="font-display text-5xl font-medium leading-[1.05] text-neutral-700 sm:text-6xl">
                Les céramiques
              </h1>
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-foreground/85">
                <p>
                  Chez Arti, chaque pièce est choisie avec soin. Nous collaborons
                  exclusivement avec des céramistes français&nbsp;: une sélection
                  intemporelle disponible toute l&apos;année, complétée de pièces
                  de saison.
                </p>
                <p>
                  Privilégier le Made in France, c&apos;est soutenir des ateliers
                  d&apos;ici, valoriser un savoir-faire artisanal et vous offrir
                  des céramiques durables, pensées pour durer. Une quarantaine de
                  modèles vous attendent — tasses, bols, assiettes, pichets,
                  vases, théières, beurriers, pots à crayons — de 15&nbsp;€ à
                  50&nbsp;€ selon la taille de la pièce.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATALOGUE */}
      <section className="bg-beige-light py-16 sm:py-24">
        <CeramicsCatalogue items={ceramics} />
      </section>

      {/* INFOS BAS DE PAGE */}
      <InfoCards />
    </>
  )
}
