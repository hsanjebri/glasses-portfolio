'use client'

import { useSyncExternalStore } from 'react'

function subscribeMedia(query: string) {
  return (onChange: () => void) => {
    const mql = window.matchMedia(query)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }
}

/**
 * Subscribes to a media query. Returns `serverValue` during SSR and the first
 * client render so hydration never mismatches.
 */
export function useMediaQuery(query: string, serverValue = false): boolean {
  return useSyncExternalStore(
    subscribeMedia(query),
    () => window.matchMedia(query).matches,
    () => serverValue,
  )
}

export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')

/** True on devices with a precise hovering pointer — i.e. not touch. */
export const useFinePointer = () => useMediaQuery('(hover: hover) and (pointer: fine)')

/** The mobile breakpoint used throughout the brief: under 900px. */
export const useIsMobile = () => useMediaQuery('(max-width: 899.98px)')

/** Non-reactive read, for use inside effects and event handlers. */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
