import type { Plate, Pt } from '@/content/plates'

const f = (v: number) => +v.toFixed(2)

/** A closed outline through the points, smoothed into curves (Catmull–Rom as cubic Béziers). */
export function smoothPath(pts: readonly Pt[]): string {
  const n = pts.length
  let d = `M${pts[0]![0]} ${pts[0]![1]}`
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n]!
    const p1 = pts[i]!
    const p2 = pts[(i + 1) % n]!
    const p3 = pts[(i + 2) % n]!
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${p2[0]} ${p2[1]}`
  }
  return d + 'Z'
}

/** The frame front's centre and size, as fractions of the photo — what the shot is framed on. */
export function frontBounds(plate: Plate): { cx: number; cy: number; w: number; h: number } {
  const pts = [...plate.rims[0], ...plate.rims[1]]
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  const x0 = Math.min(...xs)
  const x1 = Math.max(...xs)
  const y0 = Math.min(...ys)
  const y1 = Math.max(...ys)
  return { cx: (x0 + x1) / 200, cy: (y0 + y1) / 200, w: (x1 - x0) / 100, h: (y1 - y0) / 100 }
}

const masks = new Map<Plate, string>()

/**
 * A CSS mask over the frame — rims, bridge, endpieces, temples — with the
 * lenses cut out and every edge softened, to be stretched over the photo.
 */
export function frameMask(plate: Plate): string {
  const cached = masks.get(plate)
  if (cached) return cached
  const frame = [...plate.rims, ...plate.parts].map(smoothPath).join('')
  const lenses = plate.lenses.map(smoothPath).join('')
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'>` +
    `<defs><filter id='s' x='-5%' y='-5%' width='110%' height='110%'><feGaussianBlur stdDeviation='.25'/></filter>` +
    `<mask id='m' maskUnits='userSpaceOnUse' x='0' y='0' width='100' height='100'>` +
    `<rect width='100' height='100' fill='white'/><path d='${lenses}' fill='black' filter='url(#s)'/></mask></defs>` +
    `<g mask='url(#m)'><path d='${frame}' filter='url(#s)'/></g></svg>`
  const url = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
  masks.set(plate, url)
  return url
}
