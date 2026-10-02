'use client'

import { useEffect, useState, type RefObject } from 'react'

import { useReducedMotion } from '@/lib/hooks'

/**
 * Flips to true the first time the element crosses into view and stays true.
 * Under reduced motion it is true from the start: nothing waits to be revealed.
 * Pass `enabled: false` to hold it (the hero holds until the video settles).
 */
export function useInView(
  ref: RefObject<Element | null>,
  { rootMargin = '0px 0px -12% 0px', enabled = true }: { rootMargin?: string; enabled?: boolean } = {},
): boolean {
  const reduced = useReducedMotion()
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || !enabled || seen) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true)
          io.disconnect()
        }
      },
      { rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, rootMargin, enabled, seen])

  return seen || reduced
}
