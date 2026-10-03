import { frTime, site, type OpeningHours } from '@/content/site'

/** getDay() order. */
const DAY_NAMES: OpeningHours['dayOfWeek'][] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/** Appointments start on the hour from opening; the last one at least this long before closing. */
const LAST_BEFORE_CLOSE = 30
/** Today, nothing sooner than this from now. */
const LEAD_TIME = 60

export interface Slot {
  /** "15:30" */
  time: string
  /** "15 h 30" */
  label: string
  afternoon: boolean
  /** Today, and too soon to book. */
  past: boolean
}

export interface BookingDay {
  /** "2026-10-07", in local time. */
  iso: string
  /** "mar" */
  weekday: string
  day: number
  /** "oct." */
  month: string
  /** "Mardi 7 octobre" */
  long: string
  today: boolean
  /** Open that day at all. */
  open: boolean
  slots: Slot[]
}

const toMinutes = (t: string) => {
  const [h = 0, m = 0] = t.split(':').map(Number)
  return h * 60 + m
}
const toTime = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function slotsFor(hours: OpeningHours | undefined, today: boolean, now: Date): Slot[] {
  if (!hours?.opens || !hours.closes) return []
  const soonest = now.getHours() * 60 + now.getMinutes() + LEAD_TIME
  const slots: Slot[] = []
  for (let m = toMinutes(hours.opens); m <= toMinutes(hours.closes) - LAST_BEFORE_CLOSE; m += 60) {
    const time = toTime(m)
    slots.push({ time, label: frTime(time), afternoon: m >= 12 * 60, past: today && m < soonest })
  }
  return slots
}

/** The next `count` days from `now`, with the shop's hours and bookable slots for each. */
export function upcomingDays(now: Date, count = 14): BookingDay[] {
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, 12)
    const hours = site.hours.find((h) => h.dayOfWeek === DAY_NAMES[date.getDay()])
    const today = i === 0
    return {
      iso: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
      weekday: date.toLocaleDateString(site.locale, { weekday: 'short' }).replace('.', ''),
      day: date.getDate(),
      month: date.toLocaleDateString(site.locale, { month: 'short' }),
      long: capitalise(date.toLocaleDateString(site.locale, { weekday: 'long', day: 'numeric', month: 'long' })),
      today,
      open: Boolean(hours?.opens && hours.closes),
      slots: slotsFor(hours, today, now),
    }
  })
}

/** A day can be picked when it has at least one slot still ahead. */
export const bookable = (d: BookingDay) => d.slots.some((s) => !s.past)
