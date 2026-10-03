/** PLACEHOLDER — the shop's position. The coordinates label is built from it. */
const GEO = { latitude: 36.8783, longitude: 10.3247 }

export interface OpeningHours {
  day: string
  /** schema.org day name, for search engines. */
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
  /** 24 h "HH:MM", or null when closed. */
  opens: string | null
  closes: string | null
}

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
    /** The same address, split for search engines. */
    locality: 'La Marsa',
    region: 'Tunis',
    countryCode: 'TN',
  },

  // PLACEHOLDER — opens Google Maps on the address
  mapsUrl: 'https://maps.google.com/?q=La+Marsa+Plage+Tunis',

  geo: GEO,
  coordinates: `${GEO.latitude}° N — ${GEO.longitude}° E`,

  // PLACEHOLDER — opening hours, 24 h. `opens: null` renders as "Fermé".
  hours: [
    { day: 'Lundi', dayOfWeek: 'Monday', opens: '09:30', closes: '19:00' },
    { day: 'Mardi', dayOfWeek: 'Tuesday', opens: '09:30', closes: '19:00' },
    { day: 'Mercredi', dayOfWeek: 'Wednesday', opens: '09:30', closes: '19:00' },
    { day: 'Jeudi', dayOfWeek: 'Thursday', opens: '09:30', closes: '19:00' },
    { day: 'Vendredi', dayOfWeek: 'Friday', opens: '09:30', closes: '19:00' },
    { day: 'Samedi', dayOfWeek: 'Saturday', opens: '10:00', closes: '18:00' },
    { day: 'Dimanche', dayOfWeek: 'Sunday', opens: null, closes: null },
  ] as OpeningHours[],

  // PLACEHOLDER — phone, displayed as written
  phone: '+216 98158363',

  /** PLACEHOLDER — WhatsApp number, digits only, country code first, no plus. */
  whatsapp: '21698158363',

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
    .replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f')}\u00a0${site.currency}`
}

/** "09:30" → "9 h 30", "19:00" → "19 h" — the way hours are written in French. */
export const frTime = (t: string) => {
  const [h = '0', m = '00'] = t.split(':')
  return m === '00' ? `${Number(h)} h` : `${Number(h)} h ${m}`
}

/** "9 h 30 — 19 h", or null when the shop is closed that day. */
export function hoursLabel(h: OpeningHours): string | null {
  return h.opens && h.closes ? `${frTime(h.opens)} — ${frTime(h.closes)}` : null
}
