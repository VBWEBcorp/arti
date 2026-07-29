/**
 * Valeurs par défaut éditables des pages ARTI.
 * Source unique partagée entre les pages publiques (fallback / état initial)
 * et les éditeurs admin. Le CMS (SiteContent) surcharge ces valeurs par pageId.
 */

export const homeDefaults = {
  // Mot de présentation
  hero: {
    eyebrow: 'Bienvenue chez Arti',
    title: 'Le café céramique au cœur de Rennes',
    paragraph1:
      "Arti est un café céramique pensé comme un lieu de partage, de créativité et de détente. Dans une ambiance chaleureuse, inspirée par l'artisanat, chacun est invité à prendre le temps de créer tout en savourant un café, une pâtisserie.",
    paragraph2:
      "Le temps d'un atelier, choisissez votre pièce, décorez-là à votre goût et repartez avec une création unique faite de vos mains.",
    paragraph3:
      "Que vous soyez un artiste confirmé ou que vous n'ayez jamais tenu un pinceau, Arti est ouvert à tous ! Notre équipe sera présente pour vous accompagner et vous faire découvrir les différentes techniques de peinture sur céramique.",
    buttonLabel: 'Réserver',
    buttonHref: '/infos-pratiques#reserver',
    image: '/brand/hero-cafe.png',
  },
  // Mot de la Fondatrice (remplace l'ancienne section « Notre équipe »)
  fondatrice: {
    title: "Le mot de Chloé, Fondatrice d'Arti",
    image: '/brand/equipe.png',
    paragraph1:
      "Arti est né d'un mélange entre deux passions, l'hospitalité et l'artisanat. Je suis donc ravie de vous accueillir aujourd'hui, avec mon équipe, dans ce lieu pensé pour vous inspirer, laisser libre court à votre créativité, mais aussi vous ressourcer.",
    paragraph2:
      "J'ai à cœur de sélectionner de jolies céramiques, utilitaires et dans le respect du savoir-faire artisanal pour faire, ensuite, partie de votre quotidien.",
    paragraph3:
      "J'espère que l'expérience vous plaira, et que ce moment suspendu, de partage, vous laissera un souvenir mémorable !",
    signature: 'Chloé',
  },
}

export const infosDefaults = {
  hero: {
    eyebrow: 'Où nous trouver ?',
    title: 'Infos Pratiques',
    description:
      'Nous sommes situés dans le centre-ville de Rennes, 10 rue Poullain Duparc à côté de République. Cliquez sur la carte ci-dessous pour venir nous rencontrer.',
    mapQuery: '10 rue Poullain Duparc Rennes',
  },
  reservation: {
    title: 'Réservations',
    intro1:
      "Nous serions ravis de vous accueillir prochainement chez Arti pour un atelier de peinture sur céramique de 2h30 ! Vous trouverez ci-dessous les différents créneaux de réservations. Le paiement de l'atelier se fait sur place, en fonction de la pièce que vous choisirez.",
    intro2: 'À très bientôt !',
    // Module de réservation en ligne Zenchef (modifiable si l'identifiant change).
    zenchefUrl: 'https://bookings.zenchef.com/results?rid=366284&fullscreen=1',
  },
}

export type FaqItem = { q: string; a: string }

