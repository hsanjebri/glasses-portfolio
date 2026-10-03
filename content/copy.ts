/**
 * Every string on the site, grouped by where it appears. Components read from
 * here and hold no copy of their own.
 */

export const nav = {
  links: [
    { label: 'Catalogue', href: '/catalogue' },
    { label: 'Composer', href: '/composer' },
    { label: 'L’atelier', href: '/#atelier' },
    { label: 'Nous trouver', href: '/#visite' },
  ],
  cta: { label: 'Prendre rendez-vous', href: '/#visite' },
  menuOpen: 'Menu',
  menuClose: 'Fermer',
}

export const hero = {
  eyebrow: 'Opticien indépendant · La Marsa',
  /** Split across lines by <SplitLines>; the last line is set italic. */
  headline: ['Voir juste,', 'porter beau'],
  lede:
    'Les montures des grandes maisons, des verres taillés sur ordonnance et un atelier au fond de la boutique pour les ajuster à votre visage.',
  cta: { label: 'Prendre rendez-vous', href: '/#visite' },
  secondary: { label: 'Voir le catalogue', href: '/catalogue' },
  stats: [
    // PLACEHOLDER — stat cards
    { value: '20', unit: 'min', label: 'Pour un ajustage' },
    { value: '15', unit: 'maisons', label: 'En boutique' },
  ],
  strip: {
    /** What the film shows: from the optician's chart, through the glass, to a fitting. */
    plate: 'Pl. 01 — À travers le verre',
    replay: 'Revoir',
  },
  videoAlt:
    'Une monture fine posée sur une planche d’anneaux de Landolt ; la caméra s’approche et traverse le verre. De l’autre côté, une femme blonde déplie une paire de lunettes noires, la pose sur son nez et sourit.',
}

export const manifesto = {
  label: 'Manifeste',
  sentence:
    'Une paire de lunettes n’est pas un accessoire mais un instrument porté sur la partie la plus expressive du corps : elle se choisit avec soin, s’ajuste au millimètre, et doit être assez juste pour que l’on voie le visage avant la monture.',
}

export const worlds = {
  label: 'Deux mondes',
  optical: {
    title: 'Optique',
    blurb: 'Verres correcteurs ou neutres, montés et ajustés ici. Pour tous les jours, toute la journée.',
    cta: 'Entrer côté optique',
    href: '/catalogue?category=optical',
  },
  sun: {
    title: 'Soleil',
    blurb: 'Verres G-15, polarisants, dégradés — pour la lumière qui rebondit sur la mer.',
    cta: 'Entrer côté soleil',
    href: '/catalogue?category=sun',
  },
}

export const brandsWall = {
  label: 'Les maisons',
  title: ['Les maisons', 'que nous portons'],
  blurb: 'Nous choisissons chaque collection en boutique, monture par monture.',
}

export const featured = {
  label: 'Sélection',
  title: 'Six pour commencer',
  hint: 'Faites défiler',
  hintMobile: 'Glissez',
}

export const builderTeaser = {
  label: 'Sur mesure',
  title: 'Composez la monture que vous ne trouvez pas',
  blurb: 'La forme, la matière, les verres et l’écrin. Le prix s’affiche au fur et à mesure, et l’atelier s’occupe du reste.',
  cta: { label: 'Ouvrir le configurateur', href: '/composer' },
  steps: ['Monture', 'Verres', 'Qualité', 'Écrin'],
}

