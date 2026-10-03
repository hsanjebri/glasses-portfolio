'use client'

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react'

import { Pill } from '@/components/ui/Pill'
import { brands } from '@/content/brands'
import { visit, whatsapp } from '@/content/copy'
import { getProduct } from '@/content/products'
import { isFrame } from '@/content/types'
import { decodeConfig, describe } from '@/lib/builder'
import { bookable, upcomingDays, type BookingDay } from '@/lib/booking'
import { prefersReducedMotion } from '@/lib/hooks'
import { whatsappLink } from '@/lib/whatsapp'

/** sent: emailed to the shop · whatsapp: not emailed, finish on WhatsApp · error: request failed */
type Status = 'idle' | 'sending' | 'sent' | 'whatsapp' | 'error'
type Field = 'day' | 'time' | 'name' | 'contact'
type Request = { name: string; contact: string; when: string; reason: string; note: string; attached: string }

const f = visit.form

/** A numbered step: its title, an optional control on the right, and its error. */
function Step({
  n,
  id,
  title,
  optional,
  error,
  aside,
  group,
  children,
}: {
  n: number
  id: string
  title: string
  optional?: boolean
  error?: string
  aside?: ReactNode
  /** radiogroup for a single choice; group for the fields. */
  group: 'radiogroup' | 'group'
  children: ReactNode
}) {
  return (
    <div role={group} aria-labelledby={`${id}-title`} aria-describedby={error ? `${id}-err` : undefined} className="border-t border-line py-7">
      <div className="mb-5 flex items-center justify-between gap-4">
        <p id={`${id}-title`} className="flex items-baseline gap-3">
          <span className="label-sm tnum text-ink-3">0{n}</span>
          <span className="font-display text-[22px] leading-none md:text-[24px]">{title}</span>
          {optional ? <span className="label-sm text-ink-3">{f.optional}</span> : null}
        </p>
        {aside}
      </div>
      {children}
      {error ? (
        <p id={`${id}-err`} className="label mt-4 text-accent-text">
          {error}
        </p>
      ) : null}
    </div>
  )
}

const chip =
  'inline-flex h-10 items-center justify-center rounded-full border border-line-strong px-4 text-[14px] text-ink transition-colors duration-300 ease-focus group-hover:border-ink-2 peer-checked:border-ink peer-checked:bg-ink peer-checked:text-ink-inv peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-text peer-disabled:border-line peer-disabled:text-ink-3 peer-disabled:line-through'

const input =
  'w-full border-0 border-b border-line-strong bg-transparent px-0 pb-3 pt-1 text-[16px] text-ink placeholder:text-ink-3 transition-[border-color,box-shadow] duration-300 ease-focus focus:border-ink focus:shadow-[0_1px_0_0_var(--ink)] focus:outline-none aria-[invalid=true]:border-accent-text'

/**
 * The booking form, laid out like an appointment book: a strip of the coming
 * days (closed ones shown as closed), the day's slots from the shop's hours,
 * what the visit is for, then who is coming. The chosen slot is spelled out
 * above the button.
 *
 * Posts to /api/booking, which emails the shop when email is configured.
 * When it is not — or the request fails — the form says so and offers the
 * same request as a pre-filled WhatsApp message, so a booking is never
 * silently lost. A build from the configurator (?build=) or a frame from a
 * product page (?product=) rides along and is attached.
 */
