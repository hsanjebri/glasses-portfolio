import type { ReactNode } from 'react'

import { Focus } from '@/components/motion/Focus'
import { SplitLines } from '@/components/motion/SplitLines'

type Props = {
  label: string
  title: ReactNode[]
  blurb?: string
  id?: string
  /** Light text for dark panels. */
  onPanel?: boolean
  className?: string
  align?: 'start' | 'center'
}

/** Mono eyebrow, a masked serif headline and an optional one-line blurb. */
export function SectionHead({ label, title, blurb, id, onPanel = false, className = '', align = 'start' }: Props) {
  const center = align === 'center'
  return (
    <div className={`flex flex-col gap-5 ${center ? 'items-center text-center' : ''} ${className}`}>
      <Focus>
        <p className={`label flex items-center gap-3 ${onPanel ? 'text-on-panel-3' : 'text-ink-3'}`}>
          <span aria-hidden="true" className="inline-block h-px w-6 bg-current" />
          {label}
        </p>
      </Focus>
      <SplitLines
        id={id}
        lines={title}
        className={`max-w-[18ch] font-display text-[clamp(40px,6vw,92px)] leading-[0.96] tracking-[-0.02em] ${onPanel ? 'text-on-panel' : 'text-ink'}`}
      />
      {blurb ? (
        <Focus index={2}>
          <p className={`max-w-[46ch] text-[15px] leading-[1.65] md:text-[16px] ${onPanel ? 'text-on-panel-2' : 'text-ink-2'}`}>{blurb}</p>
        </Focus>
      ) : null}
    </div>
  )
}