export const atelier = {
  label: 'L’atelier',
  title: 'Quatre choses à savoir',
  notes: [
    {
      kicker: '01 — Les réparations',
      title: 'Brasé sur place',
      body: 'Une branche cassée, une charnière fatiguée : nous brasons et remettons en forme dans l’atelier, le plus souvent dans la journée.',
      photo: 'solder',
    },
    {
      kicker: '02 — La matière',
      title: 'L’acétate',
      body: 'Découpé dans une plaque, poli à la main. Chaque écaille est différente — c’est justement l’intérêt.',
      photo: 'acetate',
    },
    {
      kicker: '03 — La charnière',
      title: 'Le détail qui dure',
      body: 'Nous vérifions et resserrons les charnières à chaque passage, gratuitement, aussi longtemps que vous portez la monture.',
      photo: 'hinge',
    },
    {
      kicker: '04 — L’ajustage',
      title: 'Mesuré sur vous',
      body: 'Contrôle de la vue, écart pupillaire, hauteur des verres prise assis. Vingt minutes, en personne, sur rendez-vous ou non.',
      photo: 'exam',
    },
  ] as const,
  stats: [
    // PLACEHOLDER — stats band
    { label: 'Écart pupillaire', value: '0,5', unit: 'mm', kind: 'ruler' as const, fill: 0.8 },
    { label: 'Poids moyen', value: '21', unit: 'g', kind: 'plain' as const },
    { label: 'Protection', value: 'UV400', unit: '', kind: 'shimmer' as const },
    { label: 'Délai verres', value: '7', unit: 'jours', kind: 'accent' as const },
  ],
}

export const box = {
  label: 'L’écrin',
  title: 'Ce qui vous accompagne',
  blurb: 'Chaque paire part avec son écrin. Faites défiler pour l’ouvrir.',
  /** The lid: lifts away first, revealing the contents. */
  lid: { label: 'Le coffret', slug: 'coffret-cadeau' },
  /** In the order they rise out of the box. */
  items: [
    { label: 'Étui rigide', slug: 'etui-rigide' },
    { label: 'Pochette velours', slug: 'pochette-velours' },
    { label: 'Kit d’entretien', slug: 'kit-entretien' },
    { label: 'Chamoisine', slug: 'chamoisine' },
  ],
  href: '/catalogue?category=accessories',
}

export const lookbook = {
  label: 'Carnet',
  title: ['Portées', 'en ville'],
  blurb: 'Quelques images qui nous inspirent quand nous choisissons une collection.',
  shots: [
    { photo: 'look1', caption: 'Ronde métal, lumière d’hiver' },
    { photo: 'look2', caption: 'Papillon écaille, fin d’après-midi' },
    { photo: 'look3', caption: 'Fil fin, portrait serré' },
    { photo: 'look4', caption: 'Papillon noir, plein soleil' },
  ] as const,
}

export const voices = {
  label: 'Témoignages',
  title: 'Trois ajustages',
  /** PLACEHOLDER — every testimonial below is invented. Replace before launch. */
  quotes: [
    {
      quote:
        'Je portais la même forme depuis onze ans parce que rien d’autre ne tenait. Ils m’ont trouvé une monture plus étroite et je l’ai oubliée dès l’après-midi.',
      name: 'Amira B.', // PLACEHOLDER
      role: 'Architecte, Tunis', // PLACEHOLDER
    },
    {
      quote: 'L’ajustage a pris plus de temps que le choix. Ça m’a tout dit sur leur façon de travailler.',
      name: 'Karim T.', // PLACEHOLDER
      role: 'Photographe, La Marsa', // PLACEHOLDER
    },
    {
      quote:
        'Mon fils a sept ans et avait cassé quatre paires. Celle-ci a tenu toute l’année scolaire, et ils l’ont réajustée deux fois sans rien demander.',
      name: 'Sonia M.', // PLACEHOLDER
      role: 'Enseignante, Gammarth', // PLACEHOLDER
    },
  ],
}

