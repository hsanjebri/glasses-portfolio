'use client'

import { useRef } from 'react'

import { Focus } from '@/components/motion/Focus'
import { useScrollScene } from '@/components/motion/useScrollScene'
import { manifesto } from '@/content/copy'

/**
 * One long sentence. Each word is printed twice — ghost underneath, ink on
 * top — and the ink layer's opacity is scrubbed word by word, so the colour
 * change is an opacity animation. At rest (and under reduced motion) the ink
 * layer is fully visible.
 */
export function Manifesto() {
  const root = useRef<HTMLElement>(null)
  const words = manifesto.sentence.split(' ')

  useScrollScene(root, ({ gsap }, el) => {
    const inks = el.querySelectorAll('[data-ink]')
    gsap.fromTo(
      inks,
      { opacity: 0 },
      {
        opacity: 1,
        ease: 'none',
        stagger: 0.5,
        scrollTrigger: { trigger: el.querySelector('[data-sentence]'), start: 'top 78%', end: 'bottom 42%', scrub: 0.6 },
      },
    )
  })

  return (
    <section ref={root} aria-labelledby="manifesto-label" className="shell py-28 md:py-44">
      <Focus>
        <p id="manifesto-label" className="label mb-10 flex items-center gap-3 text-ink-3">
          <span aria-hidden="true" className="inline-block h-px w-6 bg-current" />
          {manifesto.label}
        </p>
      </Focus>
      <p data-sentence className="max-w-[24ch] font-display text-[clamp(32px,4.6vw,72px)] leading-[1.08] tracking-[-0.015em] md:max-w-[26ch]">
        {/* Screen readers get the sentence once; the doubled words are presentational. */}
        <span className="sr-only">{manifesto.sentence}</span>
        <span aria-hidden="true">
          {words.map((w, i) => (
            <span key={i} className="relative inline-block whitespace-pre">
              <span className="text-line-strong">{w}</span>
              <span data-ink className="absolute inset-0 text-ink">
                {w}
              </span>
              {i < words.length - 1 ? ' ' : null}
            </span>
          ))}
        </span>
      </p>
    </section>
  )
}
