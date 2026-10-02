'use client'

import { useEffect, useRef } from 'react'

import { BrandWord } from './BrandWord'

/**
 * The brand word sized to fill its container exactly, whatever the brand name
 * is. Measured once at a reference size, then scaled on resize and after the
 * display font arrives.
 */
export function FitWord({ className = '' }: { className?: string }) {
  const box = useRef<HTMLDivElement>(null)
  const word = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = box.current
    const w = word.current
    if (!el || !w) return
    const fit = () => {
      w.style.fontSize = '100px'
      const natural = w.getBoundingClientRect().width
      if (natural > 0) w.style.fontSize = `${(el.clientWidth / natural) * 100 * 0.995}px`
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    void document.fonts?.ready.then(fit)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={box} aria-hidden="true" className={`w-full ${className}`}>
      <span ref={word} className="inline-block whitespace-nowrap font-display leading-[0.78] tracking-[-0.02em]" style={{ fontSize: '19vw' }}>
        <BrandWord />
      </span>
    </div>
  )
}
