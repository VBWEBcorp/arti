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
}
