import { BRAND_IDS } from '@/content/brands'
import { priceBounds } from '@/content/products'
import {
  CATEGORIES,
  COLOUR_FAMILIES,
  FRAME_SHAPES,
  GENDERS,
  MATERIALS,
  SORT_KEYS,
  isFrame,
  type Category,
  type CatalogueQuery,
  type Product,
} from '@/content/types'

/* ───────────── URL ⇄ query. Every filter lives in the search params. ───────────── */

const list = <T extends string>(p: URLSearchParams, key: string, allowed: readonly T[]): T[] =>
  (p.get(key) ?? '')
    .split(',')
    .filter((v): v is T => (allowed as readonly string[]).includes(v))

const num = (v: string | null): number | undefined => {
  if (v === null || v === '') return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

export function parseQuery(p: URLSearchParams): CatalogueQuery {
  const category = p.get('category')
  const sort = p.get('sort')
  return {
    category: category && (CATEGORIES as string[]).includes(category) ? (category as Category) : 'all',
    brand: list(p, 'brand', BRAND_IDS),
    shape: list(p, 'shape', FRAME_SHAPES),
    colour: list(p, 'colour', COLOUR_FAMILIES),
    material: list(p, 'material', MATERIALS),
    gender: list(p, 'gender', GENDERS),
    priceMin: num(p.get('min')),
    priceMax: num(p.get('max')),
    sort: sort && (SORT_KEYS as string[]).includes(sort) ? (sort as CatalogueQuery['sort']) : 'newest',
  }
}

export function toParams(q: CatalogueQuery): URLSearchParams {
  const p = new URLSearchParams()
  if (q.category !== 'all') p.set('category', q.category)
  if (q.brand.length) p.set('brand', q.brand.join(','))
  if (q.shape.length) p.set('shape', q.shape.join(','))
  if (q.colour.length) p.set('colour', q.colour.join(','))
  if (q.material.length) p.set('material', q.material.join(','))
  if (q.gender.length) p.set('gender', q.gender.join(','))
  if (q.priceMin !== undefined && q.priceMin > priceBounds.min) p.set('min', String(q.priceMin))
  if (q.priceMax !== undefined && q.priceMax < priceBounds.max) p.set('max', String(q.priceMax))
  if (q.sort !== 'newest') p.set('sort', q.sort)
  return p
}

/** Filters that only make sense for frames. Hidden on the accessories tab. */
export const frameFiltersActive = (q: CatalogueQuery) =>
  q.shape.length + q.colour.length + q.material.length + q.gender.length > 0

export const anyFilterActive = (q: CatalogueQuery) =>
  frameFiltersActive(q) || q.brand.length > 0 || q.priceMin !== undefined || q.priceMax !== undefined

/** The query with every filter cleared but the category and sort kept. */
export const cleared = (q: CatalogueQuery): CatalogueQuery => ({
  ...q,
  brand: [],
  shape: [],
  colour: [],
  material: [],
  gender: [],
  priceMin: undefined,
  priceMax: undefined,
})

/* ───────────── Filtering and sorting ───────────── */

export function applyQuery(products: Product[], q: CatalogueQuery): Product[] {
  const result = products.filter((p) => {
    if (q.category !== 'all' && p.category !== q.category) return false
    if (q.brand.length && !q.brand.includes(p.brand)) return false
    if (q.priceMin !== undefined && p.price < q.priceMin) return false
    if (q.priceMax !== undefined && p.price > q.priceMax) return false

    if (!isFrame(p)) return !frameFiltersActive(q)

    if (q.shape.length && !q.shape.includes(p.shape)) return false
    if (q.material.length && !q.material.includes(p.material)) return false
    if (q.gender.length && !q.gender.includes(p.gender)) return false
    if (q.colour.length && !p.colourways.some((c) => q.colour.includes(c.family))) return false
    return true
  })

  return result.sort((a, b) => {
    if (q.sort === 'price-asc') return a.price - b.price
    if (q.sort === 'price-desc') return b.price - a.price
    return b.createdAt.localeCompare(a.createdAt)
  })
}

/** Toggle a value in one of the multi-select filters. */
export function toggle<K extends 'brand' | 'shape' | 'colour' | 'material' | 'gender'>(
  q: CatalogueQuery,
  key: K,
  value: CatalogueQuery[K][number],
): CatalogueQuery {
  const current = q[key] as string[]
  const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
  return { ...q, [key]: next }
}

/** Swatch colour for each colour family chip. */
export const FAMILY_SWATCH: Record<string, string> = {
  tortoise: '#6b4423',
  black: '#111111',
  crystal: '#d9dcdf',
  gold: '#c2a054',
  silver: '#a9adb0',
  colour: 'linear-gradient(135deg, #4f8fd6 50%, #e05a9a 50%)',
}
