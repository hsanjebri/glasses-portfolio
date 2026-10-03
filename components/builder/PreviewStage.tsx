'use client'

import { useEffect, useState, type CSSProperties } from 'react'

import { Photo } from '@/components/media/Photo'
import { builderColourways, shapeOptions, type Finish } from '@/content/builder'
import { photos, type PhotoKey } from '@/content/photos'
import { plates, type Plate } from '@/content/plates'
import type { BuilderConfig, CoatingId, FrameShape, LensType } from '@/content/types'
import { frameMask, frontBounds, smoothPath } from '@/lib/plate'
import { useSvgId } from '@/lib/svg-id'

/** How long a new layer stays over the old one before the old one goes (the keyframes run .6s). */
const SETTLE_MS = 700

/** A size change nudges the shot, so the choice is seen. Never below 1, so the photo's edges stay out of view. */
const SIZE_SCALE = { narrow: 1, medium: 1.05, wide: 1.1 } as const

/**
 * Keeps the previous value on screen while the new one fades in over it.
 * The newest layer is last; older ones are dropped once it has settled.
 */
function useLayers<K extends string>(key: K): { key: K; enter: boolean }[] {
  const [layers, setLayers] = useState([{ key, enter: false }])
  let current = layers
  if (layers[layers.length - 1]!.key !== key) {
    current = [...layers.filter((l) => l.key !== key).slice(-1), { key, enter: true }]
    setLayers(current)
  }
  useEffect(() => {
    if (layers.length < 2) return
    const t = window.setTimeout(() => setLayers((l) => l.slice(-1)), SETTLE_MS)
    return () => window.clearTimeout(t)
  }, [layers])
  return current
}

/* ── Recolouring the frame ── */

const LUMA = [0.2126, 0.7152, 0.0722] as const
/** Width of the luminance band over which a pixel goes from frame to background. */
const SOFT = 0.1
/** How much of the photo's shading the new material keeps: the floor its darkest pixels are lifted to. */
const LIFT: Record<Finish['kind'], number> = { tortoise: 0.6, solid: 0.6, crystal: 0.8, metal: 0.7 }

const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255] as const
}
const mix = (a: string, b: string, t: number) => {
  const [x, y] = [rgb(a), rgb(b)]
  return '#' + x.map((v, i) => Math.round((v + (y[i]! - v) * t) * 255).toString(16).padStart(2, '0')).join('')
}
const table = (stops: string[], channel: 0 | 1 | 2) => stops.map((s) => rgb(s)[channel].toFixed(3)).join(' ')

/** The new material, before the photo's light is put back on it. */
function Material({ finish }: { finish: Finish }) {
  if (finish.kind !== 'tortoise') {
    return <feFlood floodColor={finish.kind === 'crystal' ? finish.tint : finish.base} result="material" />
  }
  // Tortoiseshell: stretched noise, mapped through the acetate's own colours.
  const stops = [finish.mottle, finish.mottle, mix(finish.mottle, finish.base, 0.55), finish.base, finish.amber, finish.amber]
  return (
    <>
      <feTurbulence type="fractalNoise" baseFrequency="0.011 0.028" numOctaves={3} seed={11} result="noise" />
      <feColorMatrix in="noise" type="matrix" values="2.6 0 0 0 -0.8  2.6 0 0 0 -0.8  2.6 0 0 0 -0.8  0 0 0 0 1" result="grain" />
      <feComponentTransfer in="grain" result="material">
        <feFuncR type="table" tableValues={table(stops, 0)} />
        <feFuncG type="table" tableValues={table(stops, 1)} />
        <feFuncB type="table" tableValues={table(stops, 2)} />
      </feComponentTransfer>
    </>
  )
}

/**
 * Repaints the frame in the photo. Pixels darker than the plate's key are
 * frame: they take the new material, lit by the photo's own shading so the
 * curves and highlights survive. A light metal frame (no key) is toned
 * instead — its colour replaced, its brightness kept.
 */
