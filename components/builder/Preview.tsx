'use client'

import { Photo } from '@/components/media/Photo'
import {
  addOnOptions,
  builderColourways,
  caseOptions,
  lensTypeOptions,
  shapeOptions,
  sizeDimensions,
} from '@/content/builder'
import { builder as copy } from '@/content/copy'
import type { PhotoKey } from '@/content/photos'
import { useBuilder } from '@/lib/builder-store'

import { PreviewStage } from './PreviewStage'

type TrayItem = { key: string; photo: PhotoKey; label: string; qty?: number; engraving?: string }

/**
 * The live preview. A photograph of the chosen shape, its frame repainted in
 * the chosen material and its lenses tinted to the chosen lenses. Beneath it,
 * the case, gift box and add-ons appear as they are chosen, with the
 * engraving on the case as it is typed.
 */
export function Preview() {
  const config = useBuilder((s) => s.config)

  const shape = shapeOptions.find((s) => s.id === config.shape) ?? shapeOptions[0]!
  const cw = builderColourways.find((c) => c.id === config.colourway) ?? builderColourways[0]!
  const kase = caseOptions.find((c) => c.id === config.caseId) ?? caseOptions[0]!
  const lens = lensTypeOptions.find((l) => l.id === config.lensType)
  const dims = sizeDimensions[config.size]

  const tray: TrayItem[] = [
    { key: `case-${kase.id}`, photo: kase.photo, label: kase.label, engraving: config.engraving || undefined },
    ...(config.giftBox ? [{ key: 'gift', photo: 'giftBox' as const, label: copy.giftBox.line }] : []),
    ...addOnOptions
      .filter((o) => (config.addOns[o.id] ?? 0) > 0)
      .map((o) => ({ key: o.id, photo: o.photo, label: o.label, qty: config.addOns[o.id] })),
  ]

  return (
    <div className="relative h-full overflow-hidden rounded-[4px] bg-[radial-gradient(ellipse_at_50%_38%,#2b2a28_0%,#121212_62%,#0a0a0a_100%)]">
      <p className="sr-only" aria-live="polite">
        {copy.preview.describe(shape.label, cw.name, lens?.label ?? '')}
      </p>
      <PreviewStage config={config} />

      {/* Caption */}
      <div className="on-dark pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-4 md:p-6">
        <p className="label hidden text-ink-2 sm:block">
          {copy.preview.label} <span className="text-ink-3">· {copy.preview.note}</span>
        </p>
        <p className="label tnum truncate text-ink">{copy.caption(shape.label, cw.name, dims.lensWidth, dims.bridge)}</p>
      </div>

      {/* Material, lenses, and what goes in the box */}
      <div className="on-dark pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-3 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 pt-10 md:flex-row md:items-end md:justify-between md:p-6 md:pt-16">
        <div className="flex items-center gap-3">
          <span
            key={cw.id}
            aria-hidden="true"
            className="size-9 shrink-0 animate-[focus-pull_.6s_cubic-bezier(.2,.7,.1,1)_both] rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,.3)]"
            style={{ background: `radial-gradient(circle at 30% 30%, ${cw.swatch[1]}, ${cw.swatch[0]} 60%)` }}
          />
          <span className="flex flex-col">
            <span className="font-display text-[24px] leading-none md:text-[26px]">{cw.name}</span>
            <span className="label-sm mt-1.5 text-ink-2">
              {lens?.label}
            </span>
          </span>
        </div>

        <ul aria-label={copy.preview.tray} className="flex gap-2 overflow-hidden">
          {tray.map((item) => (
            <li
              key={item.key}
              className="relative w-12 shrink-0 animate-[focus-pull_.6s_cubic-bezier(.2,.7,.1,1)_both] md:w-[72px]"
            >
              <div className="relative overflow-hidden rounded-[3px] shadow-card ring-1 ring-white/15">
                <Photo photo={item.photo} ratio="1 / 1" sizes="72px" alt="" />
                {item.engraving ? (
                  <span className="absolute inset-0 grid place-items-center font-display text-[13px] italic tracking-[0.2em] text-[#d8bc7a] [text-shadow:0_1px_0_rgba(0,0,0,.7)] md:text-[17px]">
                    {item.engraving}
                  </span>
                ) : null}
                {item.qty && item.qty > 1 ? (
                  <span className="label-sm absolute right-1 top-1 rounded-full bg-black/70 px-1.5 py-0.5 text-white">×{item.qty}</span>
                ) : null}
              </div>
              <p className="label-sm mt-1.5 hidden truncate text-ink-2 md:block">{item.label}</p>
              <span className="sr-only">
                {item.label}
                {item.qty && item.qty > 1 ? ` ×${item.qty}` : ''}
                {item.engraving ? ` — ${item.engraving}` : ''}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
