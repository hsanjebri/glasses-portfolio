'use client'

import { useRef } from 'react'

import { Photo } from '@/components/media/Photo'
import { Focus } from '@/components/motion/Focus'
import { useInView } from '@/components/motion/useInView'
import { SectionHead } from '@/components/ui/SectionHead'
import { atelier } from '@/content/copy'

/** Grid placement per note: the soldering and the fitting run wide, the details narrow. */
const LAYOUT = [
  { span: 'md:col-span-4', ratio: '16 / 10' },
  { span: 'md:col-span-2', ratio: '4 / 5' },
  { span: 'md:col-span-2', ratio: '4 / 5' },
  { span: 'md:col-span-4', ratio: '16 / 10' },
]

export function Atelier() {
  return (
    <section id="atelier" aria-labelledby="atelier-title" className="shell scroll-mt-20 py-24 md:py-40">
      <SectionHead id="atelier-title" label={atelier.label} title={[atelier.title]} className="mb-14 md:mb-20" />

      <div className="grid gap-x-4 gap-y-12 md:grid-cols-6 md:gap-y-16">
        {atelier.notes.map((note, i) => (
          <Note key={note.kicker} note={note} index={i} {...LAYOUT[i]!} />
        ))}
      </div>

      <StatsBand />
    </section>
  )
}

function Note({
  note,
  index,
  span,
  ratio,
}: {
  note: (typeof atelier.notes)[number]
  index: number
  span: string
  ratio: string
}) {
  const ref = useRef<HTMLElement>(null)
  const shown = useInView(ref)

  return (
    <article ref={ref} className={`flex flex-col gap-6 ${span}`}>
      {/* The photograph opens like an aperture: an inset clip that widens as it sharpens. */}
      <div
        className="overflow-hidden rounded-[4px]"
        style={{
          clipPath: shown ? 'inset(0 0 0 0)' : 'inset(8% 8% 8% 8%)',
          filter: shown ? 'none' : 'blur(14px)',
          transition: `clip-path 1.4s var(--ease) ${index * 0.08}s, filter 1.1s var(--ease) ${index * 0.08}s`,
        }}
        data-cursor="magnify"
      >
        <Photo photo={note.photo} ratio={ratio} sizes={ratio === '4 / 5' ? '(max-width: 768px) 100vw, 30vw' : '(max-width: 768px) 100vw, 62vw'} />
      </div>
      <Focus index={1} className="flex max-w-[52ch] flex-col gap-3">
        <p className="label text-ink-3">{note.kicker}</p>
        <h3 className="font-display text-[clamp(32px,3vw,46px)] leading-none">{note.title}</h3>
        <p className="text-[15px] leading-[1.65] text-ink-2">{note.body}</p>
      </Focus>
    </article>
  )
}

function StatsBand() {
  const ref = useRef<HTMLDListElement>(null)
  const shown = useInView(ref)

  return (
    <dl ref={ref} className="on-light mt-20 grid grid-cols-2 overflow-hidden rounded-[4px] bg-panel md:mt-28 md:grid-cols-4">
      {atelier.stats.map((s, i) => (
        <div
          key={s.label}
          className={`flex flex-col gap-6 border-line p-6 md:p-8 ${i % 2 === 1 ? 'border-l' : ''} ${i > 1 ? 'border-t md:border-t-0' : ''} ${i === 2 ? 'md:border-l' : ''}`}
        >
          <dt className="label text-ink-3">{s.label}</dt>
          <dd className="flex flex-col gap-5">
            <span className={`font-display text-[clamp(48px,5vw,80px)] leading-none ${s.kind === 'accent' ? 'display-italic text-accent-text' : ''}`}>
              {s.value}
              {s.unit ? <span className="label ml-2 align-middle text-ink-3">{s.unit}</span> : null}
            </span>
            {s.kind === 'ruler' ? <Ruler fill={s.fill ?? 0.8} shown={shown} /> : null}
            {s.kind === 'shimmer' ? <Shimmer /> : null}
            {s.kind === 'plain' || s.kind === 'accent' ? <span aria-hidden="true" className="h-3" /> : null}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function Ruler({ fill, shown }: { fill: number; shown: boolean }) {
  return (
    <span aria-hidden="true" className="relative block h-3">
      <span className="absolute inset-x-0 bottom-0 flex h-full items-end justify-between">
        {Array.from({ length: 21 }, (_, i) => (
          <span key={i} className={`w-px bg-ink-3 ${i % 5 === 0 ? 'h-full' : 'h-1/2'}`} />
        ))}
      </span>
      <span
        className="absolute bottom-0 left-0 h-[3px] w-full origin-left bg-accent"
        style={{ transform: `scaleX(${shown ? fill : 0})`, transition: 'transform 1.6s cubic-bezier(.2,.7,.1,1) .3s' }}
      />
    </span>
  )
}

function Shimmer() {
  return (
    <span aria-hidden="true" className="relative block h-3 overflow-hidden rounded-full bg-black/10">
      <span className="absolute inset-y-0 -left-1/2 w-1/2 animate-[shimmer_2.8s_cubic-bezier(.2,.7,.1,1)_infinite] bg-[linear-gradient(90deg,transparent,rgba(228,87,46,.8),transparent)]" />
    </span>
  )
}
