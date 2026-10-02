'use client'

import { useEffect, useId, useRef } from 'react'

import {
  ENGRAVING_MAX,
  ENGRAVING_PRICE,
  GIFT_BOX_PRICE,
  addOnOptions,
  builderColourways,
  caseOptions,
  coatingOptions,
  lensTierOptions,
  lensTypeOptions,
  shapeOptions,
  sizeOptions,
} from '@/content/builder'
import { builder as copy } from '@/content/copy'
import { BUILDER_STEP_IDS, type BuilderStepId } from '@/content/types'
import { colourwayUnavailable, sanitizeEngraving, unavailable } from '@/lib/builder'
import { useBuilder } from '@/lib/builder-store'

import { Photo } from '@/components/media/Photo'

import { ChoiceGroup, Quantity, priceTag, type Choice } from './Choices'

/** The five steps as an accordion, with a progress rail down the left. */
export function Steps() {
  const open = useBuilder((s) => s.open)
  const visited = useBuilder((s) => s.visited)
  const openStep = useBuilder((s) => s.openStep)
  const total = BUILDER_STEP_IDS.length
  const progress = visited.length / total

  return (
    <div className="relative pl-7 md:pl-10">
      {/* Progress rail */}
      <div aria-hidden="true" className="absolute bottom-6 left-[7px] top-6 w-px bg-line md:left-[11px]">
        <span
          className="absolute inset-0 origin-top bg-ink"
          style={{ transform: `scaleY(${progress})`, transition: 'transform .9s var(--ease)' }}
        />
      </div>
      <p className="sr-only" aria-live="polite">
        {copy.progress(visited.length, total)}
      </p>

      <ol className="flex flex-col">
        {BUILDER_STEP_IDS.map((id, i) => (
          <Step
            key={id}
            id={id}
            index={i}
            open={open === id}
            visited={visited.includes(id)}
            onToggle={() => openStep(id)}
            next={BUILDER_STEP_IDS[i + 1]}
          />
        ))}
      </ol>
    </div>
  )
}

