import { NextResponse } from 'next/server'

/**
 * Stub booking endpoint. Validates the request and acknowledges it; nothing is
 * stored or sent. Wire this to email, a calendar or a CRM before launch.
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
  const booking = {
    name: text('name', 120),
    contact: text('contact', 160),
    date: text('date', 20),
    note: text('note', 1000),
    build: text('build', 600),
  }

  const missing = (['name', 'contact'] as const).filter((k) => !booking[k])
  if (missing.length) {
    return NextResponse.json({ ok: false, error: 'Missing fields', fields: missing }, { status: 422 })
  }

  return NextResponse.json({ ok: true, received: booking }, { status: 201 })
}
