/**
 * Valeurs par défaut éditables des pages ARTI.
 * Source unique partagée entre les pages publiques (fallback / état initial)
 * et les éditeurs admin. Le CMS (SiteContent) surcharge ces valeurs par pageId.
 */

export const homeDefaults = {
  hero: {
    eyebrow: 'Bienvenue chez Arti',
    title: 'Le café céramique au cœur de Rennes !',
    paragraph1:
      "ARTI est un coffee shop cosy et inspirant où l'on peint sa propre céramique tout en savourant une boisson et un bon goûter. Le temps d'un atelier, choisissez votre pièce, décorez-la à votre goût et repartez avec une création unique, faite de vos mains.",
    paragraph2:
      "Pas besoin d'être artiste : la peinture sur céramique est ouverte à tous. Débutant ou confirmé, petit ou grand, chacun trouve sa place et réveille son âme d'artiste !",
    buttonLabel: 'Je réserve',
    buttonHref: '/infos-pratiques#reserver',
    image: '/brand/hero-cafe.png',
  },
  equipe: {
    title: 'Notre équipe',
    image: '/brand/equipe.png',
    paragraph1:
      'Chez Arti, Chloé, Anne et Jasmine vous accueilleront lors de vos ateliers pour vous faire vivre un moment créatif et relaxant !',
    paragraph2:
      "Nous mettons tout notre cœur à vous accompagner dans la réalisation de votre pièce, que vous veniez peindre pour le plaisir, pour offrir ou simplement pour vous détendre. Nous aimons partager nos conseils et nos idées pour que chaque atelier soit une belle expérience, pleine de bonne humeur et de créativité.",
    paragraph3:
      "Chez nous, pas besoin d'être artiste : on vous guide pas à pas, toujours avec le sourire !",
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
      a: "Tu peux offrir une carte cadeau ARTI, de 10 € à 100 €. Elle est valable sur les ateliers comme sur la sélection de céramiques, et la personne choisit ensuite la date qui lui convient.",
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
    buttonHref: '/infos-pratiques#reserver',
  },
}

export type ConceptStep = { n: string; title: string; icon: string; body: string }

export const leConceptDefaults = {
  hero: {
    title: 'Arti est un coffee shop et un atelier de peinture sur céramique.',
    paragraph1:
      'Vous retrouverez chez ARTI, une jolie sélection de cafés, thés et boissons fraîches ainsi que des gâteaux pour les gourmands !',
    paragraph2:
      'Notre café est torréfié en Bretagne, à Saint-Thuriau, par Café 1802. Nous avons à cœur de travailler avec des produits locaux.',
    buttonLabel: 'Voir la carte',
    buttonHref: '/carte',
    image: '/brand/concept-etagere.png',
    imageSecondary: '/brand/concept-devanture.png',
  },
  intro: {
    icon: '/brand/vase-icone.png',
    title: 'Vous souhaitez découvrir la peinture sur céramique ?',
    text:
      "Arti vous propose un moment hors du temps, 2H30 d'atelier, pour personnaliser la pièce en céramique de votre choix. Comment cela fonctionne ?",
  },
  steps: [
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
        "A vos pinceaux ! Choisissez vos couleurs et laissez libre court à votre créativité. Si les idées venaient à vous manquer, un carnet d'inspiration sera à votre disposition pour vous permettre de réaliser les plus jolies des créations.",
    },
    {
      n: '3',
      title: 'Patientez',
      icon: '/brand/verre-icone.png',
      body:
        "A la fin de votre atelier, nous récupérons votre pièce afin de l'émailler et la cuire dans notre four à haute température (1 000°C). Cela révèlera les couleurs et la rendra étanche !",
    },
    {
      n: '4',
      title: 'Récupérez',
      icon: '/brand/potettasse-icone.png',
      body:
        'Environ 3 semaines plus tard, vous pourrez passer au café pour découvrir et récupérer votre création.',
    },
  ] as ConceptStep[],
  howItWorks: {
    title: 'Comment ça marche ?',
    paragraph1:
      'Au début de votre atelier, notre équipe prendra 10 minutes pour vous expliquer toutes les techniques et le matériel que vous pourrez utiliser. Nous serons là tout au long de votre atelier pour vous accompagner dans la réalisation de vos créations.',
    paragraph2:
      'Afin de préparer au mieux votre venue, vous pouvez sélectionner des inspirations et idées de réalisations.',
    paragraph3: "Pour cela, nous avons créé un tableau Pinterest avec plein d'idées.",
    buttonLabel: '📌 Découvrir les inspirations',
    buttonHref: 'https://fr.pinterest.com/articafeceramique/inspirations/',
  },
  apercu: {
    title: 'Un aperçu du coffee shop',
    buttonLabel: 'Voir la carte',
    buttonHref: '/carte',
    image1: '/brand/apercu-2.png',
    image2: '/brand/apercu-1.png',
    image3: '/brand/apercu-3.png',
  },
  partenaires: {
    title: 'Nos partenaires locaux',
    paragraph1:
      'Pour le café, nous travaillons avec Café 1802. Fred et Renaud, barista et torréfacteur, sélectionnent des cafés de spécialité issus du commerce équitable et les torréfient en Bretagne, à Saint-Thuriau. Des recettes uniques, à découvrir tasse après tasse.',
    paragraph2:
      'Côté gourmandise, nos pâtisseries viennent de Bonœuf : des cookies généreux, 100 % végétaux, fabriqués juste à côté de Rennes.',
    paragraph3:
      "Travailler avec des producteurs locaux, c'est notre façon de vous offrir le meilleur tout en soutenant le savoir-faire d'ici.",
    image: '/brand/partenaires.png',
  },
}

export type Ceramic = {
  src: string
  name: string
  category: string
  price: string
  alt: string
}

export const artiCeramiquesDefaults = {
  hero: {
    title: 'Les céramiques',
    paragraph1:
      "Chez Arti, chaque pièce est choisie avec soin. Nous collaborons exclusivement avec des céramistes français : une sélection intemporelle disponible toute l'année, complétée de pièces de saison.",
    paragraph2:
      'Privilégier le Made in France, c\'est soutenir des ateliers d\'ici, valoriser un savoir-faire artisanal et vous offrir des céramiques durables, pensées pour durer. Une quarantaine de modèles vous attendent — tasses, bols, assiettes, pichets, vases, théières, beurriers, pots à crayons — de 15 € à 50 € selon la taille de la pièce.',
    image1: '/brand/atelier-3.png',
    image2: '/brand/ceramiques-2.png',
  },
  catalogue: [
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