export const faqDefaults = {
  eyebrow: 'Les questions souvent posées',
  title: 'La FAQ',
  intro:
    "Vous vous posez des questions avant de venir ? Voici les réponses aux plus fréquentes. Si vous ne trouvez pas la vôtre, écrivez-nous !",
  items: [
    {
      q: 'Les ateliers de peinture sur céramique sont-ils adaptés aux enfants ?',
      a: "Il n'y a pas d'âge requis pour venir faire un atelier, nous sommes ouverts aux grands comme aux petits ! Cependant, nous recommandons l'atelier à partir de 5-6 ans. L'activité n'est pas compliquée mais les 2H00 d'atelier peuvent être un peu longues pour les tout-petits.",
    },
    {
      q: 'Est-ce que les animaux sont acceptés ?',
      a: 'Oui, les chiens de petites / moyennes taille et calmes sont les bienvenus au café !',
    },
    {
      q: "Combien de temps dure l'activité ?",
      a: "L'atelier de peinture sur céramique dure 2H00. Nous te recommandons d'arriver 5-10 mins avant afin de choisir ta pièce et prendre le temps de t'installer.",
    },
    {
      q: 'Comment préparer ma venue chez Arti ?',
      a: "Avant l'atelier, nous t'invitons à trouver des inspirations. Pour cela, nous avons créé une page Pinterest avec plein d'idées pour t'inspirer.",
    },
    {
      q: "Quel est le prix d'un atelier ?",
      a: "Le prix de l'atelier est déterminé par la pièce que tu choisiras le jour J. Chez Arti, les modèles vont de 15 à 50€. Les boissons et pâtisseries sont à régler à part.",
    },
    {
      q: "Est-ce possible de prendre une boisson sans faire l'atelier ?",
      a: "Bien sûr ! Deux places à côté du comptoir sont réservées aux personnes souhaitant juste prendre une boisson / goûter sans faire l'atelier.",
    },
    {
      q: 'Faut-il réserver à l\'avance ?',
      a: "Nous te conseillons vivement de réserver ton atelier en ligne, surtout le week-end et pendant les vacances scolaires. Quelques places sans réservation restent possibles selon les disponibilités du jour, mais elles partent vite !",
    },
    {
      q: 'Peut-on venir en groupe ou organiser un événement ?',
      a: "Bien sûr ! Anniversaires, EVJF, team building, baby shower, sorties entre amis… Nous accueillons les groupes et pouvons privatiser l'espace. Rends-toi sur la page « Groupe & Évènement » pour nous faire part de ton projet.",
    },
    {
      q: 'Comment offrir un atelier ?',
      a: "Tu peux offrir une carte cadeau ARTI, de 15 € à 50 €. Elle est valable sur les ateliers comme sur la sélection de céramiques, et la personne choisit ensuite la date qui lui convient.",
    },
    {
      q: "Conseils d'entretien",
      a: 'Pour préserver vos céramiques sur la durée, privilégiez le lavage à la main avec une éponge douce et un savon doux. Évitez les changements brusques de température (chaud/froid) ainsi que le four à micro-ondes pour les pièces décorées. Vos céramiques peuvent être utilisées au quotidien : pour le café, le thé, les goûters ou la décoration.',
    },
  ] as FaqItem[],
  contactCta: {
    title: 'Vous ne trouvez pas votre réponse ?',
    text: 'Écrivez-nous, nous vous répondrons avec plaisir.',
    buttonLabel: 'Nous contacter',
    buttonHref: '/infos-pratiques#contact',
  },
}

export type ConceptStep = { n: string; title: string; icon: string; body: string }

/** Les 4 étapes du concept — identiques sur l'accueil et sur « Le Concept ». */
export const conceptStepsDefaults: ConceptStep[] = [
  {
    n: '1',
    title: 'Choisissez',
    icon: '/brand/tasse-icone.png',
    body:
      "En arrivant, l'équipe d'Arti prendra quelques minutes pour vous donner toutes les explications nécessaires sur la peinture, les techniques et le matériel puis c'est parti ! Vous pourrez choisir la céramique de votre choix parmi une large sélection de pièces : bol, tasse, vase, assiette, coquetier…",
  },
  {
    n: '2',
    title: 'Décorez',
    icon: '/brand/pot-icone.png',
    body:
      "A vos pinceaux ! Choisissez vos couleurs et laissez libre court à votre créativité pendant 2h30 d'atelier. Si les idées vous manquent, un carnet d'inspiration et des pochoirs seront à votre disposition pour réaliser les plus belles créations.",
  },
  {
    n: '3',
    title: 'Patientez',
    icon: '/brand/verre-icone.png',
    body:
      "A la fin de votre atelier, notre équipe récupère votre pièce afin de l'émailler et la cuire dans notre four à haute température (1000°C). Cela permet de révéler les couleurs et la rendre étanche !",
  },
  {
    n: '4',
    title: 'Récupérer',
    icon: '/brand/potettasse-icone.png',
    body:
      'Vous pourrez récupérer et découvrir votre pièce quelques semaines plus tard, selon le délai indiqué par notre équipe à la fin de votre atelier.',
  },
]

