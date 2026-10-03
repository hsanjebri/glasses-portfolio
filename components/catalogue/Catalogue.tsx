'use client'

import { AnimatePresence, motion } from 'motion/react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { SunMode } from '@/components/motion/ThemeProvider'
import { SplitLines } from '@/components/motion/SplitLines'
import { Focus } from '@/components/motion/Focus'
import { useLenis } from '@/components/motion/SmoothScroll'
import { catalogue } from '@/content/copy'
import { products } from '@/content/products'
import { SORT_KEYS, type CatalogueQuery, type SortKey } from '@/content/types'
import { applyQuery, cleared, parseQuery, toParams } from '@/lib/catalogue'
import { useReducedMotion } from '@/lib/hooks'
import { EASE } from '@/lib/motion'

import { Filters } from './Filters'
import { ProductCard } from './ProductCard'

const f = catalogue.filters

/**
 * The catalogue. All state is the URL: filters are read from the search
 * params and written back with the History API, so every view is a link and
 * the browser's back button walks through category changes.
 */
export function Catalogue() {
  const params = useSearchParams()
  const pathname = usePathname()
  const reduced = useReducedMotion()
  const query = useMemo(() => parseQuery(new URLSearchParams(params.toString())), [params])
  const results = useMemo(() => applyQuery(products, query), [query])
  const [sheet, setSheet] = useState(false)

  const update = useCallback(
    (next: CatalogueQuery, push = false) => {
      const qs = toParams(next).toString()
      const url = qs ? `${pathname}?${qs}` : pathname
      if (push) window.history.pushState(null, '', url)
      else window.history.replaceState(null, '', url)
    },
    [pathname],
  )

  const t = reduced ? { duration: 0 } : { duration: 0.7, ease: EASE }

  return (
    <div className="shell pb-28 pt-28 md:pt-36">
      <SunMode active={query.category === 'sun'} />

      <header className="mb-10 flex flex-col gap-5 md:mb-14">
        <Focus immediate>
          <p className="label flex items-center gap-3 text-ink-3">
            <span aria-hidden="true" className="inline-block h-px w-6 bg-current" />
            {catalogue.blurb}
          </p>
        </Focus>
        <SplitLines as="h1" immediate lines={[catalogue.title]} className="font-display text-[clamp(56px,9vw,140px)] leading-[0.9] tracking-[-0.025em]" />
      </header>

      <nav aria-label={f.categoryLabel} className="-mx-[var(--gutter)] mb-8 overflow-x-auto px-[var(--gutter)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="flex w-max gap-1 border-b border-line">
          {catalogue.tabs.map((tab) => {
            const on = query.category === tab.id
            return (
              <li key={tab.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => update({ ...query, category: tab.id as CatalogueQuery['category'] }, true)}
                  className="label relative px-4 py-4 text-ink-3 transition-colors duration-300 hover:text-ink aria-pressed:text-ink"
                >
                  {tab.label}
                  {on ? (
                    <motion.span layoutId="tab-rule" transition={t} className="absolute inset-x-2 bottom-[-1px] h-px bg-ink" />
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="grid gap-10 min-[900px]:grid-cols-[240px_1fr] min-[900px]:gap-14">
        <aside aria-label={f.title} className="hidden min-[900px]:block">
          <div className="sticky top-28">
            <Filters query={query} onChange={(q) => update(q)} />
          </div>
        </aside>

        <section aria-label={catalogue.title}>
          <div className="mb-6 flex items-center justify-between gap-4">
            <p className="label tnum whitespace-nowrap text-ink-2" aria-live="polite">
              {f.count(results.length)}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSheet(true)}
                aria-haspopup="dialog"
                className="label inline-flex min-h-10 items-center rounded-full border border-line-strong px-4 text-ink min-[900px]:hidden"
              >
                {f.open}
              </button>
              <label className="label flex items-center gap-2 text-ink-3">
                <span className="sr-only min-[900px]:not-sr-only">{f.sort}</span>
                <select
                  value={query.sort}
                  onChange={(e) => update({ ...query, sort: e.target.value as SortKey })}
                  className="label min-h-10 max-w-[44vw] cursor-pointer appearance-none truncate rounded-full border border-line-strong bg-bg px-4 text-ink"
                >
                  {SORT_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {catalogue.sortLabels[k]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {results.length ? (
            <motion.ul layout={!reduced} className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-4 sm:gap-y-12 xl:grid-cols-3">
              <AnimatePresence mode="popLayout" initial={false}>
                {results.map((p) => (
                  <motion.li
                    key={p.slug}
                    layout={!reduced}
                    initial={{ opacity: 0, filter: 'blur(14px)', scale: 1.02 }}
                    animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                    exit={{ opacity: 0, filter: 'blur(14px)', scale: 0.98 }}
                    transition={t}
                  >
                    <Suspense>
                      <ProductCard product={p} headingLevel="h2" />
                    </Suspense>
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          ) : (
            <div className="flex flex-col items-start gap-4 rounded-[4px] border border-line p-10">
              <p className="font-display text-[32px] leading-tight">{f.empty}</p>
              <button
                type="button"
                onClick={() => update(cleared(query))}
                className="label border-b border-line-strong pb-1 text-ink"
              >
                {f.emptyAction}
              </button>
            </div>
          )}
        </section>
      </div>

      <FilterSheet open={sheet} onClose={() => setSheet(false)} count={results.length}>
        <Filters query={query} onChange={(q) => update(q)} />
      </FilterSheet>
    </div>
  )
}

/** Mobile filters: a bottom sheet with focus kept inside while open. */
function FilterSheet({ open, onClose, count, children }: { open: boolean; onClose: () => void; count: number; children: React.ReactNode }) {
  const panel = useRef<HTMLDivElement>(null)
  const lenis = useLenis()

  useEffect(() => {
    if (!open) return
    lenis?.stop()
    const el = panel.current
    el?.querySelector<HTMLElement>('button, input')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab' && el) {
        const items = Array.from(el.querySelectorAll<HTMLElement>('button, input, select'))
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      lenis?.start()
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose, lenis])

  return (
    <div className="min-[900px]:hidden" inert={!open}>
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 z-[130] bg-black/60 transition-opacity duration-500 ease-focus"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={f.title}
        className="fixed inset-x-0 bottom-0 z-[131] flex max-h-[86svh] flex-col rounded-t-[16px] border-t border-line bg-paper shadow-card"
        style={{ transform: open ? 'none' : 'translateY(104%)', transition: 'transform .7s var(--ease)' }}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <p className="label text-ink">{f.title}</p>
          <button type="button" onClick={onClose} className="label min-h-10 rounded-full bg-ink px-5 text-ink-inv">
            {f.close} · {count}
          </button>
        </div>
        <div className="overflow-y-auto overscroll-contain px-5 py-6" data-lenis-prevent>
          {children}
        </div>
      </div>
    </div>
  )
}