export const visit = {
  label: 'Nous trouver',
  title: 'Passez essayer',
  blurb: 'L’atelier est au fond de la boutique : on vous ajuste pendant que vous regardez.',
  hoursLabel: 'Horaires',
  closed: 'Fermé',
  addressLabel: 'Adresse',
  phoneLabel: 'Téléphone',
  mapsLabel: 'Ouvrir dans Google Maps',
  buildAttached: 'Configuration jointe',
  productAttached: 'Monture à essayer',
  attachmentRemove: 'Retirer',
  form: {
    title: 'Prendre rendez-vous',
    kicker: 'Vingt minutes · gratuit',
    blurb: 'Choisissez un moment : nous vous confirmons le créneau dans la journée. Sans obligation d’achat.',
    steps: { day: 'Le jour', time: 'L’heure', reason: 'L’objet de la visite', you: 'Vos coordonnées' },
    optional: 'facultatif',
    today: 'Auj.',
    closed: 'Fermé',
    earlier: 'Jours précédents',
    later: 'Jours suivants',
    morning: 'Matin',
    afternoon: 'Après-midi',
    pickDayFirst: 'Choisissez d’abord un jour.',
    /** Today, once its last slot has passed. */
    over: 'Terminé',
    reasons: ['Essayer des montures', 'Faire faire mes verres', 'Lunettes de soleil', 'Ajustement ou réparation'],
    name: { label: 'Nom', placeholder: 'Votre nom' },
    contact: { label: 'Téléphone ou e-mail', placeholder: 'Pour vous confirmer le créneau' },
    note: { label: 'Un mot pour nous', placeholder: 'Votre correction, une monture repérée…' },
    summaryEmpty: 'Choisissez un jour et une heure.',
    when: (day: string, time: string) => `${day} à ${time}`,
    submit: 'Demander ce créneau',
    sending: 'Envoi…',
    success: 'C’est noté. Nous vous confirmons le créneau dans la journée.',
    /** Shown when the request could not be emailed: WhatsApp becomes the way it reaches the shop. */
    lastStep: 'Dernière étape : envoyez la demande sur WhatsApp, nous la confirmons dans la journée.',
    error: 'L’envoi a échoué. Envoyez la demande sur WhatsApp ou appelez-nous.',
    whatsappSend: 'Envoyer sur WhatsApp',
    whatsappAlso: 'Confirmer aussi sur WhatsApp',
    required: 'Obligatoire',
    pickDay: 'Choisissez un jour',
    pickTime: 'Choisissez une heure',
    /** Label of the hidden anti-spam field; people never see it. */
    honeypot: 'Laissez ce champ vide',
  },
}

export const footer = {
  columns: [
    {
      title: 'Boutique',
      links: [
        { label: 'Optique', href: '/catalogue?category=optical' },
        { label: 'Soleil', href: '/catalogue?category=sun' },
        { label: 'Lumière bleue', href: '/catalogue?category=blue-light' },
        { label: 'Enfants', href: '/catalogue?category=kids' },
        { label: 'Accessoires', href: '/catalogue?category=accessories' },
      ],
    },
    {
      title: 'Atelier',
      links: [
        { label: 'Composer une monture', href: '/composer' },
        { label: 'Notre façon de travailler', href: '/#atelier' },
        { label: 'Nous trouver', href: '/#visite' },
        { label: 'Crédits photo', href: '/credits' },
      ],
    },
  ],
  socialsLabel: 'Ailleurs',
  rights: 'Tous droits réservés.',
}

export const catalogue = {
  title: 'Catalogue',
  blurb: 'Tout ce que nous avons en boutique, et ce que l’atelier peut composer.',
  tabs: [
    { id: 'all', label: 'Tout' },
    { id: 'optical', label: 'Optique' },
    { id: 'sun', label: 'Soleil' },
    { id: 'blue-light', label: 'Lumière bleue' },
    { id: 'kids', label: 'Enfants' },
    { id: 'accessories', label: 'Accessoires' },
  ],
  filters: {
    title: 'Filtres',
    open: 'Filtres',
    close: 'Voir',
    brand: 'Maison',
    shape: 'Forme',
    colour: 'Coloris',
    material: 'Matière',
    price: 'Prix',
    priceMin: 'Prix minimum',
    priceMax: 'Prix maximum',
    gender: 'Pour',
    sort: 'Trier',
    categoryLabel: 'Catégorie',
    clear: 'Tout effacer',
    count: (n: number) => `${n} ${n > 1 ? 'pièces' : 'pièce'}`,
    empty: 'Rien ne correspond à ces filtres.',
    emptyAction: 'Les effacer',
  },
  sortLabels: {
    newest: 'Nouveautés',
    'price-asc': 'Prix croissant',
    'price-desc': 'Prix décroissant',
  } as const,
  card: { colourways: (n: number) => `${n} coloris`, accessory: 'Accessoire' },
}