function Step({
  id,
  index,
  open,
  visited,
  onToggle,
  next,
}: {
  id: BuilderStepId
  index: number
  open: boolean
  visited: boolean
  onToggle: () => void
  next?: BuilderStepId
}) {
  const uid = useId()
  const openStep = useBuilder((s) => s.openStep)
  const ref = useRef<HTMLLIElement>(null)
  const meta = copy.steps[id]
  const summary = useStepSummary(id)

  // Bring a step into view when it opens — only on the transition, never on mount.
  const wasOpen = useRef(open)
  useEffect(() => {
    if (open && !wasOpen.current) {
      ref.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
    }
    wasOpen.current = open
  }, [open])

  return (
    <li ref={ref} className="relative scroll-mt-28 border-b border-line max-[899px]:scroll-mt-[calc(36svh+5rem)]">
      <span
        aria-hidden="true"
        className={`absolute -left-7 top-7 grid size-[15px] place-items-center rounded-full border transition-colors duration-500 md:-left-10 md:size-[23px] ${
          visited ? 'border-ink bg-ink text-ink-inv' : 'border-line-strong bg-bg text-ink-3'
        }`}
      >
        <span className="label-sm hidden md:block">{index + 1}</span>
      </span>
      <h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${uid}-panel`}
          id={`${uid}-head`}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 py-6 text-left"
        >
          <span className="flex flex-col gap-1.5">
            <span className="label text-ink-3">{copy.stepLabel(index + 1, BUILDER_STEP_IDS.length)}</span>
            <span className="font-display text-[clamp(30px,3vw,42px)] leading-none">{meta.label}</span>
          </span>
          <span className="flex items-center gap-4">
            {!open ? <span className="hidden max-w-[24ch] truncate text-right text-[13px] text-ink-3 sm:block">{summary}</span> : null}
            <span
              aria-hidden="true"
              className="grid size-8 shrink-0 place-items-center rounded-full border border-line transition-transform duration-500 ease-focus"
              style={{ transform: open ? 'rotate(45deg)' : 'none' }}
            >
              +
            </span>
          </span>
        </button>
      </h2>

      <div id={`${uid}-panel`} role="region" aria-labelledby={`${uid}-head`} hidden={!open} className="pb-8">
        <div className="flex flex-col gap-8 animate-[focus-pull_.7s_cubic-bezier(.2,.7,.1,1)_both]">
          <p className="text-[14px] text-ink-3">{meta.hint}</p>
          <StepBody id={id} />
          {next ? (
            <button
              type="button"
              onClick={() => openStep(next)}
              className="label self-start rounded-full border border-ink px-5 py-3 text-ink transition-colors duration-300 hover:bg-ink hover:text-ink-inv"
            >
              {copy.next} — {copy.steps[next].label}
            </button>
          ) : null}
        </div>
      </div>
    </li>
  )
}

function useStepSummary(id: BuilderStepId): string {
  const c = useBuilder((s) => s.config)
  switch (id) {
    case 'frame': {
      const cw = builderColourways.find((x) => x.id === c.colourway)
      return [shapeOptions.find((x) => x.id === c.shape)?.label, cw?.name, sizeOptions.find((x) => x.id === c.size)?.label].join(' · ')
    }
    case 'lenses':
      return lensTypeOptions.find((x) => x.id === c.lensType)?.label ?? ''
    case 'quality':
      return [lensTierOptions.find((x) => x.id === c.lensTier)?.label, ...c.coatings.map((id) => coatingOptions.find((o) => o.id === id)?.label)]
        .filter(Boolean)
        .join(' · ')
    case 'accessories':
      return (
        addOnOptions
          .filter((o) => (c.addOns[o.id] ?? 0) > 0)
          .map((o) => `${o.label} ×${c.addOns[o.id]}`)
          .join(' · ') || '—'
      )
    case 'packaging':
      return [caseOptions.find((x) => x.id === c.caseId)?.label, c.giftBox ? copy.giftBox.line : null, c.engraving || null].filter(Boolean).join(' · ')
  }
}

function StepBody({ id }: { id: BuilderStepId }) {
  const c = useBuilder((s) => s.config)
  const set = useBuilder((s) => s.set)
  const toggleCoating = useBuilder((s) => s.toggleCoating)
  const setAddOn = useBuilder((s) => s.setAddOn)
  const uid = useId()

  const toChoices = <T extends { id: string; label: string; blurb: string; priceDelta: number; photo?: Choice['photo']; icon?: Choice['icon'] }>(
    list: T[],
    reason: (o: T) => string | null = () => null,
  ): Choice[] =>
    list.map((o) => ({ id: o.id, label: o.label, blurb: o.blurb, priceDelta: o.priceDelta, photo: o.photo, icon: o.icon, unavailable: reason(o) }))

  switch (id) {
    case 'frame':
      return (
        <>
          <ChoiceGroup
            legend={copy.groups.shape}
            name="shape"
            columns={3}
            compact
            choices={toChoices(shapeOptions)}
            selected={[c.shape]}
            onSelect={(v) => set({ shape: v as typeof c.shape })}
          />
          <ChoiceGroup
            legend={copy.groups.colourway}
            name="colourway"
            columns={2}
            choices={builderColourways.map((cw) => ({
              id: cw.id,
              label: cw.name,
              blurb: cw.blurb,
              priceDelta: cw.priceDelta,
              unavailable: colourwayUnavailable(cw.id, c),
              visual: (
                <span
                  className="mx-auto block size-12 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,.12)] sm:size-14"
                  style={{ background: `radial-gradient(circle at 30% 30%, ${cw.swatch[1]}, ${cw.swatch[0]} 60%)` }}
                />
              ),
            }))}
            selected={[c.colourway]}
            onSelect={(v) => set({ colourway: v })}
          />
          <ChoiceGroup
            legend={copy.groups.size}
            name="size"
            columns={3}
            compact
            choices={toChoices(sizeOptions)}
            selected={[c.size]}
            onSelect={(v) => set({ size: v as typeof c.size })}
          />
        </>
      )

    case 'lenses':
      return (
        <ChoiceGroup
          legend={copy.groups.lensType}
          name="lensType"
          choices={toChoices(lensTypeOptions, (o) => unavailable(o, c))}
          selected={[c.lensType]}
          onSelect={(v) => set({ lensType: v as typeof c.lensType })}
        />
      )

    case 'quality':
      return (
        <>
          <ChoiceGroup
            legend={copy.groups.lensTier}
            name="lensTier"
            columns={3}
            compact
            choices={toChoices(lensTierOptions, (o) => unavailable(o, c))}
            selected={[c.lensTier]}
            onSelect={(v) => set({ lensTier: v as typeof c.lensTier })}
          />
          <ChoiceGroup
            legend={copy.groups.coatings}
            name="coatings"
            multiple
            choices={toChoices(coatingOptions, (o) => unavailable(o, c))}
            selected={c.coatings}
            onSelect={(v) => toggleCoating(v as (typeof c.coatings)[number])}
          />
        </>
      )

    case 'accessories':
      return (
        <fieldset className="m-0 border-0 p-0">
          <legend className="label mb-4 text-ink-3">{copy.groups.addOns}</legend>
          <ul className="flex flex-col gap-2">
            {addOnOptions.map((o) => (
              <li key={o.id} className="flex items-center gap-3 rounded-[4px] border border-line bg-paper p-2.5">
                <span className="block w-16 shrink-0 overflow-hidden rounded-[3px]">
                  <Photo photo={o.photo} ratio="1 / 1" sizes="64px" alt="" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="text-[14px] font-medium">{o.label}</span>
                    <span className="label-sm tnum text-ink-3">{priceTag(o.priceDelta)}</span>
                  </span>
                  <span className="text-[12.5px] leading-[1.45] text-ink-3">{o.blurb}</span>
                </span>
                <Quantity name={o.label} value={c.addOns[o.id] ?? 0} max={o.maxQty} onChange={(n) => setAddOn(o.id, n)} />
              </li>
            ))}
          </ul>
        </fieldset>
      )

    case 'packaging':
      return (
        <>
          <ChoiceGroup
            legend={copy.groups.case}
            name="case"
            columns={3}
            compact
            choices={toChoices(caseOptions)}
            selected={[c.caseId]}
            onSelect={(v) => set({ caseId: v as typeof c.caseId })}
          />

          <fieldset className="m-0 border-0 p-0">
            <legend className="label mb-4 text-ink-3">{copy.groups.gift}</legend>
            <label className="flex cursor-pointer items-center gap-3 rounded-[4px] border border-line bg-paper p-2.5 has-[:checked]:border-ink has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent-text">
              <input type="checkbox" checked={c.giftBox} onChange={(e) => set({ giftBox: e.target.checked })} className="sr-only" />
              <span className="block w-16 shrink-0 overflow-hidden rounded-[3px]">
                <Photo photo="giftBox" ratio="1 / 1" sizes="64px" alt="" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="text-[14px] font-medium">{copy.giftBox.label}</span>
                  <span className="label-sm tnum text-ink-3">{priceTag(GIFT_BOX_PRICE)}</span>
                </span>
                <span className="text-[12.5px] leading-[1.45] text-ink-3">{copy.giftBox.blurb}</span>
              </span>
              <span
                aria-hidden="true"
                className={`relative h-6 w-10 shrink-0 rounded-full transition-colors duration-300 ${c.giftBox ? 'bg-ink' : 'bg-line-strong'}`}
              >
                <span
                  className={`absolute left-1 top-1 size-4 rounded-full transition-transform duration-300 ease-focus ${c.giftBox ? 'bg-ink-inv' : 'bg-ink-2'}`}
                  style={{ transform: c.giftBox ? 'translateX(16px)' : 'none' }}
                />
              </span>
            </label>

            <div className="mt-4 flex flex-col gap-2">
              <label htmlFor={`${uid}-eng`} className="label flex justify-between text-ink-3">
                <span>{copy.engraving.label}</span>
                <span className="tnum">{priceTag(ENGRAVING_PRICE)}</span>
              </label>
              <input
                id={`${uid}-eng`}
                type="text"
                inputMode="text"
                autoComplete="off"
                maxLength={ENGRAVING_MAX}
                disabled={!c.giftBox}
                value={c.engraving}
                placeholder={copy.engraving.placeholder}
                onChange={(e) => set({ engraving: sanitizeEngraving(e.target.value) })}
                aria-describedby={`${uid}-eng-hint`}
                className="w-40 rounded-[4px] border border-line-strong bg-paper px-4 py-3 font-display text-[24px] uppercase tracking-[0.3em] text-ink placeholder:text-ink-3/50 focus:border-ink focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p id={`${uid}-eng-hint`} className={`text-[12.5px] ${c.giftBox ? 'text-ink-3' : 'text-accent-text'}`}>
                {c.giftBox ? copy.engraving.hint : copy.engraving.unavailable}
              </p>
            </div>
          </fieldset>
        </>
      )
  }
}

