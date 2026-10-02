import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

import { Magnetic } from '@/components/motion/Magnetic'

type Variant = 'solid' | 'ghost' | 'accent' | 'paper'

const variants: Record<Variant, string> = {
  solid: 'bg-ink text-ink-inv',
  ghost: 'border border-line-strong text-ink hover:border-ink',
  accent: 'bg-accent text-[#0a0a0a]',
  paper: 'bg-paper text-ink',
}

const arrowVariants: Record<Variant, string> = {
  solid: 'bg-ink-inv text-ink',
  ghost: 'bg-ink text-ink-inv',
  accent: 'bg-[#0a0a0a] text-accent',
  paper: 'bg-ink text-ink-inv',
}

type Common = {
  children: ReactNode
  variant?: Variant
  /** The rotating arrow circle. Off for compact pills. */
  arrow?: boolean
  magnetic?: boolean
  className?: string
  cursorLabel?: string
}

type AsLink = Common & { href: string } & Omit<ComponentProps<typeof Link>, 'href' | 'className' | 'children'>
type AsButton = Common & { href?: undefined } & Omit<ComponentProps<'button'>, 'className' | 'children'>

/**
 * The pill button. The arrow circle turns 45° on hover; the whole pill is
 * magnetic on fine pointers. Renders a Link with `href`, a button without.
 */
export function Pill(props: AsLink | AsButton) {
  const { children, variant = 'solid', arrow = true, magnetic = true, className = '', cursorLabel, ...rest } = props

  const body = (
    <>
      <span className="relative">{children}</span>
      {arrow ? (
        <span
          aria-hidden="true"
          className={`grid size-8 shrink-0 place-items-center rounded-full transition-transform duration-500 ease-focus group-hover:rotate-45 group-focus-visible:rotate-45 ${arrowVariants[variant]}`}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 9.5 9.5 2.5M4 2.5h5.5V8" stroke="currentColor" strokeWidth="1.3" />
          </svg>
        </span>
      ) : null}
    </>
  )

  const cls = `group inline-flex min-h-12 items-center gap-3 rounded-full text-[14px] font-medium tracking-[-0.005em] transition-[background-color,border-color,color,opacity] duration-300 ease-focus disabled:cursor-not-allowed disabled:opacity-40 ${
    arrow ? 'py-2 pl-6 pr-2' : 'px-6 py-3'
  } ${variants[variant]} ${className}`

  const el =
    rest.href !== undefined ? (
      <Link {...(rest as Omit<AsLink, keyof Common>)} className={cls} data-cursor-label={cursorLabel}>
        {body}
      </Link>
    ) : (
      <button
        type="button"
        {...(rest as Omit<AsButton, keyof Common>)}
        className={cls}
        data-cursor-label={cursorLabel}
      >
        {body}
      </button>
    )

  return magnetic ? <Magnetic>{el}</Magnetic> : el
}