export function BookingForm() {
  const uid = useId()
  const strip = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  /** A build from the builder, or a frame from a product page, carried in the URL. */
  const [attached, setAttached] = useState<{ label: string; raw: string; summary: string } | null>(null)
  /** Worked out in the browser: the days depend on the visitor's today. */
  const [days, setDays] = useState<BookingDay[] | null>(null)
  const [day, setDay] = useState('')
  const [time, setTime] = useState('')
  const [reason, setReason] = useState('')
  const [request, setRequest] = useState<Request | null>(null)

  useEffect(() => {
    setDays(upcomingDays(new Date()))
    const params = new URLSearchParams(window.location.search)
    const raw = params.get('build')
    const product = getProduct(params.get('product') ?? '')
    if (raw) {
      setAttached({ label: visit.buildAttached, raw, summary: describe(decodeConfig(new URLSearchParams(raw))) })
    } else if (product) {
      const cw = isFrame(product) ? product.colourways.find((c) => c.id === params.get('cw')) : undefined
      const name = `${brands[product.brand].name} ${product.name}`
      const summary = cw ? `${name} — ${cw.name}` : name
      setAttached({ label: visit.productAttached, raw: summary, summary })
    }
  }, [])

  const chosen = days?.find((d) => d.iso === day)
  const slot = chosen?.slots.find((s) => s.time === time && !s.past)
  const when = chosen && slot ? f.when(chosen.long, slot.label) : ''

  const clear = (field: Field) => setErrors((e) => ({ ...e, [field]: undefined }))

  const pickDay = (iso: string) => {
    setDay(iso)
    clear('day')
    const next = days?.find((d) => d.iso === iso)
    if (!next?.slots.some((s) => s.time === time && !s.past)) setTime('')
  }

  const scrollDays = (dir: 1 | -1) => {
    const el = strip.current
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const value = (k: string) => String(data.get(k) ?? '').trim()

    const nextErrors: Partial<Record<Field, string>> = {}
    if (!chosen) nextErrors.day = f.pickDay
    if (!slot) nextErrors.time = f.pickTime
    if (!value('name')) nextErrors.name = f.required
    if (!value('contact')) nextErrors.contact = f.required
    setErrors(nextErrors)
    const first = (['day', 'time', 'name', 'contact'] as const).find((k) => nextErrors[k])
    if (first) {
      const target =
        first === 'day' || first === 'time'
          ? form.querySelector<HTMLInputElement>(`input[name="${first}"]:not(:disabled)`)
          : form.querySelector<HTMLInputElement>(`[name="${first}"]`)
      target?.focus()
      return
    }

    const req: Request = {
      name: value('name'),
      contact: value('contact'),
      when,
      reason,
      note: value('note'),
      attached: attached?.summary ?? '',
    }
    setRequest(req)
    setStatus('sending')
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...req, build: attached?.raw ?? '', website: value('website') }),
      })
      const json = (await res.json().catch(() => ({}))) as { delivered?: boolean }
      setStatus(!res.ok ? 'error' : json.delivered ? 'sent' : 'whatsapp')
    } catch {
      setStatus('error')
    }
  }

  const waHref = request ? whatsappLink(whatsapp.booking(request)) : ''

  if ((status === 'sent' || status === 'whatsapp') && request) {
    const sent = status === 'sent'
    return (
      <div className="flex h-full flex-col justify-center gap-8" role="status">
        <p className="label text-accent-text">{f.kicker}</p>
        <p className="max-w-[22ch] font-display text-[clamp(30px,3vw,42px)] leading-[1.06]">{sent ? f.success : f.lastStep}</p>
        <div className="border-y border-line py-5">
          <p className="font-display text-[24px] italic leading-tight">{request.when}</p>
          {request.reason ? <p className="label-sm mt-2 text-ink-2">{request.reason}</p> : null}
        </div>
        <Pill
          href={waHref}
          target="_blank"
          rel="noreferrer noopener"
          variant={sent ? 'ghost' : 'accent'}
          magnetic={false}
          className="self-start"
          cursorLabel="WhatsApp"
        >
          {sent ? f.whatsappAlso : f.whatsappSend}
        </Pill>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative flex flex-col" aria-describedby={`${uid}-blurb`}>
      <div className="flex flex-col gap-4 pb-8">
        <p className="label text-accent-text">{f.kicker}</p>
        <h3 className="font-display text-[clamp(38px,3.6vw,54px)] leading-[0.95]">{f.title}</h3>
        <p id={`${uid}-blurb`} className="max-w-[44ch] text-[15px] leading-[1.6] text-ink-2">
          {f.blurb}
        </p>
      </div>

      {attached ? (
        <div className="mb-8 flex items-start justify-between gap-4 rounded-[4px] border border-line-strong p-4">
          <div>
            <p className="label mb-2 text-accent-text">{attached.label}</p>
            <p className="text-[13px] leading-[1.6] text-ink-2">{attached.summary}</p>
          </div>
          <button type="button" onClick={() => setAttached(null)} className="label shrink-0 text-ink-3 underline-offset-4 hover:text-ink hover:underline">
            {visit.attachmentRemove}
          </button>
        </div>
      ) : null}

      {/* 01 — the day */}
      <Step
        n={1}
        id={`${uid}-day`}
        title={f.steps.day}
        group="radiogroup"
        error={errors.day}
        aside={
          <span className="flex gap-2">
            {([-1, 1] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => scrollDays(dir)}
                aria-label={dir < 0 ? f.earlier : f.later}
                className="grid size-9 place-items-center rounded-full border border-line-strong text-ink transition-colors hover:border-ink"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className={dir < 0 ? 'rotate-180' : ''}>
                  <path d="M2 6h8M6.5 2.5 10 6l-3.5 3.5" stroke="currentColor" strokeWidth="1.3" />
                </svg>
              </button>
            ))}
          </span>
        }
      >
        {/* Each chip's label is positioned, so its visually hidden radio stays inside this scroller. */}
        <div
          ref={strip}
          className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 py-1 [mask-image:linear-gradient(90deg,#000_88%,transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {days
            ? days.map((d) => {
                const disabled = !bookable(d)
                return (
                  <label key={d.iso} className={`group relative shrink-0 snap-start ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                    <input
                      type="radio"
                      name="day"
                      value={d.iso}
                      checked={day === d.iso}
                      disabled={disabled}
                      onChange={() => pickDay(d.iso)}
                      aria-label={disabled ? `${d.long} — ${d.open ? f.over : f.closed}` : d.long}
                      className="peer sr-only"
                    />
                    <span className="flex h-[92px] w-[66px] flex-col items-center justify-center gap-1.5 rounded-[4px] border border-line-strong text-ink transition-colors duration-300 ease-focus group-hover:border-ink-2 peer-checked:border-ink peer-checked:bg-ink peer-checked:text-ink-inv peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-text peer-disabled:border-line peer-disabled:text-ink-3">
                      <span className="label-sm">{d.today ? f.today : d.weekday}</span>
                      <span className="tnum font-display text-[30px] leading-none">{d.day}</span>
                      <span className="label-sm">{disabled ? (d.open ? f.over : f.closed) : d.month}</span>
                    </span>
                  </label>
                )
              })
            : // Until the browser knows today: the strip's shape, so nothing moves when it fills.
              Array.from({ length: 8 }, (_, i) => <span key={i} className="h-[92px] w-[66px] shrink-0 rounded-[4px] bg-white/[0.04]" />)}
        </div>
      </Step>

      {/* 02 — the time */}
      <Step n={2} id={`${uid}-time`} title={f.steps.time} group="radiogroup" error={errors.time}>
        {chosen ? (
          <div className="flex flex-col gap-4">
            {([
              [f.morning, false],
              [f.afternoon, true],
            ] as const).map(([label, afternoon]) => {
              const slots = chosen.slots.filter((s) => s.afternoon === afternoon)
              if (!slots.length) return null
              return (
                <div key={label} className="grid grid-cols-[84px_1fr] items-start gap-3 sm:grid-cols-[100px_1fr]">
                  <p className="label-sm pt-3.5 text-ink-3">{label}</p>
                  <div className="flex flex-wrap gap-2">
                    {slots.map((s) => (
                      <label key={s.time} className={`group relative ${s.past ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                        <input
                          type="radio"
                          name="time"
                          value={s.time}
                          checked={time === s.time}
                          disabled={s.past}
                          onChange={() => {
                            setTime(s.time)
                            clear('time')
                          }}
                          className="peer sr-only"
                        />
                        <span className={`${chip} tnum min-w-[78px]`}>{s.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-[14px] text-ink-3">{f.pickDayFirst}</p>
        )}
      </Step>

      {/* 03 — what for */}
      <Step n={3} id={`${uid}-reason`} title={f.steps.reason} optional group="radiogroup">
        <div className="flex flex-wrap gap-2">
          {f.reasons.map((r) => (
            <label key={r} className="group relative cursor-pointer">
              <input
                type="radio"
                name="reason"
                value={r}
                checked={reason === r}
                onChange={() => setReason(r)}
                // A second click on the chosen reason clears it: the step is optional.
                onClick={() => reason === r && setReason('')}
                className="peer sr-only"
              />
              <span className={chip}>{r}</span>
            </label>
          ))}
        </div>
      </Step>

      {/* 04 — who */}
      <Step n={4} id={`${uid}-you`} title={f.steps.you} group="group">
        <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
          {(
            [
              { name: 'name', ...f.name, autoComplete: 'name' },
              { name: 'contact', ...f.contact, autoComplete: 'tel' },
            ] as const
          ).map((field) => (
            <div key={field.name} className="flex flex-col gap-2">
              <label htmlFor={`${uid}-${field.name}`} className="label-sm text-ink-3">
                {field.label} <span aria-hidden="true">*</span>
              </label>
              <input
                id={`${uid}-${field.name}`}
                name={field.name}
                type="text"
                required
                autoComplete={field.autoComplete}
                placeholder={field.placeholder}
                onInput={() => clear(field.name)}
                aria-invalid={errors[field.name] ? true : undefined}
                aria-describedby={errors[field.name] ? `${uid}-${field.name}-err` : undefined}
                className={input}
              />
              {errors[field.name] ? (
                <p id={`${uid}-${field.name}-err`} className="label text-accent-text">
                  {errors[field.name]}
                </p>
              ) : null}
            </div>
          ))}
          <div className="flex flex-col gap-2 sm:col-span-2">
            <label htmlFor={`${uid}-note`} className="label-sm text-ink-3">
              {f.note.label} ({f.optional})
            </label>
            <textarea id={`${uid}-note`} name="note" rows={2} placeholder={f.note.placeholder} className={`${input} resize-none`} />
          </div>
        </div>
      </Step>

      {/* Honeypot: off-screen and out of the tab order; only bots fill it in. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${uid}-website`}>{f.honeypot}</label>
        <input id={`${uid}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {/* The chosen slot, spelled out, and the button */}
      <div className="flex flex-col gap-6 border-t border-line pt-7 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-h-[52px]">
          <p className={`font-display text-[24px] leading-tight md:text-[26px] ${when ? 'italic text-ink' : 'text-ink-3'}`}>{when || f.summaryEmpty}</p>
          {reason ? <p className="label-sm mt-2 text-ink-2">{reason}</p> : null}
        </div>
        <Pill type="submit" variant="accent" disabled={status === 'sending'} cursorLabel="Envoyer" className="shrink-0 self-start sm:self-auto">
          {status === 'sending' ? f.sending : f.submit}
        </Pill>
      </div>

      <div role="status" aria-live="polite" className="mt-4 flex flex-wrap items-center gap-4">
        {status === 'error' ? (
          <>
            <p className="label text-accent-text">{f.error}</p>
            {waHref ? (
              <a href={waHref} target="_blank" rel="noreferrer noopener" className="label border-b border-current pb-0.5 text-ink">
                {f.whatsappSend}
              </a>
            ) : null}
          </>
        ) : null}
      </div>
    </form>
  )
}