export const product = {
  back: 'Catalogue',
  colourwayLabel: 'Coloris',
  sizeLabel: 'Mesures',
  lensLabel: 'Verres possibles',
  detailsLabel: 'Détails',
  build: 'Composer à partir de ce modèle',
  tryInStore: 'Essayer en boutique',
  whatsapp: 'Commander sur WhatsApp',
  related: 'À voir aussi',
  reference: 'Réf.',
  lensFrom: (delta: string) => `+ ${delta}`,
  lensIncluded: 'Inclus',
  measurements: {
    lensWidth: 'Largeur du verre',
    bridge: 'Pont',
    templeLength: 'Branche',
    lensHeight: 'Hauteur du verre',
    totalWidth: 'Largeur totale',
  },
  diagramAlt: 'Schéma de la face de la monture avec la largeur du verre, la largeur du pont et la longueur de branche.',
}

export const builder = {
  title: 'Composer',
  blurb: 'Cinq étapes. Le prix se met à jour à chaque choix.',
  stepLabel: (n: number, total: number) => `Étape ${n} sur ${total}`,
  steps: {
    frame: { label: 'Monture', hint: 'La forme, la matière, la taille' },
    lenses: { label: 'Verres', hint: 'Ce que vous avez besoin de voir' },
    quality: { label: 'Qualité', hint: 'L’épaisseur et les traitements' },
    accessories: { label: 'Accessoires', hint: 'Ce qui l’accompagne' },
    packaging: { label: 'Écrin', hint: 'L’étui et le cadeau' },
  },
  groups: {
    shape: 'Forme',
    colourway: 'Matière',
    size: 'Taille',
    lensType: 'Type de verres',
    lensTier: 'Épaisseur',
    coatings: 'Traitements',
    addOns: 'En plus',
    case: 'Étui',
    gift: 'Coffret cadeau',
  },
  engraving: {
    label: 'Initiales gravées',
    hint: 'Jusqu’à trois lettres, gravées sur le couvercle de l’étui.',
    placeholder: 'ABC',
    unavailable: 'La gravure accompagne le coffret cadeau — ajoutez-le ci-dessus.',
  },
  giftBox: {
    label: 'Ajouter le coffret cadeau',
    line: 'Coffret cadeau',
    blurb: 'Carton rigide, ruban et carte écrite à la main.',
  },
  next: 'Étape suivante',
  included: 'Inclus',
  unavailableLabel: 'Indisponible',
  qty: {
    fewer: (name: string) => `Une ${name.toLowerCase()} de moins`,
    more: (name: string) => `Une ${name.toLowerCase()} de plus`,
    label: 'Quantité',
  },
  progress: (done: number, total: number) => `${done} étapes sur ${total} parcourues`,
  caption: (shape: string, material: string, lens: number, bridge: number) => `${shape} · ${material} · ${lens}□${bridge}`,
  summary: {
    title: 'Votre configuration',
    total: 'Total',
    whatsapp: 'Commander sur WhatsApp',
    whatsappShort: 'WhatsApp',
    booking: 'Prendre rendez-vous avec cette configuration',
    bookingShort: 'Rendez-vous',
    expand: 'Voir le détail',
    collapse: 'Masquer le détail',
    base: 'Monture',
    lensLine: (label: string) => `Verres ${label.toLowerCase()}`,
    sizeLine: (label: string) => `Taille ${label.toLowerCase()}`,
    totalAnnounce: (t: string) => `Total : ${t}`,
  },
  preview: {
    label: 'Aperçu',
    /** The frame is a representative photo of the shape, recoloured: say so. */
    note: 'Rendu indicatif',
    tray: 'Dans l’écrin',
    describe: (shape: string, material: string, lens: string) => `Monture ${shape.toLowerCase()} en ${material.toLowerCase()}, ${lens.toLowerCase()}`,
  },
  reset: 'Recommencer',
}

