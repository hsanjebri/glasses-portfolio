'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Photo } from '@/components/media/Photo'
import { Focus } from '@/components/motion/Focus'
import { worlds } from '@/content/copy'
import type { PhotoKey } from '@/content/photos'

type Side = 'optical' | 'sun'

const PHOTO: Record<Side, PhotoKey> = { optical: 'worldOptical', sun: 'worldSun' }

/**
 * OPTIQUE and SOLEIL, side by side. Hovering or focusing a side widens it to
 * 62% — clip-path on two full-width layers, so nothing reflows — and brings
 * its photograph up to full colour while the other side dims back.
 */
export function TwoWorlds() {
  const [active, setActive] = useState<Side | null>(null)
  const split = active === 'optical' ? 62 : active === 'sun' ? 38 : 50

  return (
    <section aria-labelledby="worlds-title" className="shell pb-28 md:pb-40">
      <Focus>
        <h2 id="worlds-title" className="label mb-8 flex items-center gap-3 font-mono text-ink-3">
          <span aria-hidden="true" className="inline-block h-px w-6 bg-current" />
          {worlds.label}
        </h2>
      </Focus>

      <Focus index={1} className="relative hidden h-[min(82svh,780px)] overflow-hidden rounded-[6px] min-[900px]:block">
        {(['optical', 'sun'] as const).map((side) => (
          <World
            key={side}
            side={side}
            clip={side === 'optical' ? `inset(0 ${100 - split}% 0 0)` : `inset(0 0 0 ${split}%)`}
            shift={side === 'optical' ? split / 2 - 50 : split / 2}
            state={active === null ? 'idle' : active === side ? 'on' : 'off'}
            onEnter={() => setActive(side)}
            onLeave={() => setActive(null)}
          />
        ))}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ transform: `translateX(${split - 50}%)`, transition: 'transform .9s var(--ease)' }}
        >
          <span className="absolute inset-y-0 left-1/2 w-px bg-white/40" />
        </span>
      </Focus>

      <div className="flex flex-col gap-3 min-[900px]:hidden">
        {(['optical', 'sun'] as const).map((side, i) => (
          <Focus key={side} index={i}>
            <Link href={worlds[side].href} className="relative block aspect-[4/5] overflow-hidden rounded-[6px]">
              <Photo photo={PHOTO[side]} sizes="100vw" className="absolute inset-0" />
              <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <span className="on-dark absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5">
                <span className="font-display text-[64px] leading-none">
                  {side === 'sun' ? <em className="display-italic">{worlds[side].title}</em> : worlds[side].title}
                </span>
                <span className="max-w-[34ch] text-[14px] leading-[1.55] text-ink-2">{worlds[side].blurb}</span>
                <span className="label mt-1 self-start border-b border-current pb-1">{worlds[side].cta}</span>
              </span>
            </Link>
          </Focus>
        ))}
      </div>
    </section>
  )
}

function World({
  side,
  clip,
  shift,
  state,
  onEnter,
  onLeave,
}: {
  side: Side
  clip: string
  /** Horizontal centre of the visible part, in % of the container, from the middle. */
  shift: number
  state: 'idle' | 'on' | 'off'
  onEnter: () => void
  onLeave: () => void
}) {
  const copy = worlds[side]
  return (
    <Link
      href={copy.href}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      data-cursor-label={copy.cta}
      className="group absolute inset-0 block overflow-hidden"
      style={{ clipPath: clip, transition: 'clip-path .9s var(--ease)' }}
    >
      <div
        className="absolute inset-0"
        style={{
          transform: `scale(${state === 'on' ? 1.04 : 1})`,
          filter: state === 'off' ? 'grayscale(1) brightness(.55)' : 'none',
          transition: 'transform 1.4s var(--ease), filter .9s var(--ease)',
        }}
      >
        <Photo photo={PHOTO[side]} sizes="100vw" className="absolute inset-0" />
      </div>
      <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-black/20" />

      <div
        className="on-dark absolute inset-0 flex flex-col justify-between p-10"
        style={{ transform: `translateX(${shift}%)`, transition: 'transform .9s var(--ease)' }}
      >
        <p className="label mx-auto text-ink-2">{side === 'optical' ? '01' : '02'}</p>
        <div className="mx-auto flex max-w-[36ch] flex-col items-center gap-4 text-center">
          <h3 className="font-display text-[clamp(64px,7vw,120px)] leading-none">
            {side === 'sun' ? <em className="display-italic">{copy.title}</em> : copy.title}
          </h3>
          <p className="text-[15px] leading-[1.6] text-ink-2">{copy.blurb}</p>
          <span className="label mt-2 border-b border-current pb-1">{copy.cta}</span>
        </div>
      </div>
    </Link>
  )
}
