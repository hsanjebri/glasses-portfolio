/**
 * Every brand-specific value on the site. Change it here and the giant hero
 * word, the nav, the footer, the Open Graph image and the metadata follow.
 */
export const site = {
  /**
   * `display` splits the word for the hero and footer: the first part is set
   * roman, the second italic.
   */
  // PLACEHOLDER — shop name
  brand: { name: 'Regard', full: 'Regard, maison d’optique', display: ['Re', 'gard'] as const },

  // PLACEHOLDER — tagline
  tagline: 'Voir juste, porter beau',

  // PLACEHOLDER — one-line description used in metadata
  summary:
    'Opticien indépendant à La Marsa. Montures des grandes maisons, verres taillés sur mesure et ajustage à la main.',

  // PLACEHOLDER — address
  address: {
    line1: '12, rue du Phare',
    district: 'Marsa Plage',
    city: 'La Marsa, Tunis',
    country: 'Tunisie',
  },

  // PLACEHOLDER — opens Google Maps on the address
  mapsUrl: 'https://maps.google.com/?q=La+Marsa+Plage+Tunis',

  // PLACEHOLDER — coordinates shown in the hero strip
  coordinates: '36.8783° N — 10.3247° E',

  // PLACEHOLDER — opening hours. `open: null` renders as "Fermé".
  hours: [
    { day: 'Lundi', open: '9 h 30 — 19 h' },
    { day: 'Mardi', open: '9 h 30 — 19 h' },
    { day: 'Mercredi', open: '9 h 30 — 19 h' },
    { day: 'Jeudi', open: '9 h 30 — 19 h' },
    { day: 'Vendredi', open: '9 h 30 — 19 h' },
    { day: 'Samedi', open: '10 h — 18 h' },
    { day: 'Dimanche', open: null },
  ] as { day: string; open: string | null }[],

  // PLACEHOLDER — phone, displayed as written
  phone: '+216 71 000 000',

  /** PLACEHOLDER — WhatsApp number, digits only, country code first, no plus. */
  whatsapp: '21671000000',

  // PLACEHOLDER — social links
  socials: [
    { label: 'Instagram', href: 'https://instagram.com' },
    { label: 'Facebook', href: 'https://facebook.com' },
    { label: 'TikTok', href: 'https://tiktok.com' },
  ],

  currency: 'DT',
  locale: 'fr-TN',

  // PLACEHOLDER — production domain
  url: 'https://regard-optique.tn',
} as const

export const brandWord = site.brand.display.join('')

/** `1 240 DT` — narrow no-break space as the thousands separator, unit last. */
export function formatPrice(amount: number): string {
  return `${Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ${site.currency}`
}
