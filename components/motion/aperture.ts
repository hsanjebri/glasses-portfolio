/**
 * The lens aperture: a full-viewport rectangle with a circular hole, drawn as
 * an even-odd clip-path. At r = 0 the panel covers everything; at r = cover it
 * is entirely open. Shared by the route transition, the preloader and the
 * mobile menu.
 */
export function aperturePath(w: number, h: number, cx: number, cy: number, r: number): string {
  const rr = Math.max(0, r)
  return (
    `path(evenodd, 'M0 0H${w}V${h}H0Z` +
    `M${cx - rr} ${cy}a${rr} ${rr} 0 1 0 ${rr * 2} 0a${rr} ${rr} 0 1 0 ${-rr * 2} 0Z')`
  )
}

/** Radius that clears every corner of the viewport from (cx, cy). */
export function coverRadius(w: number, h: number, cx: number, cy: number): number {
  return Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy)) + 2
}

/** cubic-bezier(.2,.7,.1,1), solved numerically for JS-driven tweens. */
export function easeFocus(t: number): number {
  const x1 = 0.2
  const y1 = 0.7
  const x2 = 0.1
  const y2 = 1
  // Newton–Raphson on x(s) = t, then return y(s).
  let s = t
  for (let i = 0; i < 6; i++) {
    const x = 3 * (1 - s) ** 2 * s * x1 + 3 * (1 - s) * s ** 2 * x2 + s ** 3 - t
    const dx = 3 * (1 - s) ** 2 * x1 + 6 * (1 - s) * s * (x2 - x1) + 3 * s ** 2 * (1 - x2)
    if (Math.abs(dx) < 1e-6) break
    s = Math.min(1, Math.max(0, s - x / dx))
  }
  return 3 * (1 - s) ** 2 * s * y1 + 3 * (1 - s) * s ** 2 * y2 + s ** 3
}

/** Tween a radius with rAF, writing the clip-path each frame. */
export function tweenAperture(
  el: HTMLElement,
  from: number,
  to: number,
  duration: number,
  origin: { x: number; y: number },
): Promise<void> {
  return new Promise((resolve) => {
    const w = window.innerWidth
    const h = window.innerHeight
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000))
      const r = from + (to - from) * easeFocus(t)
      el.style.clipPath = aperturePath(w, h, origin.x, origin.y, r)
      if (t < 1) requestAnimationFrame(step)
      else resolve()
    }
    requestAnimationFrame(step)
  })
}
