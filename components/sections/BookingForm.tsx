'use client'

import { useEffect, useId, useState, type FormEvent } from 'react'

import { Pill } from '@/components/ui/Pill'
import { visit } from '@/content/copy'
import { brands } from '@/content/brands'
import { getProduct } from '@/content/products'
import { isFrame } from '@/content/types'
import { decodeConfig, describe } from '@/lib/builder'

type Status = 'idle' | 'sending' | 'success' | 'error'
type Field = 'name' | 'contact'

/**
 * The booking form. Posts JSON to the stub route handler. A build from the
 * builder (?build=) or a frame from a product page (?product=) rides along in
 * the URL and is attached to the request.
 */
export function BookingForm() {
  const f = visit.form
  const uid = useId()
  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  /** A build from the builder, or a frame from a product page, carried in the URL. */
  const [attached, setAttached] = useState<{ label: string; raw: string; summary: string } | null>(null)
  const [today, setToday] = useState('')

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

    setStatus('sending')
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: value('name'),
          contact: value('contact'),
          date: value('date'),
          note: value('note'),
          build: attached?.raw ?? '',
        }),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  const input =
    'w-full rounded-[14px] border border-line-strong bg-white/70 px-4 py-3.5 text-[15px] text-ink placeholder:text-ink-3 transition-colors duration-300 focus:border-ink focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text aria-[invalid=true]:border-accent-text'

  if (status === 'success') {
    return (
      <div className="flex h-full flex-col justify-center gap-6" role="status">
        <p className="label text-accent-text">{f.title}</p>
        <p className="max-w-[22ch] font-display text-[40px] leading-[1.05]">{f.success}</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6" aria-describedby={`${uid}-blurb`}>
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
      </div>
    </form>
  )
}