export const leConceptDefaults = {
  // Mot de présentation — identique à la page d'accueil.
  hero: {
    eyebrow: 'Bienvenue chez Arti',
    title: 'Le café céramique au cœur de Rennes',
    paragraph1:
      "Arti est un café céramique pensé comme un lieu de partage, de créativité et de détente. Dans une ambiance chaleureuse, inspirée par l'artisanat, chacun est invité à prendre le temps de créer tout en savourant un café, une pâtisserie.",
    paragraph2:
      "Le temps d'un atelier, choisissez votre pièce, décorez-là à votre goût et repartez avec une création unique faite de vos mains.",
    paragraph3:
      "Que vous soyez un artiste confirmé ou que vous n'ayez jamais tenu un pinceau, Arti est ouvert à tous ! Notre équipe sera présente pour vous accompagner et vous faire découvrir les différentes techniques de peinture sur céramique.",
    buttonLabel: 'Réserver',
    buttonHref: '/infos-pratiques#reserver',
    image: '/brand/hero-cafe.png',
  },
  steps: conceptStepsDefaults,
  pourQui: {
    title: 'Des ateliers pour tous',
    paragraph1:
      "Que vous veniez seul(e) vous offrir une parenthèse de calme ou partager un moment suspendu à plusieurs, Arti est un lieu de vie et de création ouvert à tous ! Les enfants y sont les bienvenus aussi, nous conseillons les ateliers à partir de 5 ans pour explorer leur créativité en toute simplicité.",
    paragraph2:
      "Aucun prérequis artistique n'est nécessaire, notre équipe sera présente pour tout vous expliquer ! L'expérience invite simplement à lâcher prise, à expérimenter à son rythme et à savourer le plaisir de faire de ses mains.",
    paragraph3:
      "L'équipe d'Arti vous accueille et vous guide avec attention, vous transmettant les techniques essentielles de la peinture sur céramique et vous accompagnant selon vos envies. Des sources d'inspiration sont à votre disposition pour vous aider à vous lancer en toute confiance.",
    paragraph4:
      "Avant votre venue, nous vous recommandons de sélectionner quelques inspirations. Arti vous a créé un tableau Pinterest avec plein d'idées :",
    buttonLabel: 'Découvrir les inspirations Pinterest',
    buttonHref: 'https://fr.pinterest.com/articafeceramique/inspirations/',
    image: '/brand/concept-etagere.png',
  },
  cafe: {
    title: 'Une sélection gourmande pour accompagner votre atelier',
    paragraph1:
      'Notre carte évolue au fil des saisons afin de proposer des créations gourmandes, fraîches et adaptées aux envies du moment.',
    paragraph2:
      "Nous choisissons de travailler avec des fournisseurs engagés, partageant notre vision de la qualité, de la proximité et du respect des savoir-faire. Nous privilégions autant que possible les collaborations avec des producteurs et artisans locaux, afin de valoriser des produits authentiques et de créer des liens durables avec ceux qui les font naître.",
    paragraph3:
      "Parmi nos gourmandises, vous retrouverez notamment nos cookies véganes, pensés pour allier générosité, créativité et plaisir, pour que chacun puisse profiter d'une pause gourmande adaptée à ses envies.",
    buttonLabel: 'Voir la carte',
    buttonHref: '/carte',
    image: '/brand/partenaires.png',
  },
}

