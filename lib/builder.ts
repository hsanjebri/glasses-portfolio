import {
  BASE_PRICE,
  ENGRAVING_MAX,
  ENGRAVING_PRICE,
  GIFT_BOX_PRICE,
  addOnOptions,
  builderColourways,
  caseOptions,
  coatingOptions,
  defaultConfig,
  lensTierOptions,
  lensTypeOptions,
  shapeOptions,
  sizeOptions,
} from '@/content/builder'
import { builder as copy } from '@/content/copy'
import {
  FRAME_SHAPES,
  SIZE_KEYS,
  type AddOnId,
  type Availability,
  type BuilderConfig,
  type BuilderOption,
  type CaseId,
  type CoatingId,
  type LensTier,
  type LensType,
  type Quote,
  type QuoteLine,
} from '@/content/types'

/* ───────────────────────── Availability ───────────────────────── */

function matches(rule: Availability | undefined, c: BuilderConfig): boolean {
  if (!rule) return true
  if (rule.lensType && !rule.lensType.includes(c.lensType)) return false
  if (rule.shape && !rule.shape.includes(c.shape)) return false
  return true
}

/** Why an option cannot be chosen with this configuration, or null if it can. */
export function unavailable<Id extends string>(option: BuilderOption<Id>, c: BuilderConfig): string | null {
  return matches(option.availableWhen, c) ? null : (option.unavailableReason ?? 'Not available with this build.')
}

/** Why a colourway cannot be cut for the chosen shape, or null if it can. */
export function colourwayUnavailable(colourwayId: string, c: BuilderConfig): string | null {
  const shape = shapeOptions.find((s) => s.id === c.shape)
  if (shape?.onlyColourways && !shape.onlyColourways.includes(colourwayId)) {
    return shape.colourwayReason ?? 'Not available for this shape.'
  }
  return null
}

/**
 * Brings any configuration back to a valid one: drops options the current
 * choices rule out, swaps a disallowed colourway for the first allowed one,
 * and clamps quantities and the engraving.
 */
export function normalize(c: BuilderConfig): BuilderConfig {
  const next: BuilderConfig = { ...c, coatings: [...c.coatings], addOns: { ...c.addOns } }

  if (colourwayUnavailable(next.colourway, next)) {
    const ok = builderColourways.find((cw) => !colourwayUnavailable(cw.id, next))
    if (ok) next.colourway = ok.id
  }

  next.coatings = next.coatings.filter((id) => {
    const opt = coatingOptions.find((o) => o.id === id)
    return opt && !unavailable(opt, next)
  })

  for (const opt of addOnOptions) {
    const q = next.addOns[opt.id] ?? 0
    if (q <= 0) delete next.addOns[opt.id]
    else next.addOns[opt.id] = Math.min(opt.maxQty, Math.floor(q))
  }

  // The engraving is pressed into the gift box's case, so it goes with the box.
  next.engraving = next.giftBox ? sanitizeEngraving(next.engraving) : ''
  return next
}

export function sanitizeEngraving(s: string): string {
  return s
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, ENGRAVING_MAX)
}

/* ───────────────────────── URL codec ─────────────────────────
 * Readable on purpose, so a shared link can be read and edited:
 * /composer?shape=cat-eye&cw=ecaille-blonde&size=medium&lens=progressive
 *        &tier=thin-16&coat=anti-reflective,blue-light
 *        &add=chain:1,care-kit:1&case=hard&gift=1&eng=HJ
 * ------------------------------------------------------------- */

const pick = <T extends string>(value: string | null, allowed: readonly T[], fallback: T): T =>
  value && (allowed as readonly string[]).includes(value) ? (value as T) : fallback

/** The query string for a configuration, with commas and colons left legible. */
export function encodeConfig(c: BuilderConfig): string {
  const p = new URLSearchParams()
  p.set('shape', c.shape)
  p.set('cw', c.colourway)
  p.set('size', c.size)
  p.set('lens', c.lensType)
  p.set('tier', c.lensTier)
  if (c.coatings.length) p.set('coat', c.coatings.join(','))
  const adds = Object.entries(c.addOns).filter(([, q]) => (q ?? 0) > 0)
  if (adds.length) p.set('add', adds.map(([id, q]) => `${id}:${q}`).join(','))
  p.set('case', c.caseId)
  if (c.giftBox) p.set('gift', '1')
  if (c.engraving) p.set('eng', c.engraving)
  return p.toString().replace(/%2C/gi, ',').replace(/%3A/gi, ':')
}

