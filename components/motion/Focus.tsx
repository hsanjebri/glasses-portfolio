'use client'

import { useRef, type CSSProperties, type ElementType, type ReactNode } from 'react'

import { STAGGER } from '@/lib/motion'

import { useInView } from './useInView'

type Props = {
  children: ReactNode
  as?: ElementType
  /** Position in a staggered group. Each step adds STAGGER seconds. */
  index?: number
  /** Extra delay in seconds, added to the stagger. */
  delay?: number
  /**
   * Controls the reveal from outside. When provided, the element ignores
   * scroll position and sharpens exactly when this turns true.
   */
  show?: boolean
  /**
   * Above the fold: run the reveal in CSS from first paint instead of waiting
   * for hydration and an IntersectionObserver.
   */
  immediate?: boolean
  className?: string
  style?: CSSProperties
  id?: string
}

/**
 * The reveal primitive. Content arrives the way an image sharpens through a
 * lens: opacity 0, blur(14px), scale(1.02) → sharp, over 1.1s.
 * The hidden state is in CSS, so nothing flashes before hydration, and the
 * reduced-motion stylesheet turns it into an instant, unblurred reveal.
 */
export function Focus({
  children,
  as: Tag = 'div',
  index = 0,
  delay = 0,
  show,
  immediate = false,
  className = '',
  style,
  id,
}: Props) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { enabled: show === undefined && !immediate })
  const shown = show ?? inView

  if (immediate) {
    return (
      <Tag ref={ref} id={id} className={`focus-auto ${className}`} style={{ ...style, animationDelay: `${delay + index * STAGGER}s` }}>
        {children}
      </Tag>
    )
  }

  return (
    <Tag
      ref={ref}
      id={id}
      className={`${shown ? 'focus-shown' : 'focus-hidden'} ${className}`}
      style={{ ...style, transitionDelay: shown ? `${delay + index * STAGGER}s` : '0s' }}
    >
      {children}
    </Tag>
  )
}
