'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { DUR } from '@/lib/motion'
import { prefersReducedMotion } from '@/lib/hooks'

import { coverRadius, tweenAperture } from './aperture'
import { useLenis } from './SmoothScroll'

type Phase = 'idle' | 'closing' | 'waiting' | 'opening'

/**
 * Page transitions as a lens aperture. An internal link click closes the
 * aperture onto the click point; the new route opens it again from the centre.
 * Only full route changes are intercepted — search-param changes (catalogue
 * filters, builder state) and same-page anchors behave natively.
 */
export function RouteAperture() {
  const router = useRouter()
  const pathname = usePathname()
  const lenis = useLenis()
  const panel = useRef<HTMLDivElement>(null)
  const phase = useRef<Phase>('idle')
  const pathAtClose = useRef(pathname)
  const openRef = useRef<() => void>(() => {})

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (phase.current !== 'idle' || prefersReducedMotion()) return
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element | null)?.closest?.('a')
      if (!a || a.target === '_blank' || a.hasAttribute('download') || a.dataset.noAperture !== undefined) return

      const url = new URL(a.href, window.location.href)
      if (url.origin !== window.location.origin) return
      if (url.pathname === window.location.pathname) return

      e.preventDefault()
      e.stopPropagation()

      const el = panel.current
      if (!el) return router.push(url.pathname + url.search + url.hash)

      phase.current = 'closing'
      pathAtClose.current = window.location.pathname
      const origin = { x: e.clientX, y: e.clientY }
      el.style.visibility = 'visible'
      lenis?.stop()

      void tweenAperture(el, coverRadius(innerWidth, innerHeight, origin.x, origin.y), 0, DUR.aperture, origin).then(
        () => {
          phase.current = 'waiting'
          router.push(url.pathname + url.search + url.hash)
          // Never leave the panel shut if the navigation stalls or fails.
          window.setTimeout(() => {
            if (phase.current === 'waiting') openRef.current()
          }, 4000)
        },
      )
    }

    document.addEventListener('click', onClick, { capture: true })
    return () => document.removeEventListener('click', onClick, { capture: true })
  }, [router, lenis])

  // Refreshed after every render so the stall timeout sees the live Lenis.
  useEffect(() => {
    openRef.current = () => {
      const el = panel.current
      if (!el) return
      phase.current = 'opening'
      if (!window.location.hash) {
        lenis?.scrollTo(0, { immediate: true, force: true })
        window.scrollTo(0, 0)
      }
      lenis?.start()

      const origin = { x: innerWidth / 2, y: innerHeight / 2 }
      // One frame so the new page has painted under the panel before opening.
      requestAnimationFrame(() => {
        void tweenAperture(el, 0, coverRadius(innerWidth, innerHeight, origin.x, origin.y), DUR.aperture, origin).then(
          () => {
            el.style.visibility = 'hidden'
            phase.current = 'idle'
          },
        )
      })
    }
  })

  useEffect(() => {
    if (phase.current === 'waiting' && pathname !== pathAtClose.current) openRef.current()
  }, [pathname])

  return (
    <div
      ref={panel}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[150] bg-panel"
      style={{ visibility: 'hidden' }}
    />
  )
}
