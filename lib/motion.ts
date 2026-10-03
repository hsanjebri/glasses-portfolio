/**
 * Motion constants. Every animation on the site reads its easing and duration
 * from here, so the whole page can be re-timed from one file.
 */

/** The only easing curve used on the site. */
export const EASE = [0.2, 0.7, 0.1, 1] as const

export const DUR = {
  /** Lens aperture open/close on route change. */
  aperture: 0.75,
  /** Theme crossfade into and out of SUN MODE. */
  theme: 0.8,
} as const

/** Seconds between successive items in a staggered focus reveal. */
export const STAGGER = 0.09

/** The blur the <Focus> primitive starts from, in px. */
export const FOCUS_BLUR = 14

/**
 * ───────────────────────────────────────────────────────────────────────────
 * REVEAL_AT — the second of the hero clip at which the copy starts arriving.
 * In /public/video/hero-*.mp4 the frame is sharp at ~2.5 s and the focus
 * starts pulling through the lenses onto the chart at ~3.6 s; the copy's own
 * blur-to-sharp reveal (1.1 s) runs in step with that focus pull.
 *
 * To change it: edit this number. Nothing else needs touching. If the clip is
 * shorter than this value the hero still reveals, because `ended`, `error`, a
 * rejected play() and a 9 s timeout each trigger the same reveal.
 * ───────────────────────────────────────────────────────────────────────────
 */
export const REVEAL_AT = 3.6

/** Hard ceiling on the hero wait, however the video behaves. */
export const REVEAL_TIMEOUT_MS = 9000

/** Preloader ceiling. Never hold the page longer than this. */
export const PRELOADER_MAX_MS = 2500

/** Session key — the preloader is skipped on repeat visits in one session. */
export const PRELOADER_SEEN_KEY = 'regard:preloaded'

/** Lens cursor geometry. */
export const CURSOR = {
  size: 90,
  dot: 12,
  magnify: 1.6,
  /** Lerp factor per frame — lower trails further behind the pointer. */
  ease: 0.14,
} as const