export type Ceramic = {
  /** Une ou plusieurs photos de la pièce (défilent en carousel si >1). */
  images: string[]
  name: string
  category: string
  price: string
  alt: string
}

export const artiCeramiquesDefaults = {
  hero: {
    title: 'Les céramiques',
    paragraph1:
      "Nos pièces en céramique sont soigneusement sélectionnées auprès de manufactures familiales françaises reconnues pour leur savoir-faire artisanal et leur exigence de qualité. Issues principalement de Vallauris et de Lyon, deux territoires emblématiques de la céramique en France, elles reflètent un travail précis, des finitions soignées et un héritage de fabrication transmis au fil des générations.",
    paragraph2:
      "Nous choisissons chaque pièce avec attention auprès de partenaires qui partagent nos valeurs : la préservation des savoir-faire locaux, une démarche plus responsable et une recherche constante d'excellence. Chaque création proposée dans notre sélection incarne ainsi l'alliance entre authenticité, élégance et qualité durable. Chez Arti, vous retrouverez majoritairement une sélection de jolis objets utilitaires.",
    paragraph3:
      "Nous avons également à cœur de valoriser la création locale à travers un partenariat de longue date avec la céramiste rennaise Camille Esnée. Ensemble, nous imaginons et dessinons des pièces exclusives, pensées pour notre café et réalisées avec la sensibilité et le savoir-faire d'une artisane passionnée.",
    image1: '/brand/atelier-3.png',
    image2: '/brand/ceramiques-2.png',
  },
  catalogue: [
    { images: ['/brand/produits/Assiette-Moma.jpg'], name: 'Assiette Moma', category: 'Assiettes', price: '25 €', alt: 'Assiette Moma peinte à la main' },
    { images: ['/brand/produits/Assiette-Fleur-Ours-de-Noel.jpg'], name: 'Assiette Fleur & Ours de Noël', category: 'Assiettes', price: '25 €', alt: 'Assiette Fleur & Ours de Noël' },
    { images: ['/brand/produits/Tasse-Lila-Univers-marin.jpg'], name: 'Tasse Lila Univers marin', category: 'Tasses & mugs', price: '18 €', alt: 'Tasse Lila Univers marin' },
    { images: ['/brand/produits/Grand-pichet-Serpent.jpg'], name: 'Grand pichet Serpent', category: 'Pichets & vases', price: '45 €', alt: 'Grand pichet Serpent' },
    { images: ['/brand/produits/Plateau-de-Noel.jpg'], name: 'Plateau de Noël', category: 'Plateaux', price: '35 €', alt: 'Plateau de Noël' },
    { images: ['/brand/produits/Bol-breton.jpg'], name: 'Bol breton', category: 'Bols', price: '20 €', alt: 'Bol breton' },
    { images: ['/brand/produits/Coquetiers-Matchy.jpg'], name: 'Coquetiers Matchy', category: 'Coquetiers', price: '15 €', alt: 'Coquetiers Matchy' },
    { images: ['/brand/produits/Mug-Take-Away-x-Camille-Esnee.jpg'], name: 'Mug Take Away × Camille Esnée', category: 'Tasses & mugs', price: '22 €', alt: 'Mug Take Away x Camille Esnée' },
    { images: ['/brand/produits/Assiette-moma-Dinosaure.jpg'], name: 'Assiette Moma Dinosaure', category: 'Assiettes', price: '25 €', alt: 'Assiette Moma Dinosaure' },
    { images: ['/brand/produits/Soliflore-conique-Floral.jpg'], name: 'Soliflore conique Floral', category: 'Pichets & vases', price: '30 €', alt: 'Soliflore conique Floral' },
    { images: ['/brand/produits/Bol-conique-Oursons.jpg'], name: 'Bol conique Oursons', category: 'Bols', price: '20 €', alt: 'Bol conique Oursons' },
    { images: ['/brand/produits/Assiette-moma-Ocean.jpg'], name: 'Assiette Moma Océan', category: 'Assiettes', price: '25 €', alt: 'Assiette Moma Océan' },
    { images: ['/brand/produits/Plateau-De-Gaston.jpg'], name: 'Plateau de Gaston', category: 'Plateaux', price: '35 €', alt: 'Plateau de Gaston' },
    { images: ['/brand/produits/Assiette-Noel-chez-Arti.jpg'], name: 'Assiette Noël chez Arti', category: 'Assiettes', price: '25 €', alt: 'Assiette Noël chez Arti' },
    { images: ['/brand/produits/Coupelle-Leopard.jpg'], name: 'Coupelle Léopard', category: 'Coupelles', price: '16 €', alt: 'Coupelle Léopard' },
    { images: ['/brand/produits/Coquetiers-Matching.jpg'], name: 'Coquetiers Matching', category: 'Coquetiers', price: '15 €', alt: 'Coquetiers Matching' },
  ] as Ceramic[],
}

