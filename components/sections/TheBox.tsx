'use client'

import Link from 'next/link'
import { useRef } from 'react'

import { Photo } from '@/components/media/Photo'
import { useScrollScene } from '@/components/motion/useScrollScene'
import { SectionHead } from '@/components/ui/SectionHead'
import { box } from '@/content/copy'
import { getProduct } from '@/content/products'
import type { PhotoKey } from '@/content/photos'

const photoOf = (slug: string): PhotoKey => getProduct(slug)?.photo ?? 'giftBox'

/**
 * A scroll-scrubbed unboxing in photographs. The resting layout is the end
 * state — the contents laid out in a labelled row — so reduced motion shows
 * exactly that. With motion, the scene runs it backwards: the gift box sits
 * on the stack of contents, lifts away like a lid, and each piece rises from
 * the stack into its place in the row.
 */
export function TheBox() {
  const root = useRef<HTMLElement>(null)

  useScrollScene(root, ({ gsap }, el) => {
    const lid = el.querySelector<HTMLElement>('[data-lid]')
    const stage = el.querySelector<HTMLElement>('[data-stage]')
    const items = Array.from(el.querySelectorAll<HTMLElement>('[data-item]'))
    if (!lid || !stage) return

    // Every piece starts stacked at the centre of the stage, measured at each refresh.
    const offset = (item: HTMLElement) => {
      const s = stage.getBoundingClientRect()
      const r = item.getBoundingClientRect()
      return { x: s.left + s.width / 2 - (r.left + r.width / 2), y: s.top + s.height / 2 - (r.top + r.height / 2) }
    }

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: 0.8, invalidateOnRefresh: true },
    })

    tl.fromTo(lid, { yPercent: 0, opacity: 1, rotate: 0 }, { yPercent: -70, opacity: 0, rotate: -4, filter: 'blur(10px)', duration: 0.22 })
    items.forEach((item, i) => {
      tl.fromTo(
        item,
        {
          x: () => offset(item).x,
          y: () => offset(item).y,
          rotate: (i - 1.5) * 5,
          scale: 0.62,
          filter: 'blur(10px)',
        },
        { x: 0, y: 0, rotate: 0, scale: 1, filter: 'blur(0px)', duration: 0.3 },
        0.16 + i * 0.14,
      )
    })
    tl.to({}, { duration: 0.12 })
  })

  return (
    <section ref={root} aria-labelledby="box-title" className="relative h-[300svh] motion-reduce:h-auto">
      <div className="sticky top-0 flex h-svh flex-col justify-center gap-10 overflow-hidden py-20 motion-reduce:static motion-reduce:h-auto">
        <SectionHead id="box-title" label={box.label} title={[box.title]} blurb={box.blurb} className="shell" />

        <div data-stage className="shell relative">
          <ul className="relative z-[1] grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {box.items.map((item) => (
              <li key={item.slug} data-item className="will-change-transform">
                <Link href={box.href} className="group flex flex-col gap-3" data-cursor-label="Voir">
                  <div className="overflow-hidden rounded-[4px] shadow-card">
                    <Photo
                      photo={photoOf(item.slug)}
                      ratio="4 / 5"
                      sizes="(max-width: 768px) 46vw, 22vw"
                      imgClassName="transition-transform duration-[1.4s] ease-focus group-hover:scale-[1.04]"
                    />
                  </div>
                  <p className="label flex items-center justify-between text-ink-2">
                    {item.label}
                    <span aria-hidden="true" className="text-ink-3 transition-transform duration-500 group-hover:translate-x-1">
                      →
                    </span>
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          {/* The lid: on top of the stack at the start, gone by the time the row lands. */}
          <div
            data-lid
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 z-[2] w-[min(56vw,300px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[4px] opacity-0 shadow-card"
          >
            <Photo photo={photoOf(box.lid.slug)} ratio="4 / 5" sizes="300px" alt="" />
          </div>
        </div>
      </div>
    </section>
  )
}
