'use client'

import { Suspense, useEffect } from 'react'

import { Focus } from '@/components/motion/Focus'
import { SplitLines } from '@/components/motion/SplitLines'
import { builder as copy } from '@/content/copy'
import { useBuilder } from '@/lib/builder-store'

import { Preview } from './Preview'
import { Steps } from './Steps'
import { SummaryBar } from './SummaryBar'

/**
 * The builder. Desktop: a sticky live preview on the left, five steps on the
 * right. Under 900px the preview pins to the top third of the screen and the
 * steps scroll beneath it; the summary becomes a bottom sheet.
 */
export function Builder() {
  const hydrate = useBuilder((s) => s.hydrate)
  const ready = useBuilder((s) => s.ready)
  const reset = useBuilder((s) => s.reset)

  useEffect(() => hydrate(), [hydrate])

  return (
    <div className="shell pb-48 pt-20 min-[900px]:pt-28">
      <div className="grid gap-6 min-[900px]:grid-cols-[1.15fr_1fr] min-[900px]:gap-14">
        <div className="sticky top-16 z-[5] -mx-[var(--gutter)] h-[36svh] bg-bg px-[var(--gutter)] pb-3 pt-2 min-[900px]:top-24 min-[900px]:mx-0 min-[900px]:h-[calc(100svh-14rem)] min-[900px]:bg-transparent min-[900px]:p-0">
          <div className="h-full transition-opacity duration-700 ease-focus" style={{ opacity: ready ? 1 : 0 }}>
            <Preview />
          </div>
        </div>

        <div>
          <header className="mb-6 flex items-end justify-between gap-6 min-[900px]:mb-10">
            <div className="flex flex-col gap-3">
              <SplitLines as="h1" immediate lines={[copy.title]} className="font-display text-[clamp(56px,7vw,104px)] leading-[0.9] tracking-[-0.02em]" />
              <Focus immediate index={1}>
                <p className="text-[15px] text-ink-2">{copy.blurb}</p>
              </Focus>
            </div>
            <button type="button" onClick={reset} className="label shrink-0 border-b border-line-strong pb-1 text-ink-2 transition-colors hover:border-ink hover:text-ink">
              {copy.reset}
            </button>
          </header>
          <Suspense>
            <Steps />
          </Suspense>
        </div>
      </div>

      <SummaryBar />
    </div>
  )
}
