'use client'

import Lenis from 'lenis'
import { createContext, useContext, useEffect, useState } from 'react'

import { attachLenis } from '@/lib/gsap'
import { useFinePointer, useReducedMotion } from '@/lib/hooks'

const LenisContext = createContext<Lenis | null>(null)

/** The live Lenis instance, or null under reduced motion and during SSR. */
export const useLenis = () => useContext(LenisContext)

/**
 * Lenis smooth scrolling on its own animation frame, so GSAP can stay out of
 * the initial bundle; ScrollTrigger hooks into it when a scene loads. Only for
 * mouse and trackpad: touch keeps native scrolling (which Lenis would not
 * change anyway) without a loop running every frame, and reduced motion
 * switches it off entirely.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion()
  const fine = useFinePointer()
  const [lenis, setLenis] = useState<Lenis | null>(null)

  useEffect(() => {
    if (reduced || !fine) return

    const instance = new Lenis({
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 3.2),
      smoothWheel: true,
      // Native touch scrolling is better than anything we can simulate.
      syncTouch: false,
      autoRaf: true,
    })

    attachLenis(instance)
    setLenis(instance)

    return () => {
      attachLenis(null)
      instance.destroy()
      setLenis(null)
    }
  }, [reduced, fine])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}