export const artiCadeauxDefaults = {
  hero: {
    eyebrow: 'Bon cadeau',
    title: "Offrez une expérience unique à l'un de vos proches !",
    paragraph1:
      "Un atelier de peinture sur céramique est une idée géniale. La personne qui recevra cette attention pourra venir vivre un moment créatif hors du temps et garder un souvenir grâce à la pièce qu'elle aura personnalisée.",
    paragraph2:
      'Vous avez la possibilité de choisir le montant de la pièce de votre choix (entre 15 € et 50 €).',
    buttonLabel: 'Choisir un bon cadeau',
    buttonHref: '/produit/carte-cadeau',
    image1: '/brand/cadeau-gift.png',
    image2: '/brand/atelier-1.png',
  },
}

export const kitDefaults = {
  hero: {
    eyebrow: 'À la maison',
    title: 'Le kit à emporter',
    paragraph1:
      'Envie de peindre votre céramique tranquillement chez vous ? Le kit à emporter, c\'est tout le plaisir de l\'atelier ARTI, mais à la maison et à votre rythme.',
    paragraph2:
      "Vous repartez avec une pièce et tout le matériel nécessaire. Une fois votre création terminée, il suffit de la rapporter à l'atelier : on s'occupe de la cuisson et de l'émaillage.",
    buttonLabel: 'Réserver un kit',
    buttonHref: '/infos-pratiques#reserver',
    image: '/brand/produits/Mug-Take-Away-x-Camille-Esnee.jpg',
  },
  contient: {
    title: 'Ce que contient le kit',
    items: [
      'Une pièce en céramique à choisir parmi notre sélection',
      'Les peintures et les pinceaux nécessaires',
      'Une notice avec nos conseils et techniques',
      "La cuisson et l'émaillage à votre retour à l'atelier",
    ] as string[],
    note: 'À partir de 15 € selon la pièce choisie.',
    noteSecondary: '(tarif indicatif)',
    image: '/brand/creation-3.png',
  },
  howItWorks: {
    title: 'Comment ça marche ?',
    steps: [
      {
        n: '1',
        title: 'Récupérez votre kit',
        icon: '/brand/tasse-icone.png',
        body: 'Passez à l\'atelier choisir votre pièce et repartez avec tout le matériel pour peindre : peintures, pinceaux et notice.',
      },
      {
        n: '2',
        title: 'Peignez chez vous',
        icon: '/brand/pot-icone.png',
        body: 'Installez-vous tranquillement à la maison et laissez libre cours à votre créativité, à votre rythme et quand vous le souhaitez.',
      },
      {
        n: '3',
        title: 'Rapportez votre pièce',
        icon: '/brand/verre-icone.png',
        body: 'Une fois votre création terminée, rapportez-la à l\'atelier. Nous nous occupons de l\'émaillage et de la cuisson à haute température.',
      },
      {
        n: '4',
        title: 'Récupérez votre création',
        icon: '/brand/potettasse-icone.png',
        body: 'Environ 3 semaines plus tard, votre pièce est prête : émaillée, cuite et étanche, à venir chercher au café.',
      },
    ] as ConceptStep[],
  },
}

