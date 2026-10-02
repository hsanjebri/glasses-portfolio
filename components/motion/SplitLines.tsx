'use client'

import { useRef, type ElementType, type ReactNode } from 'react'

import { STAGGER } from '@/lib/motion'

import { useInView } from './useInView'

type Props = {
  /** One entry per line. Line breaks are authored in copy, not measured. */
  lines: ReactNode[]
  as?: ElementType
  className?: string
  lineClassName?: string
  show?: boolean
  /** Above the fold: animate from first paint in CSS (see <Focus immediate>). */
  immediate?: boolean
  delay?: number
  id?: string
}

/**
 * A headline split into lines, each rising out of an overflow mask. The
 * accessible name is the whole sentence; the masks are presentational.
 */
export function SplitLines({
  lines,
  as: Tag = 'h2',
  className = '',
  lineClassName = '',
  show,
  immediate = false,
  delay = 0,
  id,
}: Props) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { enabled: show === undefined && !immediate })
  const shown = show ?? inView

  return (
    <Tag ref={ref} id={id} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="line-mask pb-[0.08em]" data-shown={immediate || shown} data-auto={immediate || undefined}>
          <span
            className={lineClassName}
            style={
              immediate
                ? { animationDelay: `${delay + i * STAGGER * 1.4}s` }
                : { transitionDelay: shown ? `${delay + i * STAGGER * 1.4}s` : '0s' }
            }
          >
            {line}
            {i < lines.length - 1 ? ' ' : null}
          </span>
        </span>
      ))}
    </Tag>
  )
}
