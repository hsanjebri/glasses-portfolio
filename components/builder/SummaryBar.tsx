'use client'

import { useEffect, useRef, useState } from 'react'

import { Pill } from '@/components/ui/Pill'
import { builder as copy, whatsapp } from '@/content/copy'
import { formatPrice, site } from '@/content/site'
import { encodeConfig, quote } from '@/lib/builder'
import { useBuilder } from '@/lib/builder-store'
import { prefersReducedMotion } from '@/lib/hooks'
import { whatsappLink } from '@/lib/whatsapp'

import { easeFocus } from '@/components/motion/aperture'

const lineAmount = (amount: number) => (amount === 0 ? copy.included : formatPrice(amount))

/** Counts from the previous total to the new one with the site easing. */
function useCountUp(target: number, duration = 700): number {
  const [value, setValue] = useState(target)
  const from = useRef(target)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setValue(target)
      from.current = target
      return
    }
    const start = performance.now()
    const a = from.current
    let raf = 0
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      setValue(Math.round(a + (target - a) * easeFocus(t)))
      if (t < 1) raf = requestAnimationFrame(step)
      else from.current = target
    }
    raf = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(raf)
      from.current = target
    }
  }, [target, duration])

  return value
}

/**
 * The sticky summary: itemised lines, a counting total, the WhatsApp order and
 * the booking hand-off. A bar on desktop, a bottom sheet on phones.
 */
export function SummaryBar() {
  const config = useBuilder((s) => s.config)
  const ready = useBuilder((s) => s.ready)
  const q = quote(config)
  const shown = useCountUp(q.total)
  const [open, setOpen] = useState(false)

  const qs = encodeConfig(config)
  const buildUrl = `${site.url}/composer?${qs}`
  const message = [
    whatsapp.intro,
    '',
    `${whatsapp.configLabel}\u00a0:`,
    ...q.lines.map((l) => `• ${l.label}${l.qty > 1 ? ` ×${l.qty}` : ''} — ${lineAmount(l.amount)}`),
    '',
    `${whatsapp.totalLabel}\u00a0: ${formatPrice(q.total)}`,
    `${whatsapp.linkLabel}\u00a0: ${buildUrl}`,
  ].join('\n')

  return (
    <div className="fixed inset-x-0 bottom-0 z-[110] px-3 pb-3 md:px-[var(--gutter)] md:pb-5" style={{ opacity: ready ? 1 : 0, transition: 'opacity .6s var(--ease)' }}>
      <div className="relative mx-auto max-w-[1312px] rounded-[6px] bg-panel text-on-panel shadow-card">
        {/* Lines: a panel above the bar, revealed with clip-path so nothing reflows */}
        <div
          id="summary-lines"
          inert={!open}
          className="absolute inset-x-0 bottom-full mb-2 overflow-hidden rounded-[6px] bg-panel shadow-card"
          style={{
            clipPath: open ? "inset(0 0 0 0 round 6px)" : "inset(100% 0 0 0 round 6px)",
            opacity: open ? 1 : 0,
            transition: 'clip-path .6s var(--ease), opacity .4s var(--ease)',
          }}
        >
          <div className="max-h-[46svh] overflow-y-auto px-5 py-5 md:px-8" data-lenis-prevent>
            <p className="label mb-4 text-on-panel-3">{copy.summary.title}</p>
            <ul className="flex flex-col gap-2">
              {q.lines.map((l) => (
                <li key={l.id} className="flex items-baseline justify-between gap-6 text-[14px]">
                  <span className="text-on-panel-2">
                    {l.label}
                    {l.qty > 1 ? <span className="text-on-panel-3"> ×{l.qty}</span> : null}
                  </span>
                  <span className="tnum shrink-0 text-on-panel">{lineAmount(l.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 md:flex-nowrap md:px-6 md:py-4">
          <button
            type="button"
            aria-expanded={open}
            aria-controls="summary-lines"
            onClick={() => setOpen((v) => !v)}
            className="label inline-flex min-h-10 items-center gap-2 text-on-panel-2 transition-colors hover:text-on-panel"
          >
            <span aria-hidden="true" className="inline-block transition-transform duration-500 ease-focus" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>
              ↑
            </span>
            {open ? copy.summary.collapse : copy.summary.expand}
          </button>

          <div className="ml-auto flex items-baseline gap-3 md:ml-0 md:mr-auto">
            <span className="label text-on-panel-3">{copy.summary.total}</span>
            <span className="tnum font-display text-[26px] leading-none md:text-[36px]" aria-hidden="true">
              {formatPrice(shown)}
            </span>
            <span className="sr-only" aria-live="polite">
              {copy.summary.totalAnnounce(formatPrice(q.total))}
            </span>
          </div>

          <div className="flex w-full flex-wrap gap-2 md:w-auto md:flex-nowrap">
            <Pill
              href={whatsappLink(message)}
              target="_blank"
              rel="noreferrer noopener"
              variant="accent"
              magnetic={false}
              className="min-h-11 flex-1 justify-between text-[13px] md:min-h-12 md:flex-none md:text-[14px]"
              cursorLabel="Commander"
              aria-label={copy.summary.whatsapp}
            >
              <span className="md:hidden">{copy.summary.whatsappShort}</span>
              <span className="hidden md:inline">{copy.summary.whatsapp}</span>
            </Pill>
            <Pill
              href={`/?build=${encodeURIComponent(qs)}#visite`}
              variant="paper"
              arrow={false}
              magnetic={false}
              className="min-h-11 flex-1 justify-center px-4 text-[13px] md:min-h-12 md:flex-none md:px-6 md:text-[14px]"
              cursorLabel="RDV"
            >
              <span className="md:hidden">{copy.summary.bookingShort}</span>
              <span className="hidden md:inline">{copy.summary.booking}</span>
            </Pill>
          </div>
        </div>
      </div>
    </div>
  )
}
