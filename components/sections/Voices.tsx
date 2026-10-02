'use client'

import { useEffect, useRef, useState } from 'react'

import { SectionHead } from '@/components/ui/SectionHead'
import { voices } from '@/content/copy'

/**
 * Three quotes, one in focus at a time: whichever sits nearest the middle of
 * the viewport is sharp, the others are blurred back. Under reduced motion
 * all three are sharp.
 */
export function Voices() {
  const list = useRef<HTMLOListElement>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const items = Array.from(list.current?.querySelectorAll('[data-quote]') ?? [])
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(items.indexOf(e.target))
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    items.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <section aria-labelledby="voices-title" className="shell py-24 md:py-40">
      <SectionHead id="voices-title" label={voices.label} title={[voices.title]} className="mb-16 md:mb-24" />
      <ol ref={list} className="flex flex-col gap-16 md:gap-28">
        {voices.quotes.map((q, i) => {
          const on = i === active
          return (
            <li
              key={q.name}
              data-quote
              className="grid gap-6 md:grid-cols-[120px_1fr] motion-reduce:!opacity-100 motion-reduce:![filter:none]"
              style={{
                opacity: on ? 1 : 0.32,
                filter: on ? 'none' : 'blur(5px)',
                transition: 'opacity 1.1s var(--ease), filter 1.1s var(--ease)',
              }}
            >
              <p className="label pt-4 text-ink-3">{String(i + 1).padStart(2, '0')}</p>
              <figure className="flex flex-col gap-8">
                <blockquote className="max-w-[28ch] font-display text-[clamp(30px,4vw,60px)] leading-[1.1] tracking-[-0.015em]">
                  <p>
                    <span aria-hidden="true" className="text-accent">“</span>
                    {q.quote}
                    <span aria-hidden="true" className="text-accent">”</span>
                  </p>
                </blockquote>
                <figcaption className="label flex flex-wrap gap-x-4 gap-y-2 text-ink-2">
                  <span>{q.name}</span>
                  <span className="text-ink-3">{q.role}</span>
                </figcaption>
              </figure>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