export const whatsapp = {
  intro: 'Bonjour — j’ai composé une monture sur votre site et je souhaite la commander.',
  configLabel: 'Configuration',
  totalLabel: 'Total',
  linkLabel: 'Lien',
  productIntro: (name: string) => `Bonjour — je suis intéressé(e) par ${name}.`,
  booking: (b: { name: string; contact: string; when: string; reason: string; note: string; attached: string }) =>
    [
      'Bonjour — je souhaite prendre rendez-vous.',
      '',
      `Nom : ${b.name}`,
      `Contact : ${b.contact}`,
      b.when ? `Créneau souhaité : ${b.when}` : '',
      b.reason ? `Objet : ${b.reason}` : '',
      b.attached ? `Concerne : ${b.attached}` : '',
      b.note ? `Message : ${b.note}` : '',
    ]
      .filter((line, i) => i < 2 || line)
      .join('\n'),
}

/** The email the shop receives for each booking request. */
export const bookingEmail = {
  subject: (name: string) => `Demande de rendez-vous — ${name}`,
  intro: 'Nouvelle demande de rendez-vous depuis le site.',
  labels: { name: 'Nom', contact: 'Contact', when: 'Créneau souhaité', reason: 'Objet', attached: 'Concerne', link: 'Configuration', note: 'Message' },
}

export const credits = {
  title: 'Crédits',
  blurb: 'Les photographies de ce site viennent d’Unsplash, les deux plans du film d’accueil de Pexels. Merci à leurs auteurs.',
  photoBy: 'Photo',
  on: 'sur Unsplash',
  /** The two shots of the hero film. */
  videos: [
    { label: 'Film d’accueil, plan 1', author: 'Pexels', href: 'https://www.pexels.com/video/5995502/' },
    { label: 'Film d’accueil, plan 2', author: 'Pexels', href: 'https://www.pexels.com/video/6006380/' },
  ],
  logos: 'Les logos des maisons sont des marques déposées, reproduits pour signaler les collections disponibles en boutique.',
}

export const a11y = {
  skipToContent: 'Aller au contenu',
  mainLabel: 'Contenu principal',
  navLabel: 'Navigation principale',
  footerLabel: 'Pied de page',
  loading: 'Chargement',
  newTab: '(nouvel onglet)',
}

export const notFound = {
  title: 'Flou',
  blurb: 'Cette page n’existe pas. Le catalogue, si.',
  cta: { label: 'Aller au catalogue', href: '/catalogue' },
}

/** Display names for shapes, colours, materials, fits and categories. */
export const labels: Record<string, string> = {
  round: 'Ronde',
  square: 'Carrée',
  'cat-eye': 'Papillon',
  aviator: 'Aviateur',
  rectangular: 'Rectangulaire',
  oversized: 'Oversize',
  tortoise: 'Écaille',
  black: 'Noir',
  crystal: 'Cristal',
  gold: 'Or',
  silver: 'Argent',
  colour: 'Couleur',
  acetate: 'Acétate',
  'bio-acetate': 'Bio-acétate',
  titanium: 'Titane',
  stainless: 'Acier',
  'acetate-metal': 'Acétate et métal',
  women: 'Femme',
  men: 'Homme',
  unisex: 'Mixte',
  kids: 'Enfant',
  optical: 'Optique',
  sun: 'Soleil',
  'blue-light': 'Lumière bleue',
  accessories: 'Accessoires',
}
