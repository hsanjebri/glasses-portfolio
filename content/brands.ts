import { site } from './site'

/**
 * The houses the shop carries. Logos are the brands' public-domain text marks
 * from Wikimedia Commons, stored in /public/brands; they remain trademarks.
 * PLACEHOLDER — confirm the client is an authorised stockist of every brand
 * shown here before launch, and remove any they do not carry.
 */
export const brands = {
  'ray-ban': { name: 'Ray-Ban', origin: 'Milan', logo: '/brands/ray-ban.svg' },
  persol: { name: 'Persol', origin: 'Turin', logo: null },
  'oliver-peoples': { name: 'Oliver Peoples', origin: 'Los Angeles', logo: '/brands/oliver-peoples.svg' },
  moscot: { name: 'Moscot', origin: 'New York', logo: '/brands/moscot.svg' },
  lindberg: { name: 'Lindberg', origin: 'Aarhus', logo: null },
  mykita: { name: 'Mykita', origin: 'Berlin', logo: null },
  'garrett-leight': { name: 'Garrett Leight', origin: 'Venice Beach', logo: null },
  'tom-ford': { name: 'Tom Ford', origin: 'New York', logo: '/brands/tom-ford.svg' },
  gucci: { name: 'Gucci', origin: 'Florence', logo: '/brands/gucci.svg' },
  prada: { name: 'Prada', origin: 'Milan', logo: '/brands/prada.svg' },
  celine: { name: 'Celine', origin: 'Paris', logo: '/brands/celine.svg' },
  'saint-laurent': { name: 'Saint Laurent', origin: 'Paris', logo: '/brands/saint-laurent.svg' },
  cartier: { name: 'Cartier', origin: 'Paris', logo: '/brands/cartier.svg' },
  oakley: { name: 'Oakley', origin: 'Californie', logo: '/brands/oakley.svg' },
  dior: { name: 'Dior', origin: 'Paris', logo: '/brands/dior.svg' },
  'nano-vista': { name: 'Nano Vista', origin: 'Barcelone', logo: null },
  /** Accessories made for the shop carry the shop's own name. */
  maison: { name: site.brand.name, origin: 'La Marsa', logo: null },
} as const satisfies Record<string, { name: string; origin: string; logo: string | null }>

export type BrandId = keyof typeof brands

export const BRAND_IDS = Object.keys(brands) as BrandId[]

/** Brands with a logo, in the order the logo wall shows them. */
export const logoWall: BrandId[] = [
  'ray-ban',
  'oliver-peoples',
  'tom-ford',
  'cartier',
  'celine',
  'saint-laurent',
  'gucci',
  'prada',
  'dior',
  'moscot',
  'oakley',
]
