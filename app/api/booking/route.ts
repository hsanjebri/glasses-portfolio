import { NextResponse } from 'next/server'

import { bookingEmail } from '@/content/copy'

/**
 * Booking requests. Validated here, then emailed to the shop through Resend
 * when RESEND_API_KEY and BOOKING_TO_EMAIL are set. Without them nothing is
 * sent, and the response says so (`delivered: false`) — the form then hands
 * the request to WhatsApp instead of pretending it arrived.
 */
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const b = (body ?? {}) as Record<string, unknown>
  const text = (k: string, max: number) => (typeof b[k] === 'string' ? (b[k] as string).trim().slice(0, max) : '')

  // Honeypot: people never see this field, bots fill it. Accept and drop.
  if (text('website', 200)) return NextResponse.json({ ok: true, delivered: false }, { status: 201 })

  const booking = {
    name: text('name', 120),
    contact: text('contact', 160),
    date: text('date', 40),
    attached: text('build', 600),
    note: text('note', 1000),
  }

  const missing = (['name', 'contact'] as const).filter((k) => !booking[k])
  if (missing.length) {
    return NextResponse.json({ ok: false, error: 'Missing fields', fields: missing }, { status: 422 })
  }

  const key = process.env.RESEND_API_KEY
  const to = process.env.BOOKING_TO_EMAIL
  if (!key || !to) return NextResponse.json({ ok: true, delivered: false }, { status: 201 })

  const lines = (Object.keys(bookingEmail.labels) as (keyof typeof bookingEmail.labels)[])
    .filter((k) => booking[k])
    .map((k) => `${bookingEmail.labels[k]} : ${booking[k]}`)

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.BOOKING_FROM_EMAIL ?? 'onboarding@resend.dev',
      to: [to],
      // Replies go straight to the visitor when they left an email address.
      ...(booking.contact.includes('@') ? { reply_to: booking.contact } : {}),
      subject: bookingEmail.subject(booking.name),
      text: [bookingEmail.intro, '', ...lines].join('\n'),
    }),
  }).catch(() => null)

  if (!res?.ok) return NextResponse.json({ ok: false, error: 'Delivery failed' }, { status: 502 })
  return NextResponse.json({ ok: true, delivered: true }, { status: 201 })
}
