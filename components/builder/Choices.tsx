'use client'

import { useId, type ReactNode } from 'react'

import { Photo } from '@/components/media/Photo'
import { builder as copy } from '@/content/copy'
import type { PhotoKey } from '@/content/photos'
import { formatPrice } from '@/content/site'
import type { OptionIcon as IconKind } from '@/content/types'

import { OptionIcon } from './OptionIcon'

export type Choice = {
  id: string
  label: string
  blurb: string
  priceDelta: number
  photo?: PhotoKey
  icon?: IconKind
  /** Custom visual, e.g. a material swatch. */
  visual?: ReactNode
  /** When set, the option is disabled and this is shown as the reason. */
  unavailable?: string | null
}

export function priceTag(delta: number): string {
  if (delta === 0) return copy.included
  return `${delta > 0 ? '+' : '−'} ${formatPrice(Math.abs(delta))}`
}

/**
 * A group of option cards. Native radios (single) or checkboxes (multiple)
 * underneath, so arrow keys, focus and screen readers behave as expected;
 * the card is the label.
 */
export function ChoiceGroup({
  legend,
  name,
  choices,
  selected,
  onSelect,
  multiple = false,
  columns = 2,
  compact = false,
}: {
  legend: string
  name: string
  choices: Choice[]
  selected: string[]
  onSelect: (id: string) => void
  multiple?: boolean
  columns?: 2 | 3
  compact?: boolean
}) {
  const uid = useId()
  return (
    <fieldset className="m-0 border-0 p-0">
      <legend className="label mb-4 text-ink-3">{legend}</legend>
      <div className={`grid gap-2 ${columns === 3 ? 'grid-cols-2 sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        {choices.map((c) => {
          const on = selected.includes(c.id)
          const disabled = Boolean(c.unavailable)
          const reasonId = `${uid}-${c.id}-why`
          return (
            <label
              key={c.id}
              className={`group relative flex cursor-pointer gap-3 rounded-[4px] border bg-paper p-2.5 transition-[border-color,opacity] duration-300 ease-focus has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent-text ${
                compact ? 'flex-col' : 'items-center'
              } ${on ? 'border-ink' : 'border-line hover:border-line-strong'} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <input
                type={multiple ? 'checkbox' : 'radio'}
                name={name}
                value={c.id}
                checked={on}
                disabled={disabled}
                onChange={() => onSelect(c.id)}
                aria-describedby={disabled ? reasonId : undefined}
                className="sr-only"
              />
              {c.photo ? (
                <span className={`block shrink-0 overflow-hidden rounded-[3px] ${compact ? 'w-full' : 'w-16'}`}>
                  <Photo photo={c.photo} ratio={compact ? '4 / 3' : '1 / 1'} sizes={compact ? '(max-width: 640px) 45vw, 14vw' : '64px'} alt="" />
                </span>
              ) : (
                <span className={`shrink-0 text-ink ${compact ? 'w-full px-4' : c.visual ? 'w-14' : 'w-16'}`}>
                  {c.visual ?? (c.icon ? <OptionIcon kind={c.icon} className="h-auto w-full" /> : null)}
                </span>
              )}
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                  <span className="text-[14px] font-medium text-ink">{c.label}</span>
                  <span className="label-sm tnum shrink-0 text-ink-3">{priceTag(c.priceDelta)}</span>
                </span>
                <span className="text-[12.5px] leading-[1.45] text-ink-3">{c.blurb}</span>
                {disabled ? (
                  <span id={reasonId} className="mt-1 text-[12px] leading-[1.45] text-accent-text">
                    {copy.unavailableLabel}: {c.unavailable}
                  </span>
                ) : null}
              </span>
              <span
                aria-hidden="true"
                className={`absolute right-4 top-4 grid size-4 place-items-center rounded-full border transition-colors duration-300 ${
                  on ? 'border-ink bg-ink' : 'border-white/60 bg-black/30'
                } ${compact ? '' : 'hidden'}`}
              >
                {on ? <span className="size-1.5 rounded-full bg-ink-inv" /> : null}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

/** − qty + for accessories. */
export function Quantity({ name, value, max, onChange }: { name: string; value: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-line-strong p-1" role="group" aria-label={`${copy.qty.label}, ${name}`}>
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={value === 0}
        aria-label={copy.qty.fewer(name)}
        className="grid size-8 place-items-center rounded-full text-ink transition-colors hover:bg-ink hover:text-ink-inv disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink"
      >
        −
      </button>
      <output aria-live="polite" className="tnum w-6 text-center text-[14px]">
        {value}
      </output>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={copy.qty.more(name)}
        className="grid size-8 place-items-center rounded-full text-ink transition-colors hover:bg-ink hover:text-ink-inv disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink"
      >
        +
      </button>
    </div>
  )
}
