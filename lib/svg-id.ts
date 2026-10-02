import { useId } from 'react'

/**
 * A document-unique id for SVG defs (masks, gradients, filters). Unique per
 * instance, so two drawings of the same frame never share a mask — a shared
 * id resolves to whichever copy comes first, even one inside display: none.
 * Stable across server and client render, and usable in Server Components.
 */
export function useSvgId(prefix: string): string {
  return prefix + useId().replace(/[^a-zA-Z0-9_-]/g, '')
}
