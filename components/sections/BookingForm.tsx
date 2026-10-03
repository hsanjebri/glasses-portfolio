'use client'

import { useEffect, useId, useState, type FormEvent } from 'react'

import { Pill } from '@/components/ui/Pill'
import { brands } from '@/content/brands'
import { visit, whatsapp } from '@/content/copy'
import { getProduct } from '@/content/products'
import { site } from '@/content/site'
import { isFrame } from '@/content/types'
import { decodeConfig, describe } from '@/lib/builder'
import { whatsappLink } from '@/lib/whatsapp'

/** sent: emailed to the shop · whatsapp: not emailed, finish on WhatsApp · error: request failed */
type Status = 'idle' | 'sending' | 'sent' | 'whatsapp' | 'error'
type Field = 'name' | 'contact'
type Request = { name: string; contact: string; date: string; note: string; attached: string }

const longDate = (iso: string) =>
  iso ? new Date(`${iso}T12:00:00`).toLocaleDateString(site.locale, { weekday: 'long', day: 'numeric', month: 'long' }) : ''

/**
 * The booking form. Posts to /api/booking, which emails the shop when email
 * is configured. When it is not — or the request fails — the form says so and
 * offers the same request as a pre-filled WhatsApp message, so a booking is
 * never silently lost. A build from the configurator (?build=) or a frame from
 * a product page (?product=) rides along and is attached.
 */
export function BookingForm() {
  const f = visit.form
  const uid = useId()
  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  /** A build from the builder, or a frame from a product page, carried in the URL. */
  const [attached, setAttached] = useState<{ label: string; raw: string; summary: string } | null>(null)
  const [today, setToday] = useState('')
  const [request, setRequest] = useState<Request | null>(null)

  useEffect(() => {
    setToday(new Date().toISOString().slice(0, 10))
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

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const value = (k: string) => String(data.get(k) ?? '').trim()

    const nextErrors: Partial<Record<Field, string>> = {}
    if (!value('name')) nextErrors.name = f.required
    if (!value('contact')) nextErrors.contact = f.required
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      e.currentTarget.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus()
      return
    }

    const req: Request = {
      name: value('name'),
      contact: value('contact'),
      date: value('date'),
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

  const waHref = request ? whatsappLink(whatsapp.booking({ ...request, date: longDate(request.date) })) : ''

  const input =
    'w-full rounded-[14px] border border-line-strong bg-white/70 px-4 py-3.5 text-[15px] text-ink placeholder:text-ink-3 transition-colors duration-300 focus:border-ink focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text aria-[invalid=true]:border-accent-text'

  if (status === 'sent' || status === 'whatsapp') {
    const sent = status === 'sent'
    return (
      <div className="flex h-full flex-col justify-center gap-6" role="status">
        <p className="label text-accent-text">{f.title}</p>
        <p className="max-w-[24ch] font-display text-[clamp(30px,3vw,40px)] leading-[1.08]">{sent ? f.success : f.lastStep}</p>
        <Pill
          href={waHref}
          target="_blank"
          rel="noreferrer noopener"
          variant={sent ? 'ghost' : 'solid'}
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
    <form onSubmit={onSubmit} noValidate className="relative flex flex-col gap-6" aria-describedby={`${uid}-blurb`}>
      <div className="flex flex-col gap-3">
        <h3 className="font-display text-[clamp(34px,3.4vw,48px)] leading-none">{f.title}</h3>
        <p id={`${uid}-blurb`} className="text-[15px] text-ink-2">
          {f.blurb}
        </p>
      </div>

      {attached ? (
        <div className="flex items-start justify-between gap-4 rounded-[14px] border border-line-strong p-4">
          <div>
            <p className="label mb-2 text-accent-text">{attached.label}</p>
            <p className="text-[13px] leading-[1.6] text-ink-2">{attached.summary}</p>
          </div>
          <button type="button" onClick={() => setAttached(null)} className="label shrink-0 text-ink-3 underline-offset-4 hover:text-ink hover:underline">
            {visit.attachmentRemove}
          </button>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        {(
          [
            { name: 'name', ...f.name, autoComplete: 'name', type: 'text' },
            { name: 'contact', ...f.contact, autoComplete: 'tel', type: 'text' },
          ] as const
        ).map((field) => (
          <div key={field.name} className="flex flex-col gap-2">
            <label htmlFor={`${uid}-${field.name}`} className="label text-ink-3">
              {field.label} <span aria-hidden="true">*</span>
            </label>
            <input
              id={`${uid}-${field.name}`}
              name={field.name}
              type={field.type}
              required
              autoComplete={field.autoComplete}
              placeholder={field.placeholder}
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
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${uid}-date`} className="label text-ink-3">
          {f.date.label}
        </label>
        <input id={`${uid}-date`} name="date" type="date" min={today || undefined} className={`${input} [color-scheme:light]`} />
      </div>

      {/* Honeypot: off-screen and out of the tab order; only bots fill it in. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${uid}-website`}>{f.honeypot}</label>
        <input id={`${uid}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${uid}-note`} className="label text-ink-3">
          {f.note.label}
        </label>
        <textarea id={`${uid}-note`} name="note" rows={3} placeholder={f.note.placeholder} className={`${input} resize-none`} />
      </div>

      <div className="flex flex-wrap items-center gap-5">
        <Pill type="submit" variant="solid" disabled={status === 'sending'} cursorLabel="Envoyer">
          {status === 'sending' ? f.sending : f.submit}
        </Pill>
        <p role="status" aria-live="polite" className="label text-accent-text">
          {status === 'error' ? f.error : ''}
        </p>
        {status === 'error' && waHref ? (
          <a href={waHref} target="_blank" rel="noreferrer noopener" className="label border-b border-current pb-0.5 text-ink">
            {f.whatsappSend}
          </a>
        ) : null}
      </div>
    </form>
  )
}
