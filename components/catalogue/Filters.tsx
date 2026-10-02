'use client'

import { useId } from 'react'

import { brands, type BrandId } from '@/content/brands'
import { catalogue, labels } from '@/content/copy'
import { allFrames, priceBounds } from '@/content/products'
import { formatPrice } from '@/content/site'
import { COLOUR_FAMILIES, FRAME_SHAPES, GENDERS, MATERIALS, type CatalogueQuery } from '@/content/types'
import { FAMILY_SWATCH, anyFilterActive, cleared, toggle } from '@/lib/catalogue'

type Props = {
  query: CatalogueQuery
  onChange: (q: CatalogueQuery) => void
}

const f = catalogue.filters

/** Every house that has a frame in the catalogue, alphabetically. */
const FRAME_BRANDS = [...new Set(allFrames.map((p) => p.brand))].sort((a, b) =>
  brands[a].name.localeCompare(brands[b].name),
) as BrandId[]

/** Every filter as a labelled group of toggle buttons, plus the price range. */
export function Filters({ query, onChange }: Props) {
  const framesApply = query.category !== 'accessories'

  return (
    <div className="flex flex-col gap-8">
      {framesApply ? (
        <>
          <Group legend={f.brand}>
            {FRAME_BRANDS.map((v) => (
              <Chip key={v} pressed={query.brand.includes(v)} onClick={() => onChange(toggle(query, 'brand', v))}>
                {brands[v].name}
              </Chip>
            ))}
          </Group>

          <Group legend={f.shape}>
            {FRAME_SHAPES.map((v) => (
              <Chip key={v} pressed={query.shape.includes(v)} onClick={() => onChange(toggle(query, 'shape', v))}>
                {labels[v]}
              </Chip>
            ))}
          </Group>

          <Group legend={f.colour}>
            {COLOUR_FAMILIES.map((v) => (
              <Chip key={v} pressed={query.colour.includes(v)} onClick={() => onChange(toggle(query, 'colour', v))}>
                <span aria-hidden="true" className="size-3 rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,.2)]" style={{ background: FAMILY_SWATCH[v] }} />
                {labels[v]}
              </Chip>
            ))}
          </Group>

          <Group legend={f.material}>
            {MATERIALS.map((v) => (
              <Chip key={v} pressed={query.material.includes(v)} onClick={() => onChange(toggle(query, 'material', v))}>
                {labels[v]}
              </Chip>
            ))}
          </Group>

          <Group legend={f.gender}>
            {GENDERS.map((v) => (
              <Chip key={v} pressed={query.gender.includes(v)} onClick={() => onChange(toggle(query, 'gender', v))}>
                {labels[v]}
              </Chip>
            ))}
          </Group>
        </>
      ) : null}

      <PriceRange query={query} onChange={onChange} />

      {anyFilterActive(query) ? (
        <button
          type="button"
          onClick={() => onChange(cleared(query))}
          className="label self-start border-b border-line-strong pb-1 text-ink transition-colors hover:border-ink"
        >
          {f.clear}
        </button>
      ) : null}
    </div>
  )
}

function Group({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
      <legend className="label mb-3 text-ink-3">{legend}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  )
}

function Chip({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className="inline-flex min-h-9 items-center gap-2 rounded-full border border-line-strong px-3.5 text-[13px] text-ink-2 transition-colors duration-300 ease-focus hover:border-ink hover:text-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-ink-inv"
    >
      {children}
    </button>
  )
}

function PriceRange({ query, onChange }: Props) {
  const id = useId()
  const min = query.priceMin ?? priceBounds.min
  const max = query.priceMax ?? priceBounds.max
  const span = priceBounds.max - priceBounds.min
  const range = 'pointer-events-none absolute inset-x-0 top-0 h-6 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-bg [&::-webkit-slider-thumb]:bg-ink [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-bg [&::-moz-range-thumb]:bg-ink'

  return (
    <fieldset className="m-0 border-0 p-0">
      <legend className="label mb-4 text-ink-3">{f.price}</legend>
      <div className="relative h-6">
        <span aria-hidden="true" className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line" />
        <span
          aria-hidden="true"
          className="absolute top-1/2 h-px -translate-y-1/2 bg-ink"
          style={{ left: `${((min - priceBounds.min) / span) * 100}%`, right: `${100 - ((max - priceBounds.min) / span) * 100}%` }}
        />
        <label htmlFor={`${id}-min`} className="sr-only">
          {f.priceMin}
        </label>
        <input
          id={`${id}-min`}
          type="range"
          min={priceBounds.min}
          max={priceBounds.max}
          step={10}
          value={min}
          onChange={(e) => onChange({ ...query, priceMin: Math.min(Number(e.target.value), max - 10) })}
          className={range}
        />
        <label htmlFor={`${id}-max`} className="sr-only">
          {f.priceMax}
        </label>
        <input
          id={`${id}-max`}
          type="range"
          min={priceBounds.min}
          max={priceBounds.max}
          step={10}
          value={max}
          onChange={(e) => onChange({ ...query, priceMax: Math.max(Number(e.target.value), min + 10) })}
          className={range}
        />
      </div>
      <p className="label tnum mt-3 flex justify-between text-ink-2">
        <span>{formatPrice(min)}</span>
        <span>{formatPrice(max)}</span>
      </p>
    </fieldset>
  )
}
