# Cahier des charges — ARTI Café Céramique

> Regroupe les demandes de la cliente et leur état d'avancement.
> **La spécification détaillée (§2) est la DERNIÈRE demande de la cliente et fait foi.**
> Elle est appliquée telle quelle, section par section. En cas de divergence avec
> les notes rapides (§1), c'est §2 qui prime.

## Légende des statuts

- ✅ **Fait & déployé** en production (arti-vbweb2)
- 🟠 **À faire** (validé, pas encore réalisé)
- 🔶 **Partiel** (une partie faite, reste à compléter)
- ❓ **À clarifier** (besoin d'une précision de la cliente avant de faire)
- ⚠️ **Contradiction / point d'attention** à trancher

---

## 1. Notes rapides de la cliente

| # | Demande | Statut | Détail |
|---|---------|--------|--------|
| 1 | Carousel « Les céramiques » (plusieurs photos par pièce) | ✅ | Carousel auto multi-photos + gestion admin. Déployé. |
| 2 | Regrouper des pages | ❓ | **Quelles pages regrouper ?** À préciser. |
| 3 | Montant avec « reste » sur la carte cadeau | ✅ | Solde décrémentable (débit partiel, reste dû réutilisable). Déployé. |
| 4 | Police des titres trop grasse → « comme l'ancien site » | 🔶 / ❓ | Titres amincis (Caveat 400, la plus fine de cette police). « Comme l'ancien site » = **quelle police exactement ?** (l'ancien site = WordPress articafeceramique.fr) |
| 5 | Bouton « Réserver » pas assez visible → en vert | ✅ | Bouton vert (sauge). Déployé. |
| 6 | Changement du kaki du site | ✅ | Vert du thème passé à **#91977D**. Déployé. *(à confirmer : c'est la bonne teinte finale ?)* |
| 7 | Enlever la section « Mon équipe » pour le moment | 🟠 | Section « Notre équipe » de l'accueil → à masquer. **(Sera remplacée par « Mot de la Fondatrice », cf. §2)** |
| 8 | Partie FAQ dans « Infos pratiques » | ✅ | FAQ affichée aussi sur Infos pratiques (contenu partagé). Déployé. |
| 9 | Le Concept et La Carte : beaucoup d'infos | 🟠 | Textes détaillés à intégrer (cf. §2). |
| 10 | Montants carte cadeau : 15 / 20 / 25 / 30 / 40 / 50 | ✅ | Déployé. |
| 11 | Fin d'année : relevé comptable (non utilisé / expiré) | 🔶 / ❓ | Panneau compta des cartes expirées fait. **« Relevé de fin d'année » = format précis attendu ?** (export ? période ?) |
| 12 | Carte expirée : utilisable quand même de la même manière | ✅ | Cartes expirées honorées (statut « expirée » conservé). Déployé. |
| 13 | Visu montant cartes expirées (compta, total par date) | ✅ | Panneau « Comptabilité — cartes expirées » (montant initial + solde restant, filtre par date). Déployé. |
| 14 | Pouvoir faire rentrer les cartes « avantage employé » | ✅ | Source « Avantage employé » dans « Créer une carte ». En place. |
| 15 | Masquer la page « Kit à emporter » | ✅ | Retirée du menu + footer (page conservée, accessible par URL). Déployé. |
| 16 | Message de l'équipe | ✅ (email) / 🟠 (site) | Mot de l'équipe ajouté à l'email de carte cadeau. Voir aussi « Mot de la Fondatrice » (§2). |

---

## 2. Spécification détaillée du site (textes fournis par la cliente)

> ✅ **INTÉGRÉ & DÉPLOYÉ** sur arti-vbweb2 : Accueil (Mot de présentation + Mot de la
> Fondatrice + Concept 4 étapes), Le Concept (présentation, 4 étapes, « Des ateliers pour
> tous » + Pinterest, partie Café), Les céramiques (nouveaux textes), FAQ (2h00). Vérifié en prod.
> Restent optionnels : lien du PDF de la carte (bouton Café pointe sur /carte), confirmation du
> tableau Pinterest.

### Page 1 — Accueil

Blocs attendus : Mot de présentation · Concept (4 étapes) · Photo de vos créations · Mot de la Fondatrice · Avis · Envie d'organiser un évènement ?

**Mot de présentation** — 🟠 (texte à intégrer)
- Titre 1 : **Bienvenue chez Arti**
- Titre 2 : **Le café céramique au cœur de Rennes**
- Texte :
  > Arti est un café céramique pensé comme un lieu de partage, de créativité et de détente. Dans une ambiance chaleureuse, inspirée par l'artisanat, chacun est invité à prendre le temps de créer tout en savourant un café, une pâtisserie.
  >
  > Le temps d'un atelier, choisissez votre pièce, décorez-là à votre goût et repartez avec une création unique faite de vos mains.
  >
  > Que vous soyez un artiste confirmé ou que vous n'ayez jamais tenu un pinceau, Arti est ouvert à tous ! Notre équipe sera présente pour vous accompagner et vous faire découvrir les différentes techniques de peinture sur céramique.
- Bouton « **Réserver** »

**Concept (4 étapes)** — 🟠 (texte à intégrer)
- Titre : **Le Concept**
1. **Choisissez** — *Ne rien changer au texte actuel.*
2. **Décorez** — A vos pinceaux ! Choisissez vos couleurs et laissez libre court à votre créativité pendant **2h30** d'atelier. Si les idées vous manquent, un carnet d'inspiration et des pochoirs seront à votre disposition pour réaliser les plus belles créations.
3. **Patientez** — A la fin de votre atelier, notre équipe récupère votre pièce afin de l'émailler et la cuire dans notre four à haute température (1000°C). Cela permet de révéler les couleurs et la rendre étanche !
4. **Récupérer** — Vous pourrez récupérer et découvrir votre pièce quelques semaines plus tard, selon le délai indiqué par notre équipe à la fin de votre atelier.

**Photo de vos créations** — ✅ (existe déjà : carrousel « Vos créations »)

**Mot de la Fondatrice** — 🟠 (nouveau, remplace « Notre équipe »)
- Titre : **Le mot de Chloé, Fondatrice d'Arti**
- Texte :
  > Arti est né d'un mélange entre deux passions, l'hospitalité et l'artisanat. Je suis donc ravie de vous accueillir aujourd'hui, avec mon équipe, dans ce lieu pensé pour vous inspirer, laisser libre court à votre créativité, mais aussi vous ressourcer.
  >
  > J'ai à cœur de sélectionner de jolies céramiques, utilitaires et dans le respect du savoir-faire artisanal pour faire, ensuite, partie de votre quotidien.
  >
  > J'espère que l'expérience vous plaira, et que ce moment suspendu, de partage, vous laissera un souvenir mémorable !
  >
  > Chloé

**Avis** — ✅ (vrais avis intégrés)
- 18 **vrais avis Google** d'ARTI intégrés + note globale **4,9/5 · 95 avis**. *(Affichage statique ; un flux Google mis à jour en temps réel = intégration séparée via l'API Google Places, si souhaité plus tard.)*

**Envie d'organiser un évènement ?** — ✅ (existe ; *ne rien changer au texte*)

### Page 2 — Le Concept

Blocs : Mot de présentation (idem accueil) · Concept 4 étapes (idem accueil) · Pour qui ? + Inspirations Pinterest · Partie café.

- **Mot de présentation** — 🟠 (identique à l'accueil)
- **Concept 4 étapes** — 🟠 (exactement comme l'accueil)

**Pour qui ?** — 🟠 (texte à intégrer)
- Titre : **Des ateliers pour tous**
- Texte :
  > Que vous veniez seul(e) vous offrir une parenthèse de calme ou partager un moment suspendu à plusieurs, Arti est un lieu de vie et de création ouvert à tous ! Les enfants y sont les bienvenus aussi, nous conseillons les ateliers à partir de 5 ans pour explorer leur créativité en toute simplicité.
  >
  > Aucun prérequis artistique n'est nécessaire, notre équipe sera présente pour tout vous expliquer ! L'expérience invite simplement à lâcher prise, à expérimenter à son rythme et à savourer le plaisir de faire de ses mains.
  >
  > L'équipe d'Arti vous accueille et vous guide avec attention, vous transmettant les techniques essentielles de la peinture sur céramique et vous accompagnant selon vos envies. Des sources d'inspiration sont à votre disposition pour vous aider à vous lancer en toute confiance.
  >
  > Avant votre venue, nous vous recommandons de sélectionner quelques inspirations. Arti vous a créé un tableau Pinterest avec plein d'idées :
- **Bouton** vers le tableau Pinterest ARTI.

**Partie Café** — 🟠 (texte à intégrer)
- Titre : **Une sélection gourmande pour accompagner votre atelier**
- Texte :
  > Notre carte évolue au fil des saisons afin de proposer des créations gourmandes, fraîches et adaptées aux envies du moment.
  >
  > Nous choisissons de travailler avec des fournisseurs engagés, partageant notre vision de la qualité, de la proximité et du respect des savoir-faire. Nous privilégions autant que possible les collaborations avec des producteurs et artisans locaux, afin de valoriser des produits authentiques et de créer des liens durables avec ceux qui les font naître.
  >
  > Parmi nos gourmandises, vous retrouverez notamment nos cookies véganes, pensés pour allier générosité, créativité et plaisir, pour que chacun puisse profiter d'une pause gourmande adaptée à ses envies.
- **Bouton** vers la carte en **PDF**.

### Page 3 — Les céramiques

**Texte « Les céramiques »** — 🟠 (texte à intégrer)
- Titre : **Les céramiques**
- Texte :
  > Nos pièces en céramique sont soigneusement sélectionnées auprès de manufactures familiales françaises reconnues pour leur savoir-faire artisanal et leur exigence de qualité. Issues principalement de Vallauris et de Lyon, deux territoires emblématiques de la céramique en France, elles reflètent un travail précis, des finitions soignées et un héritage de fabrication transmis au fil des générations.
  >
  > Nous choisissons chaque pièce avec attention auprès de partenaires qui partagent nos valeurs : la préservation des savoir-faire locaux, une démarche plus responsable et une recherche constante d'excellence. Chaque création proposée dans notre sélection incarne ainsi l'alliance entre authenticité, élégance et qualité durable. Chez Arti, vous retrouverez majoritairement une sélection de jolis objets utilitaires.
  >
  > Nous avons également à cœur de valoriser la création locale à travers un partenariat de longue date avec la céramiste rennaise Camille Esnée. Ensemble, nous imaginons et dessinons des pièces exclusives, pensées pour notre café et réalisées avec la sensibilité et le savoir-faire d'une artisane passionnée.

**Texte « Notre catalogue de pièces »** — 🟠 (texte à intégrer)
  > Retrouvez ci-dessous notre sélection de céramiques. De jolis objets intemporels, utilitaires et disponibles toute l'année. Nos pièces vont de 15 à 50 € selon la taille.

### FAQ — corrections — 🟠

Appliquer exactement la demande de la cliente :
- Question « adaptés aux enfants ? » → la réponse doit indiquer **2h00** (et non 2h30).
- Question « combien de temps dure l'activité ? » → indiquer **2h00** (et non 2h30).
- Le texte du **Concept (étape « Décorez ») reste tel que fourni : 2h30**.

---

## 3. Éléments à me fournir (n'empêchent pas de commencer)

Les textes sont fournis dans le brief : je les applique tels quels. Il me faudra, le moment venu :
1. Le **lien du tableau Pinterest** ARTI (bouton « Inspirations »).
2. Le **PDF de la carte** (bouton de la partie Café).
3. **Avis Google** : confirmer le branchement des vrais avis (accès à la fiche Google).

*À préciser plus tard, sans bloquer le reste (issus de notes rapides antérieures, hors brief détaillé) : « regrouper des pages », police des titres « comme l'ancien site », format du « relevé comptable de fin d'année ».*

---

## 4. Déjà livré en production (rappel)

Solde décrémentable (reste dû) · cartes expirées utilisables · compta des expirées par date · montants 15→50 · création au comptoir (TPE) façon achat en ligne · email carte cadeau (texte ARTI + mot de l'équipe) · codes courts `GC-XXXX` · carousel céramiques multi-photos · bouton Réserver vert · vert du thème #91977D · FAQ sur Infos pratiques · Kit à emporter masqué.
