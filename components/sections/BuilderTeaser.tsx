'use client'

import { useRef, useState } from 'react'

import { Photo } from '@/components/media/Photo'
import { Focus } from '@/components/motion/Focus'
import { useScrollScene } from '@/components/motion/useScrollScene'
import { Pill } from '@/components/ui/Pill'
import { SectionHead } from '@/components/ui/SectionHead'
import { shapeOptions } from '@/content/builder'
import { builderTeaser } from '@/content/copy'

/**
 * The configurator in miniature: as you scroll, the centre photograph moves
 * through the six shapes — each change arriving with a focus pull — while
 * the four steps orbit it. The stage is CSS sticky; ScrollTrigger only reads
 * progress, so under reduced motion the section is simply static.
 */
export function BuilderTeaser() {
  const root = useRef<HTMLElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)

  useScrollScene(root, ({ ScrollTrigger }, el) => {
    let last = 0
    ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        ring.current?.style.setProperty('--rot', `${self.progress * 200}deg`)
        const i = Math.min(shapeOptions.length - 1, Math.floor(self.progress * shapeOptions.length))
        if (i !== last) {
          last = i
          setIndex(i)
        }
      },
    })
  })

  const shape = shapeOptions[index] ?? shapeOptions[0]!

  return (
    <section ref={root} aria-labelledby="teaser-title" className="relative h-[260svh] motion-reduce:h-auto">
      <div className="sticky top-0 flex h-svh flex-col items-center justify-between overflow-hidden py-16 motion-reduce:static motion-reduce:h-auto motion-reduce:gap-16 motion-reduce:py-28">
        <SectionHead id="teaser-title" label={builderTeaser.label} title={[builderTeaser.title]} blurb={builderTeaser.blurb} align="center" className="shell" />

        <div className="relative grid aspect-square w-[var(--orbit)] place-items-center [--orbit:min(66vw,46svh,600px)] sm:[--orbit:min(84vw,46svh,600px)]">
          <div ref={ring} aria-hidden="true" className="absolute inset-0 rounded-full border border-line" style={{ transform: 'rotate(var(--rot, 0deg))' }}>
            {builderTeaser.steps.map((label, i, all) => {
              const a = (i / all.length) * 360 - 90
              return (
                <span
                  key={label}
                  className="absolute left-1/2 top-1/2"
                  style={{ transform: `rotate(${a}deg) translateX(calc(var(--orbit) / 2)) rotate(${-a}deg)` }}
                >
                  <span
                    className="label block whitespace-nowrap rounded-full border border-line bg-bg px-3 py-2 text-ink-2"
                    style={{ transform: 'translate(-50%, -50%) rotate(calc(var(--rot, 0deg) * -1))' }}
                  >
                    <span className="text-accent-text">0{i + 1}</span> {label}
                  </span>
                </span>
              )
            })}
          </div>

          <div className="relative aspect-square w-[70%] overflow-hidden rounded-full">
            <div key={shape.id} className="absolute inset-0 animate-[focus-pull_.8s_cubic-bezier(.2,.7,.1,1)_both]">
              <Photo photo={shape.photo} sizes="(max-width: 900px) 60vw, 420px" alt="" />
            </div>
          </div>
          <p className="label absolute bottom-[8%] rounded-full bg-bg/80 px-3 py-1.5 text-ink" aria-hidden="true">
            {shape.label}
          </p>
        </div>

        <Focus>
          <Pill href={builderTeaser.cta.href} cursorLabel="Composer">
            {builderTeaser.cta.label}
          </Pill>
        </Focus>
      </div>
    </section>
  )
}
