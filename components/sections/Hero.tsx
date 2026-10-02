'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Focus } from '@/components/motion/Focus'
import { SplitLines } from '@/components/motion/SplitLines'
import { BrandWord } from '@/components/ui/BrandWord'
import { Pill } from '@/components/ui/Pill'
import { hero } from '@/content/copy'
import { site } from '@/content/site'
import { prefersReducedMotion } from '@/lib/hooks'
import { REVEAL_AT, REVEAL_TIMEOUT_MS } from '@/lib/motion'
import { useUi } from '@/lib/ui-store'

/** Where the two stat thumbnails are cut from the clip's last frame: x, y, w, h as fractions. */
const CROPS: [number, number, number, number][] = [
  [0.28, 0.18, 0.18, 0.32],
  [0.72, 0.17, 0.2, 0.355],
]

const fmt = (s: number) => {
  const t = Number.isFinite(s) ? Math.max(0, Math.floor(s)) : 0
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
}

/**
 * The hero. Real footage: a frame on an optician's chart, the focus pulling
 * through the lenses until the rings behind sharpen. The brand word sits above
 * the clip in darken blend — the metal rim is darker than the word and passes
 * in front of it; through the lenses the light chart loses and the word
 * shows. Nothing typographic moves until the clip reaches REVEAL_AT.
 */