/** True when the params carry a builder configuration at all. */
export function hasConfig(p: URLSearchParams): boolean {
  return p.has('shape') || p.has('cw') || p.has('lens')
}

/** Parses a configuration from URL params. Unknown values fall back to defaults; nothing throws. */
export function decodeConfig(p: URLSearchParams, base: BuilderConfig = defaultConfig): BuilderConfig {
  const coatIds = coatingOptions.map((o) => o.id)
  const addIds = addOnOptions.map((o) => o.id)
  const addOns: Partial<Record<AddOnId, number>> = {}
  for (const pair of (p.get('add') ?? '').split(',')) {
    const [id, q] = pair.split(':')
    if (id && (addIds as string[]).includes(id)) addOns[id as AddOnId] = Number(q) || 0
  }

  return normalize({
    shape: pick(p.get('shape'), FRAME_SHAPES, base.shape),
    colourway: pick(p.get('cw'), builderColourways.map((c) => c.id), base.colourway),
    size: pick(p.get('size'), SIZE_KEYS, base.size),
    lensType: pick<LensType>(p.get('lens'), lensTypeOptions.map((o) => o.id), base.lensType),
    lensTier: pick<LensTier>(p.get('tier'), lensTierOptions.map((o) => o.id), base.lensTier),
    coatings: p.has('coat')
      ? ((p.get('coat') ?? '').split(',').filter((id) => (coatIds as string[]).includes(id)) as CoatingId[])
      : p.has('shape')
        ? []
        : base.coatings,
    addOns: p.has('add') ? addOns : base.addOns,
    caseId: pick<CaseId>(p.get('case'), caseOptions.map((o) => o.id), base.caseId),
    giftBox: p.has('gift') ? p.get('gift') === '1' : base.giftBox,
    engraving: p.get('eng') ?? base.engraving,
  })
}

/* ───────────────────────── Quote ───────────────────────── */

const find = <Id extends string>(list: BuilderOption<Id>[], id: Id) => list.find((o) => o.id === id)

export function quote(c: BuilderConfig): Quote {
  const lines: QuoteLine[] = []
  const add = (id: string, label: string, amount: number, qty = 1) => lines.push({ id, label, qty, amount })

  const shape = find(shapeOptions, c.shape)
  const cw = builderColourways.find((x) => x.id === c.colourway)
  add('frame', `${copy.summary.base} — ${shape?.label ?? c.shape}, ${cw?.name ?? c.colourway}`, BASE_PRICE + (shape?.priceDelta ?? 0) + (cw?.priceDelta ?? 0))

  const size = find(sizeOptions, c.size)
  if (size?.priceDelta) add('size', copy.summary.sizeLine(size.label), size.priceDelta)

  const lens = find(lensTypeOptions, c.lensType)
  if (lens) add('lens', copy.summary.lensLine(lens.label), lens.priceDelta)

  const tier = find(lensTierOptions, c.lensTier)
  if (tier) add('tier', tier.label, tier.priceDelta)

  for (const id of c.coatings) {
    const o = find(coatingOptions, id)
    if (o) add(`coat-${id}`, o.label, o.priceDelta)
  }

  for (const o of addOnOptions) {
    const q = c.addOns[o.id] ?? 0
    if (q > 0) add(`add-${o.id}`, o.label, o.priceDelta * q, q)
  }

  const kase = find(caseOptions, c.caseId)
  if (kase) add('case', kase.label, kase.priceDelta)
  if (c.giftBox) add('gift', copy.giftBox.line, GIFT_BOX_PRICE)
  if (c.engraving) add('engraving', `${copy.engraving.label} "${c.engraving}"`, ENGRAVING_PRICE)

  return { lines, total: lines.reduce((s, l) => s + l.amount, 0) }
}

/** One-line human summary for messages and the booking form. */
export function describe(c: BuilderConfig): string {
  return quote(c)
    .lines.map((l) => (l.qty > 1 ? `${l.label} ×${l.qty}` : l.label))
    .join(' · ')
}