export type MenuItem = { name: string; desc?: string; price: string }
export type MenuCategory = { title: string; note?: string; items: MenuItem[] }

export const carteDefaults = {
  hero: {
    title: 'La carte',
    paragraph1:
      'Chez Arti, vous retrouverez une jolie sélection de cafés, thés et boissons fraîches, ainsi que des gâteaux pour les gourmands !',
    paragraph2:
      "Notre café est torréfié en Bretagne, à Saint-Thuriau, par Café 1802. Nous avons à cœur de travailler avec des produits locaux, à savourer sur place pendant votre atelier ou le temps d'une pause.",
    image: '/brand/apercu-2.png',
  },
  menu: [
    {
      title: 'Cafés',
      note: 'Torréfiés en Bretagne par Café 1802, à Saint-Thuriau.',
      items: [
        { name: 'Expresso', price: '2,00 €' },
        { name: 'Double expresso', price: '2,80 €' },
        { name: 'Café allongé', price: '2,20 €' },
        { name: 'Cappuccino', price: '3,80 €' },
        { name: 'Café latte', price: '4,00 €' },
        { name: 'Flat white', price: '4,00 €' },
        { name: 'Mocha', desc: 'café & chocolat', price: '4,50 €' },
      ],
    },
    {
      title: 'Thés & chocolats',
      items: [
        { name: 'Thé ou infusion', desc: 'sélection de la maison', price: '3,50 €' },
        { name: 'Matcha latte', price: '4,50 €' },
        { name: 'Chai latte', price: '4,50 €' },
        { name: 'Chocolat chaud', price: '4,00 €' },
      ],
    },
    {
      title: 'Boissons fraîches',
      items: [
        { name: 'Café glacé', price: '4,50 €' },
        { name: 'Matcha glacé', price: '4,80 €' },
        { name: 'Limonade artisanale', price: '4,00 €' },
        { name: 'Jus de fruits', price: '3,80 €' },
        { name: 'Smoothie', price: '5,00 €' },
      ],
    },
    {
      title: 'Gourmandises',
      note: 'Pâtisseries 100 % végétales de Bonœuf, fabriquées près de Rennes.',
      items: [
        { name: 'Cookie Bonœuf', price: '3,50 €' },
        { name: 'Pâtisserie du jour', price: '4,00 €' },
        { name: 'Part de gâteau', price: '4,50 €' },
      ],
    },
  ] as MenuCategory[],
  footnote:
    "Carte non contractuelle, susceptible d'évoluer selon les saisons et les arrivages.",
}

export const groupeDefaults = {
  hero: {
    title: 'Envie de partager un moment créatif et convivial ?',
    paragraphs: [
      'Chez ARTI, nous serions ravies de vous accueillir pour organiser un événement unique, à votre image.',
      "Que ce soit pour un anniversaire, un EVJF, un EVG ou toute autre occasion spéciale, nous vous accompagnons pour faire de ce moment une expérience agréable, entre rires, gourmandises et créativité.",
      "Pour les entreprises, ARTI est aussi un lieu idéal pour renforcer les liens d'équipe autrement : team-building, afterwork, atelier collaboratif ou même conférence créative !",
      'Nous adaptons chaque événement à vos envies : choix des pièces à peindre, formules gourmandes, privatisation partielle ou totale du café…',
      "N'hésitez pas à nous partager vos attentes : nous créerons ensemble un devis sur-mesure pour un moment à la fois inspirant et authentique.",
    ] as string[],
    buttonLabel: 'Faire une demande',
    buttonHref: 'mailto:hello@articafeceramique.fr?subject=Demande%20événement',
    image: '/brand/atelier-1.png',
  },
  photos: [
    '/brand/creation-1.png',
    '/brand/creation-2.png',
    '/brand/creation-4.png',
  ] as string[],
}
