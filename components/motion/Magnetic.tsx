'use client'

import { useEffect, useRef, type ReactNode } from 'react'

import { useFinePointer, useReducedMotion } from '@/lib/hooks'

/**
 * Pulls its child gently towards the pointer while hovered, and lets go with
 * the site easing. Strength is the fraction of the pointer offset applied.
 */
export function Magnetic({
  children,
  strength = 0.28,
  className = '',
}: {
  children: ReactNode
  strength?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const fine = useFinePointer()
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || !fine || reduced) return

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - (r.left + r.width / 2)) * strength
      const y = (e.clientY - (r.top + r.height / 2)) * strength
      el.style.transition = 'transform .25s var(--ease)'
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`
    }
    const onLeave = () => {
      el.style.transition = 'transform .9s var(--ease)'
      el.style.transform = 'translate3d(0, 0, 0)'
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [fine, reduced, strength])

  return (
    <span ref={ref} className={`inline-flex will-change-transform ${className}`}>
      {children}
    </span>
  )
}
