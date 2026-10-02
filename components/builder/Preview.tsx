'use client'

import { Photo } from '@/components/media/Photo'
import { builderColourways, caseOptions, lensTypeOptions, shapeOptions, sizeDimensions } from '@/content/builder'
import { builder as copy } from '@/content/copy'
import { useBuilder } from '@/lib/builder-store'

/**
 * The live preview: the chosen shape photographed, the chosen material as a
 * pastille, and the chosen case with the initials engraved on it as you type.
 * Every change re-keys what changed, so it arrives with a focus pull.
 */
export function Preview() {
  const config = useBuilder((s) => s.config)
  const shape = shapeOptions.find((s) => s.id === config.shape) ?? shapeOptions[0]!
  const cw = builderColourways.find((c) => c.id === config.colourway) ?? builderColourways[0]!
  const kase = caseOptions.find((c) => c.id === config.caseId) ?? caseOptions[0]!
  const lens = lensTypeOptions.find((l) => l.id === config.lensType)
  const dims = sizeDimensions[config.size]

  return (
    <div className="relative h-full overflow-hidden rounded-[4px] bg-paper">
      <div key={shape.id} className="absolute inset-0 animate-[focus-pull_.8s_cubic-bezier(.2,.7,.1,1)_both]" data-cursor="magnify">
        <Photo photo={shape.photo} sizes="(max-width: 900px) 100vw, 55vw" priority />
      </div>
      <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/55" />

      <div className="on-dark absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-4 md:p-6">
        <p className="label hidden text-ink-2 sm:block">{copy.preview.label}</p>
        <p className="label tnum truncate text-ink">{copy.caption(shape.label, cw.name, dims.lensWidth, dims.bridge)}</p>
      </div>

      <div className="on-dark absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 md:p-6">
        <div className="flex flex-col gap-3">
          <div key={cw.id} className="flex items-center gap-3 animate-[focus-pull_.6s_cubic-bezier(.2,.7,.1,1)_both]">
            <span
              aria-hidden="true"
              className="size-9 rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,.3)]"
              style={{ background: `radial-gradient(circle at 30% 30%, ${cw.swatch[1]}, ${cw.swatch[0]} 60%)` }}
            />
            <span className="flex flex-col">
              <span className="font-display text-[26px] leading-none">{cw.name}</span>
              {lens ? <span className="label-sm mt-1.5 text-ink-2">{lens.label}</span> : null}
            </span>
          </div>
          <p className="hidden max-w-[34ch] text-[12px] leading-[1.5] text-ink-2 md:block">{copy.preview.note}</p>
        </div>

        {/* The case, with the engraving live on it */}
        <div
          key={kase.id}
          className="relative w-[34%] max-w-[200px] shrink-0 overflow-hidden rounded-[3px] shadow-card animate-[focus-pull_.7s_cubic-bezier(.2,.7,.1,1)_both]"
        >
          <Photo photo={kase.photo} ratio="4 / 3" sizes="200px" alt={kase.label} />
          {config.engraving ? (
            <span
              aria-label={`${copy.engraving.label} : ${config.engraving}`}
              className="absolute inset-0 grid place-items-center font-display text-[clamp(22px,3vw,34px)] italic tracking-[0.3em] text-[#d8bc7a] [text-shadow:0_1px_0_rgba(0,0,0,.6),0_-1px_0_rgba(255,255,255,.15)]"
            >
              {config.engraving}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
