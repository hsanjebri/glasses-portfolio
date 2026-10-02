'use client'

import type Lenis from 'lenis'

type Gsap = typeof import('gsap').gsap
type ScrollTriggerT = typeof import('gsap/ScrollTrigger').ScrollTrigger
export type GsapKit = { gsap: Gsap; ScrollTrigger: ScrollTriggerT }

let kit: GsapKit | null = null
let loading: Promise<GsapKit> | null = null
let lenis: Lenis | null = null

/**
 * GSAP and ScrollTrigger are never in the initial bundle. The first scroll
 * scene that nears the viewport loads them, and they are wired to Lenis then.
 */
export function loadGsap(): Promise<GsapKit> {
  if (kit) return Promise.resolve(kit)
  loading ??= Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([g, st]) => {
    g.gsap.registerPlugin(st.ScrollTrigger)
    kit = { gsap: g.gsap, ScrollTrigger: st.ScrollTrigger }
    if (lenis) lenis.on('scroll', kit.ScrollTrigger.update)
    return kit
  })
  return loading
}

/** Called by <SmoothScroll> as Lenis starts and stops. */
export function attachLenis(instance: Lenis | null) {
  lenis = instance
  if (instance && kit) instance.on('scroll', kit.ScrollTrigger.update)
  kit?.ScrollTrigger.refresh()
}

let idle: Promise<void> | null = null

/**
 * Resolves once the page has loaded and the main thread is idle. Scroll scenes
 * build then even if the user has not scrolled to them, so a pinned section
 * never inserts its spacer while someone is already scrolling past it.
 */
export function afterIdle(): Promise<void> {
  idle ??= new Promise<void>((resolve) => {
    const go = () => {
      if ('requestIdleCallback' in window) window.requestIdleCallback(() => resolve(), { timeout: 2500 })
      else setTimeout(resolve, 1200)
    }
    if (document.readyState === 'complete') go()
    else window.addEventListener('load', go, { once: true })
  })
  return idle
}
