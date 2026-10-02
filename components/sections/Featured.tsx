'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'

import { Photo } from '@/components/media/Photo'
import { Focus } from '@/components/motion/Focus'
import { useScrollScene } from '@/components/motion/useScrollScene'
import { SectionHead } from '@/components/ui/SectionHead'
import { brands } from '@/content/brands'
import { featured } from '@/content/copy'
import { formatPrice } from '@/content/site'
import type { Frame } from '@/content/types'
import { useIsMobile } from '@/lib/hooks'

/**
 * Six frames on a horizontal track. From 900px with motion allowed, the
 * section pins and vertical scroll drives the track. Otherwise it is a native
 * swipe carousel with snap — the same markup, nothing hidden.
 */
export function Featured({ frames }: { frames: Frame[] }) {
  const root = useRef<HTMLElement>(null)
  const viewport = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLOListElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const mobile = useIsMobile()

  // Native mode: the hairline follows the carousel's own scroll position.
  useEffect(() => {
    const v = viewport.current
    if (!v) return
    const onScroll = () => {
      const max = v.scrollWidth - v.clientWidth
      if (bar.current && max > 0) bar.current.style.transform = `scaleX(${v.scrollLeft / max})`
    }
    v.addEventListener('scroll', onScroll, { passive: true })
    return () => v.removeEventListener('scroll', onScroll)
  }, [])

  useScrollScene(
    root,
    ({ gsap }, el) => {
      const v = viewport.current
      const t = track.current
      if (!v || !t) return
      v.style.overflowX = 'hidden'
      v.scrollLeft = 0
      const distance = () => t.scrollWidth - v.clientWidth

      gsap.to(t, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`
          },
        },
      })

      return () => {
        v.style.overflowX = ''
      }
    },
    [],
    { when: !mobile },
  )

  return (
    <section
      ref={root}
      aria-labelledby="featured-title"
      className="flex flex-col justify-center gap-12 overflow-hidden py-24 min-[900px]:min-h-svh min-[900px]:py-16"
    >
      <div className="shell flex items-end justify-between gap-6">
        <SectionHead id="featured-title" label={featured.label} title={[featured.title]} />
        <Focus index={2}>
          <p className="label hidden items-center gap-3 text-ink-3 min-[900px]:flex">
            {featured.hint}
            <span aria-hidden="true" className="inline-block h-px w-10 bg-current" />
          </p>
          <p className="label flex items-center gap-3 text-ink-3 min-[900px]:hidden">
            {featured.hintMobile}
            <span aria-hidden="true" className="inline-block h-px w-10 bg-current" />
          </p>
        </Focus>
      </div>

      <div
        ref={viewport}
        className="snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        tabIndex={-1}
      >
        <ol ref={track} className="flex w-max gap-4 px-[var(--gutter)] will-change-transform min-[900px]:gap-6">
          {frames.map((f, i) => (
            <li key={f.slug} className="w-[78vw] max-w-[420px] shrink-0 snap-start scroll-ml-[var(--gutter)] min-[900px]:w-[min(30vw,440px)] min-[900px]:max-w-none">
              <Focus index={i}>
                <Link href={`/catalogue/${f.slug}`} className="group flex flex-col gap-5" data-cursor-label="Voir">
                  <div className="relative overflow-hidden rounded-[4px]" data-cursor="magnify">
                    <Photo
                      photo={f.photo}
                      ratio="4 / 5"
                      sizes="(max-width: 900px) 78vw, 30vw"
                      imgClassName="transition-transform duration-[1.4s] ease-focus group-hover:scale-[1.04]"
                    />
                    <span className="label absolute left-4 top-4 text-white mix-blend-difference">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-2">
                      <p className="label text-ink-3">{brands[f.brand].name}</p>
                      <h3 className="display-italic text-[clamp(30px,2.6vw,40px)] leading-none">{f.name}</h3>
                    </div>
                    <p className="label tnum pt-0.5 text-ink-2">{formatPrice(f.price)}</p>
                  </div>
                </Link>
              </Focus>
            </li>
          ))}
        </ol>
      </div>

      <div className="shell">
        <div className="relative h-px w-full bg-line" aria-hidden="true">
          <span ref={bar} className="absolute inset-0 origin-left bg-ink" style={{ transform: 'scaleX(0)' }} />
        </div>
      </div>
    </section>
  )
}
