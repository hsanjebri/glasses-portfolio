'use client'

import { useEffect, useRef, useState } from 'react'

import { coverRadius, tweenAperture } from '@/components/motion/aperture'
import { useLenis } from '@/components/motion/SmoothScroll'
import { BrandWord } from '@/components/ui/BrandWord'
import { a11y } from '@/content/copy'
import { DUR, FOCUS_BLUR, PRELOADER_MAX_MS, PRELOADER_SEEN_KEY } from '@/lib/motion'
import { prefersReducedMotion } from '@/lib/hooks'
import { useUi } from '@/lib/ui-store'

/** Shortest time the word is held, so a warm cache still reads as a gesture. */
const MIN_MS = 900

/**
 * The brand word out of focus, sharpening as the page's assets arrive, then
 * the aperture opens onto the hero. Never longer than PRELOADER_MAX_MS, and
 * skipped entirely on repeat visits within the session (an inline script in
 * the layout hides it before first paint) and under reduced motion.
 */
export function Preloader() {
  const setPreloaded = useUi((s) => s.setPreloaded)
  const lenis = useLenis()
  const panel = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [gone, setGone] = useState(false)

  // Lenis arrives a tick after mount; hold scrolling while the word is up.
  const lenisRef = useRef(lenis)
  const holding = useRef(true)
  useEffect(() => {
    lenisRef.current = lenis
    if (holding.current) lenis?.stop()
  }, [lenis])

  useEffect(() => {
    let seen = false
    try {
      seen = sessionStorage.getItem(PRELOADER_SEEN_KEY) === '1'
    } catch {}

    if (seen || prefersReducedMotion()) {
      holding.current = false
      lenisRef.current?.start()
      setGone(true)
      setPreloaded(true)
      return
    }

    const started = performance.now()
    const tasks: Promise<unknown>[] = [document.fonts?.ready ?? Promise.resolve()]
    if (document.readyState !== 'complete') {
      tasks.push(new Promise((r) => window.addEventListener('load', r, { once: true })))
    }
    const v = document.querySelector<HTMLVideoElement>('video[data-hero]')
    if (v && v.readyState < 3) {
      tasks.push(
        new Promise((r) => {
          v.addEventListener('canplaythrough', r, { once: true })
          v.addEventListener('error', r, { once: true })
        }),
      )
    }

    let done = 0
    tasks.forEach((t) => void t.then(() => setProgress(++done / tasks.length)))

    let cancelled = false
    const finish = async () => {
      if (cancelled) return
      cancelled = true
      setProgress(1)
      const wait = Math.max(0, MIN_MS - (performance.now() - started))
      await new Promise((r) => setTimeout(r, wait + 250))
      try {
        sessionStorage.setItem(PRELOADER_SEEN_KEY, '1')
      } catch {}
      setPreloaded(true)
      holding.current = false
      lenisRef.current?.start()
      const el = panel.current
      if (el) {
        const o = { x: innerWidth / 2, y: innerHeight / 2 }
        await tweenAperture(el, 0, coverRadius(innerWidth, innerHeight, o.x, o.y), DUR.aperture * 1.2, o)
      }
      setGone(true)
    }

    // Leaves room for the settle pause and the aperture inside the ceiling.
    const cap = window.setTimeout(finish, PRELOADER_MAX_MS - DUR.aperture * 1200 - 250)
    void Promise.all(tasks).then(finish)
    return () => window.clearTimeout(cap)
  }, [setPreloaded])

  if (gone) return null

  return (
    <div
      ref={panel}
      data-preloader
      role="status"
      aria-label={a11y.loading}
      className="fixed inset-0 z-[160] grid place-items-center bg-bg text-ink"
    >
      <span
        className="block"
        style={{
          filter: `blur(${(1 - progress) * FOCUS_BLUR}px)`,
          opacity: 0.35 + progress * 0.65,
          transform: `scale(${1.02 - progress * 0.02})`,
          transition: 'filter .6s var(--ease), opacity .6s var(--ease), transform .6s var(--ease)',
        }}
      >
        <BrandWord className="font-display text-[clamp(64px,14vw,220px)] leading-none tracking-[-0.03em]" />
      </span>
    </div>
  )
}