function RecolourFilter({ id, finish, keyLum }: { id: string; finish: Finish; keyLum: number | null }) {
  if (keyLum === null) {
    return (
      <filter id={id} colorInterpolationFilters="sRGB">
        <feColorMatrix in="SourceGraphic" type="saturate" values="0" result="grey" />
        <feFlood floodColor={finish.kind === 'crystal' ? finish.tint : finish.base} result="paint" />
        <feBlend in="paint" in2="grey" mode="color" result="toned" />
        <feComposite in="toned" in2="SourceGraphic" operator="arithmetic" k1="0" k2="0.7" k3="0.3" k4="0" />
      </filter>
    )
  }
  const a = 1 / SOFT
  const lift = LIFT[finish.kind]
  const s = (1 - lift) / keyLum
  const keyRow = `${LUMA.map((l) => (-a * l).toFixed(3)).join(' ')} 0 ${(a * keyLum).toFixed(3)}`
  const shadeRow = `${LUMA.map((l) => (s * l).toFixed(3)).join(' ')} 0 ${lift}`
  return (
    <filter id={id} colorInterpolationFilters="sRGB">
      <feColorMatrix in="SourceGraphic" type="matrix" values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${keyRow}`} result="key" />
      <feColorMatrix in="SourceGraphic" type="matrix" values={`${shadeRow}  ${shadeRow}  ${shadeRow}  0 0 0 0 1`} result="shade" />
      <Material finish={finish} />
      <feBlend in="material" in2="shade" mode="multiply" result="lit" />
      <feComposite in="lit" in2="key" operator="in" result="frame" />
      {/* Crystal lets a little of what is behind it through. */}
      <feComponentTransfer in="frame" result="painted">
        <feFuncA type="linear" slope={finish.kind === 'crystal' ? 0.85 : 1} />
      </feComponentTransfer>
      <feMerge>
        <feMergeNode in="SourceGraphic" />
        <feMergeNode in="painted" />
      </feMerge>
    </filter>
  )
}

const masked = (mask: string): CSSProperties => ({ maskImage: mask, WebkitMaskImage: mask, maskSize: '100% 100%', WebkitMaskSize: '100% 100%' })

function Recolour({ photo, sizes, plate, colourway, enter }: { photo: PhotoKey; sizes: string; plate: Plate; colourway: string; enter: boolean }) {
  const id = useSvgId('recolour')
  const finish = (builderColourways.find((c) => c.id === colourway) ?? builderColourways[0]!).finish
  return (
    <div className={`absolute inset-0 ${enter ? 'animate-[fade-in_.55s_var(--ease)_both]' : ''}`} style={masked(frameMask(plate))}>
      <svg className="absolute size-0" focusable="false">
        <defs>
          <RecolourFilter id={id} finish={finish} keyLum={plate.key} />
        </defs>
      </svg>
      <Photo photo={photo} sizes={sizes} alt="" style={{ filter: `url(#${id})` }} />
    </div>
  )
}

/* ── Lenses ── */

type LensLook = {
  /** Multiplied over the lens: tints darken, clear glass leaves it alone. */
  tint: string
  tintOpacity: number
  /** Screened over the lens: brightens a photo whose lenses are already dark. */
  clear: number
  /** The diagonal reflections every lens has. */
  glare: number
  /** The faint green sheen of an anti-reflective coating. */
  sheen: number
}

function lensLook(lensType: LensType, coatings: CoatingId[], sunPhoto: boolean): LensLook {
  const has = (c: CoatingId) => coatings.includes(c)
  const ar = has('anti-reflective')
  const glare = (v: number) => (ar ? v * 0.5 : v)
  const sheen = ar ? (lensType === 'sun' ? 0.15 : 0.32) : 0
  if (lensType === 'sun') {
    return { tint: has('polarised') ? '#1f3d29' : '#262420', tintOpacity: sunPhoto ? 0.6 : 0.9, clear: 0, glare: glare(0.28), sheen }
  }
  const clear = sunPhoto ? 0.62 : 0
  if (has('photochromic')) return { tint: '#57544f', tintOpacity: 0.55, clear: clear * 0.5, glare: glare(0.32), sheen }
  if (has('blue-light')) return { tint: '#f1c987', tintOpacity: 0.45, clear, glare: glare(0.36), sheen }
  return { tint: '#ffffff', tintOpacity: 0, clear, glare: glare(0.38), sheen }
}

const layer = 'absolute inset-0 h-full w-full transition-opacity duration-500 ease-focus'

function Lenses({ plate, lensType, coatings }: { plate: Plate; lensType: LensType; coatings: CoatingId[] }) {
  const id = useSvgId('lens')
  const look = lensLook(lensType, coatings, Boolean(plate.sunLenses))
  const paths = plate.lenses.map(smoothPath)
  const lens = (fill: string, className = '') => paths.map((d) => <path key={d} d={d} className={className} style={{ fill }} />)
  return (
    <>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={layer} style={{ opacity: look.tintOpacity, mixBlendMode: 'multiply' }}>
        <defs>
          <filter id={`${id}-soft`} x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur stdDeviation="0.2" />
          </filter>
          <linearGradient id={`${id}-glare`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0.18" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.36" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="0.52" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.66" stopColor="#fff" stopOpacity="0.18" />
            <stop offset="0.74" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`${id}-sheen`} cx="0.7" cy="0.75" r="0.75">
            <stop offset="0.55" stopColor="#7be3a8" stopOpacity="0" />
            <stop offset="0.88" stopColor="#7be3a8" stopOpacity="0.7" />
            <stop offset="1" stopColor="#b48cff" stopOpacity="0.45" />
          </radialGradient>
        </defs>
        <g filter={`url(#${id}-soft)`}>{lens(look.tint, 'transition-[fill] duration-500 ease-focus')}</g>
      </svg>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={layer} style={{ opacity: look.clear, mixBlendMode: 'screen' }}>
        <g filter={`url(#${id}-soft)`}>{lens('#c9d2d4')}</g>
      </svg>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={layer} style={{ opacity: look.sheen, mixBlendMode: 'screen' }}>
        <g filter={`url(#${id}-soft)`}>{lens(`url(#${id}-sheen)`)}</g>
      </svg>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={layer} style={{ opacity: look.glare, mixBlendMode: 'screen' }}>
        <g filter={`url(#${id}-soft)`}>{lens(`url(#${id}-glare)`)}</g>
      </svg>
    </>
  )
}

/* ── The shot ── */

function Shot({ shape, config, enter }: { shape: FrameShape; config: BuilderConfig; enter: boolean }) {
  const plate = plates[shape]
  const photo = (shapeOptions.find((s) => s.id === shape) ?? shapeOptions[0]!).photo
  const { width, height } = photos[photo]
  const ar = width / height
  const { cx, cy, w, h } = frontBounds(plate)
  const colourLayers = useLayers(config.colourway)

  // The front fills about two thirds of the panel's width, or under half its
  // height, whichever is tighter, and sits just above the middle.
  const fit = `min(${(61 / w).toFixed(1)}cqw, ${((44 * ar) / h).toFixed(1)}cqh)`
  const sizes = `(max-width: 899px) ${Math.round(Math.min(160, 64 / w))}vw, ${Math.round(Math.min(100, 35 / w))}vw`
  // The photo dissolves into the panel well away from the frame, and its
  // light falls off towards that edge, as if the frame were lit on a set.
  // The dissolve always ends inside the photograph, so its edges never show.
  const at = `at ${(cx * 100).toFixed(1)}% ${(cy * 100).toFixed(1)}%`
  const rx = Math.min(w, cx, 1 - cx) * 100
  const ry = Math.min(h * 2.4, cy, 1 - cy) * 100
  const reach = `${rx.toFixed(1)}% ${ry.toFixed(1)}%`
  const feather = `radial-gradient(${reach} ${at}, #000 30%, rgba(0,0,0,.7) 62%, transparent 100%)`
  const falloff = `radial-gradient(${reach} ${at}, transparent 22%, rgba(10,10,10,.55) 70%, #0a0a0a 100%)`
  const style: CSSProperties = {
    width: fit,
    height: `calc(${fit} / ${ar.toFixed(4)})`,
    left: `calc(50cqw - ${fit} * ${cx.toFixed(4)})`,
    top: `calc(46cqh - ${fit} * ${(cy / ar).toFixed(4)})`,
    transform: `scale(${SIZE_SCALE[config.size]})`,
    transformOrigin: `${(cx * 100).toFixed(1)}% ${(cy * 100).toFixed(1)}%`,
    ...masked(feather),
    maskSize: '100% 100%',
  }

  return (
    <div className={`absolute inset-0 ${enter ? 'animate-[plate-in_.6s_var(--ease)_both]' : ''}`}>
      <div className="absolute brightness-[.88] saturate-[.92] transition-transform duration-700 ease-focus" style={style}>
        <Photo photo={photo} sizes={sizes} alt="" priority />
        {colourLayers.map((l) => (
          <Recolour key={l.key} photo={photo} sizes={sizes} plate={plate} colourway={l.key} enter={l.enter} />
        ))}
        <Lenses plate={plate} lensType={config.lensType} coatings={config.coatings} />
        <span className="absolute inset-0" style={{ background: falloff }} />
      </div>
    </div>
  )
}

/**
 * The configurator's main picture: a photograph of the chosen shape, with the
 * frame repainted in the chosen material and the lenses tinted to match the
 * chosen lenses. A new shape fades in over the last with a focus pull; a new
 * material over the old frame; lens tints and size ease into place.
 */
export function PreviewStage({ config }: { config: BuilderConfig }) {
  const shots = useLayers(config.shape)
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden [container-type:size]">
      {shots.map((l) => (
        <Shot key={l.key} shape={l.key} config={config} enter={l.enter} />
      ))}
    </div>
  )
}
