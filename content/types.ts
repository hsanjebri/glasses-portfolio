import type { BrandId } from './brands'
import type { PhotoKey } from './photos'

/* ───────────────────────── Primitives ───────────────────────── */

export type FrameShape =
  | 'round'
  | 'square'
  | 'cat-eye'
  | 'aviator'
  | 'rectangular'
  | 'oversized'

export const FRAME_SHAPES: FrameShape[] = ['round', 'square', 'cat-eye', 'aviator', 'rectangular', 'oversized']

export type Material = 'acetate' | 'bio-acetate' | 'titanium' | 'stainless' | 'acetate-metal'
export const MATERIALS: Material[] = ['acetate', 'bio-acetate', 'titanium', 'stainless', 'acetate-metal']

export type Category = 'optical' | 'sun' | 'blue-light' | 'kids' | 'accessories'
export const CATEGORIES: Category[] = ['optical', 'sun', 'blue-light', 'kids', 'accessories']

export type Gender = 'women' | 'men' | 'unisex' | 'kids'
export const GENDERS: Gender[] = ['women', 'men', 'unisex', 'kids']

export type ColourFamily = 'tortoise' | 'black' | 'crystal' | 'gold' | 'silver' | 'colour'
export const COLOUR_FAMILIES: ColourFamily[] = ['tortoise', 'black', 'crystal', 'gold', 'silver', 'colour']

export interface Colourway {
  id: string
  name: string
  family: ColourFamily
  /** The two halves of the chip shown on cards and the product page. */
  swatch: [string, string]
  /** A photograph of this colourway. Falls back to the product photo. */
  photo?: PhotoKey
}

export interface FrameDimensions {
  /** mm */
  lensWidth: number
  bridge: number
  templeLength: number
  lensHeight: number
  totalWidth: number
}

export type SizeKey = 'narrow' | 'medium' | 'wide'
export const SIZE_KEYS: SizeKey[] = ['narrow', 'medium', 'wide']

/* ───────────────────────── Products ───────────────────────── */

interface ProductBase {
  slug: string
  brand: BrandId
  /** Model name as the brand writes it. */
  name: string
  /** Manufacturer reference, e.g. RB2140. */
  reference?: string
  /** TND, integer. */
  price: number
  description: string
  details: string[]
  /** ISO date — drives "sort by newest". */
  createdAt: string
  photo: PhotoKey
  featured?: boolean
}

export interface Frame extends ProductBase {
  kind: 'frame'
  category: Exclude<Category, 'accessories'>
  shape: FrameShape
  material: Material
  gender: Gender
  /** First entry is the default colourway. */
  colourways: Colourway[]
  dimensions: FrameDimensions
  /** Which builder lens types this frame accepts. */
  lensCapability: LensType[]
}

export type AccessoryKind = 'hard-case' | 'leather-case' | 'pochette' | 'cloth' | 'chain' | 'care-kit' | 'gift-box'

export interface Accessory extends ProductBase {
  kind: 'accessory'
  category: 'accessories'
  accessory: AccessoryKind
}

export type Product = Frame | Accessory

export const isFrame = (p: Product): p is Frame => p.kind === 'frame'
export const isAccessory = (p: Product): p is Accessory => p.kind === 'accessory'

/* ───────────── Catalogue state — all of it lives in the URL ───────────── */

export type SortKey = 'newest' | 'price-asc' | 'price-desc'
export const SORT_KEYS: SortKey[] = ['newest', 'price-asc', 'price-desc']

export interface CatalogueQuery {
  category: Category | 'all'
  brand: BrandId[]
  shape: FrameShape[]
  colour: ColourFamily[]
  material: Material[]
  gender: Gender[]
  priceMin?: number
  priceMax?: number
  sort: SortKey
}

/* ───────────────────────── Builder ───────────────────────── */

export type BuilderStepId = 'frame' | 'lenses' | 'quality' | 'accessories' | 'packaging'
export const BUILDER_STEP_IDS: BuilderStepId[] = ['frame', 'lenses', 'quality', 'accessories', 'packaging']

export type LensType = 'plano' | 'single-vision' | 'progressive' | 'sun'
export type LensTier = 'std-15' | 'thin-16' | 'ultra-167'
export type CoatingId = 'anti-reflective' | 'blue-light' | 'photochromic' | 'polarised'
export type CaseId = 'hard' | 'leather' | 'pochette'
export type AddOnId = 'chain' | 'care-kit' | 'extra-cloth'

/**
 * Declarative gating. An option is offered only when every stated key matches
 * the current configuration; otherwise it renders disabled with its reason.
 */
export interface Availability {
  lensType?: LensType[]
  shape?: FrameShape[]
}

/** Schematic icons for options that have no photograph (lenses, coatings). */
export type OptionIcon = LensType | LensTier | CoatingId | SizeKey

export interface BuilderOption<Id extends string> {
  id: Id
  label: string
  /** One line, plain language — what this does for the wearer. */
  blurb: string
  /** TND delta against the base price. */
  priceDelta: number
  photo?: PhotoKey
  icon?: OptionIcon
  availableWhen?: Availability
  unavailableReason?: string
}

export interface BuilderConfig {
  shape: FrameShape
  colourway: string
  size: SizeKey
  lensType: LensType
  lensTier: LensTier
  coatings: CoatingId[]
  addOns: Partial<Record<AddOnId, number>>
  caseId: CaseId
  giftBox: boolean
  /** Up to 3 letters, A–Z. Shown live on the case in the preview. */
  engraving: string
}

export interface QuoteLine {
  id: string
  label: string
  qty: number
  /** TND, quantity already applied. */
  amount: number
}

export interface Quote {
  lines: QuoteLine[]
  total: number
}