export function Hero() {
  const preloaded = useUi((s) => s.preloaded)
  const setHeroRevealed = useUi((s) => s.setHeroRevealed)
  const section = useRef<HTMLElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const thumbs = useRef<(HTMLCanvasElement | null)[]>([])
  const fill = useRef<HTMLSpanElement>(null)
  const time = useRef<HTMLSpanElement>(null)
  const [revealed, setRevealed] = useState(false)
  const [run, setRun] = useState(0)

  const reveal = useCallback(() => {
    setRevealed(true)
    setHeroRevealed(true)
  }, [setHeroRevealed])

  /** Crop two details of the settled frame into the stat thumbnails. */
  const captureThumbs = useCallback(() => {
    const v = video.current
    if (!v?.videoWidth) return
    CROPS.forEach(([x, y, w, h], i) => {
      const c = thumbs.current[i]
      const ctx = c?.getContext('2d')
      if (!c || !ctx) return
      try {
        ctx.drawImage(v, x * v.videoWidth, y * v.videoHeight, w * v.videoWidth, h * v.videoHeight, 0, 0, c.width, c.height)
      } catch {
        // Decode not ready: the thumbnail keeps its placeholder tone.
      }
    })
  }, [])

  /** Match the stage to the footage by sampling its top-left pixel. */
  const sampleBackdrop = useCallback(() => {
    const v = video.current
    const s = section.current
    if (!v || !s) return
    try {
      const c = document.createElement('canvas')
      c.width = 1
      c.height = 1
      const ctx = c.getContext('2d', { willReadFrequently: true })
      if (!ctx) return
      // Top-left corner, a few pixels in from the edge.
      ctx.drawImage(v, v.videoWidth * 0.03, v.videoHeight * 0.05, 1, 1, 0, 0, 1, 1)
      const [r = 0, g = 0, b = 0, a = 0] = ctx.getImageData(0, 0, 1, 1).data
      // A frame that has not decoded yet reads as transparent black: keep the tokens.
      if (a === 0 || r + g + b < 120) return
      const k = 0.955
      s.style.setProperty('--hero-bg', `rgb(${r} ${g} ${b})`)
      s.style.setProperty('--ghost', `rgb(${Math.round(r * k)} ${Math.round(g * k)} ${Math.round(b * k)})`)
    } catch {
      // Tainted canvas or decode failure: the CSS tokens stay in place.
    }
  }, [])

  // The clip can decode before hydration, so check readyState too.
  useEffect(() => {
    const v = video.current
    if (!v) return
    if (v.readyState >= 2) sampleBackdrop()
    v.addEventListener('loadeddata', sampleBackdrop, { once: true })
    // Sampled again once frames are really painting, in case the first read was empty.
    v.addEventListener('playing', sampleBackdrop, { once: true })
    return () => {
      v.removeEventListener('loadeddata', sampleBackdrop)
      v.removeEventListener('playing', sampleBackdrop)
    }
  }, [sampleBackdrop])

  // Play once the preloader has opened, and reveal on the beat.
  useEffect(() => {
    if (!preloaded) return
    const v = video.current
    if (!v) return reveal()
    const reduced = prefersReducedMotion()
    let raf = 0

    const paint = () => {
      const p = v.duration ? v.currentTime / v.duration : 0
      if (fill.current) fill.current.style.transform = `scaleX(${p})`
      if (time.current) time.current.textContent = `${fmt(v.currentTime)} / ${fmt(v.duration)}`
    }
    const loop = () => {
      paint()
      if (!v.paused && !v.ended) raf = requestAnimationFrame(loop)
    }
    const onPlay = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(loop)
    }
    const onTime = () => {
      if (v.currentTime >= REVEAL_AT) reveal()
    }
    const onEnded = () => {
      paint()
      captureThumbs()
      reveal()
    }

    const timeout = window.setTimeout(reveal, REVEAL_TIMEOUT_MS)
    v.addEventListener('play', onPlay)
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('ended', onEnded)
    v.addEventListener('error', reveal)
    v.addEventListener('seeked', paint)

    if (reduced) {
      // No playback: hold the last frame and show everything at once.
      const toEnd = () => {
        v.currentTime = Math.max(0, v.duration - 0.05)
        v.addEventListener('seeked', onEnded, { once: true })
      }
      if (v.readyState >= 1) toEnd()
      else v.addEventListener('loadedmetadata', toEnd, { once: true })
    } else {
      v.currentTime = 0
      v.play().catch(onEnded)
    }

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(timeout)
      v.removeEventListener('play', onPlay)
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('ended', onEnded)
      v.removeEventListener('error', reveal)
      v.removeEventListener('seeked', paint)
    }
  }, [preloaded, run, reveal, captureThumbs])

  const replay = () => {
    setRevealed(false)
    setRun((n) => n + 1)
  }

  return (
    <section
      ref={section}
      aria-labelledby="hero-title"
      className="relative isolate bg-bg"
      style={{ ['--hero-bg' as string]: '#e4e5e7', ['--ghost' as string]: '#dadbdd' }}
    >
      {/* ── Stage ── */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--hero-bg)] min-[900px]:aspect-auto min-[900px]:h-svh">
        <video
          ref={video}
          data-hero
          className="absolute inset-0 h-full w-full object-cover"
          muted
          playsInline
          preload="auto"
          poster="/video/hero-poster.jpg"
          aria-label={hero.videoAlt}
        >
          <source src="/video/hero-960.mp4" type="video/mp4" media="(max-width: 899px)" />
          <source src="/video/hero-1920.mp4" type="video/mp4" />
        </video>

        <p
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-[58%] -translate-y-1/2 select-none min-[900px]:top-[34%] text-center font-display leading-[0.8] tracking-[-0.03em] text-ghost mix-blend-darken"
          style={{
            fontSize: 'clamp(90px, 21vw, 360px)',
            maskImage: 'linear-gradient(to bottom, #000 0%, #000 64%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 64%, transparent 100%)',
          }}
        >
          <BrandWord />
        </p>
      </div>

      {/* Over the footage from 900px (dark type on the light clip); below it on phones. */}
      <div className="min-[900px]:on-light min-[900px]:absolute min-[900px]:inset-x-0 min-[900px]:bottom-0">
        <div className="shell pt-8 min-[900px]:pt-0">
          <div className="grid gap-8 min-[900px]:grid-cols-[1fr_auto] min-[900px]:items-end">
            <div className="max-w-[640px]">
              <Focus show={revealed} index={0}>
                <p className="label mb-6 text-ink-3">{hero.eyebrow}</p>
              </Focus>
              <SplitLines
                as="h1"
                id="hero-title"
                show={revealed}
                delay={0.1}
                lines={hero.headline.map((l, i) => (i === hero.headline.length - 1 ? <em key={i} className="display-italic">{l}</em> : l))}
                className="font-display text-[clamp(48px,5.6vw,92px)] leading-[0.95] tracking-[-0.02em] text-ink"
              />
              <Focus show={revealed} index={3}>
                <p className="mt-6 max-w-[48ch] text-[15px] leading-[1.65] text-ink-2 min-[900px]:text-[16px]">{hero.lede}</p>
              </Focus>
              <Focus show={revealed} index={4} className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Pill href={hero.cta.href} cursorLabel="RDV">
                  {hero.cta.label}
                </Pill>
                <Link href={hero.secondary.href} className="label border-b border-line-strong pb-1 text-ink transition-colors duration-300 hover:border-ink">
                  {hero.secondary.label}
                </Link>
              </Focus>
            </div>

            <div className="grid grid-cols-2 gap-3 min-[900px]:w-[300px] min-[900px]:grid-cols-1">
              {hero.stats.map((s, i) => (
                <Focus key={s.label} show={revealed} index={5 + i}>
                  <div className="on-dark flex items-center gap-3 rounded-[6px] border border-line bg-bg p-2.5 pr-4 shadow-card min-[900px]:gap-4 min-[900px]:p-3 min-[900px]:pr-5">
                    <canvas
                      ref={(el) => {
                        thumbs.current[i] = el
                      }}
                      width={160}
                      height={160}
                      aria-hidden="true"
                      className="size-11 shrink-0 rounded-[12px] bg-[#e4e5e7] min-[900px]:size-16"
                    />
                    <div>
                      <p className="font-display text-[30px] leading-none min-[900px]:text-[38px]">
                        {s.value}
                        <span className="label ml-1.5 text-ink-3">{s.unit}</span>
                      </p>
                      <p className="label-sm mt-2 text-ink-3">{s.label}</p>
                    </div>
                  </div>
                </Focus>
              ))}
            </div>
          </div>

          {/* Plate, coordinates, timecode and replay */}
          <Focus show={revealed} index={7}>
            <div className="mt-8 grid grid-cols-[1fr_auto] items-center gap-4 border-t border-line py-4 min-[900px]:grid-cols-[1fr_auto_1fr_auto]">
              <p className="label text-ink-2">{hero.strip.plate}</p>
              <p className="label hidden text-ink-3 min-[900px]:block">{site.coordinates}</p>
              <div className="hidden items-center gap-3 min-[900px]:flex min-[900px]:justify-self-end">
                <span aria-hidden="true" className="relative block h-px w-24 bg-line">
                  <span ref={fill} className="absolute inset-0 origin-left bg-ink" style={{ transform: 'scaleX(0)' }} />
                </span>
                <span ref={time} className="label tnum text-ink-3">
                  00:00 / 00:06
                </span>
              </div>
              <button
                type="button"
                onClick={replay}
                className="label inline-flex min-h-10 items-center gap-2 justify-self-end rounded-full border border-line px-4 text-ink transition-colors duration-300 hover:border-ink"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                  <path d="M2 1.2v7.6L8.5 5z" fill="currentColor" />
                </svg>
                {hero.strip.replay}
              </button>
            </div>
          </Focus>
        </div>
      </div>
    </section>
  )
}
