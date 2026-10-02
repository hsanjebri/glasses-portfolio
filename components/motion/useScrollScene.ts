'use client'

import { useEffect, type DependencyList, type RefObject } from 'react'

import { afterIdle, loadGsap, type GsapKit } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/hooks'

type Scene = (kit: GsapKit, root: HTMLElement) => void | (() => void)

/**
 * A scroll-driven scene. GSAP is not in the initial bundle: the scene is
 * built when its section comes within a screen of the viewport, or once the
 * page is idle after load, whichever is first. Everything created inside runs in a gsap.context scoped to the
 * section and is reverted on unmount, so ScrollTriggers never leak between
 * routes. Under reduced motion the scene is never built — sections render
 * their resting state instead.
 *
 * Pass `when: false` to skip it (e.g. the mobile layout of a pinned section).
 */
export function useScrollScene(
  ref: RefObject<HTMLElement | null>,
  scene: Scene,
  deps: DependencyList = [],
  { when = true }: { when?: boolean } = {},
) {
  useEffect(() => {
    const root = ref.current
    if (!root || !when || prefersReducedMotion()) return

    let revert: (() => void) | undefined
    let dead = false

    let built = false
    const build = async () => {
      if (built) return
      built = true
      io.disconnect()
      const kit = await loadGsap()
      if (dead) return
      let extra: void | (() => void)
      const ctx = kit.gsap.context(() => {
        extra = scene(kit, root)
      }, root)
      revert = () => {
        extra?.()
        ctx.revert()
      }
      // Scenes can build in any order; pins must be measured top to bottom.
      kit.ScrollTrigger.sort()
      kit.ScrollTrigger.refresh()
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) void build()
      },
      { rootMargin: '100% 0px 100% 0px' },
    )
    io.observe(root)
    void afterIdle().then(build)

    return () => {
      dead = true
      io.disconnect()
      revert?.()
    }
    // The scene closure is rebuilt only when the caller's deps change.
  }, [ref, when, ...deps])
}
