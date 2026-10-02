import { lensPath } from './lens-outline'
import { product as copy } from '@/content/copy'
import type { Frame } from '@/content/types'

/** Drawing scale: units per millimetre. */
const K = 3.4

/**
 * The frame's real proportions, drawn from its measurements, with dimension
 * lines for lens width, bridge and temple length.
 */
export function SizeDiagram({ frame }: { frame: Frame }) {
  const d = frame.dimensions
  const w = (d.lensWidth * K) / 2
  const h = (d.lensHeight * K) / 2
  const gap = d.bridge * K
  const cx = 300
  const cy = 150
  const cxL = cx - gap / 2 - w
  const cxR = cx + gap / 2 + w
  const lens = lensPath(frame.shape, w, h)
  const top = cy - h - 26
  const templeLen = Math.min(500, d.templeLength * K * 0.95)
  const tx = cx - templeLen / 2
  const ty = 330

  return (
    <svg viewBox="0 0 600 410" className="h-auto w-full" role="img" aria-label={copy.diagramAlt}>
      <defs>
        <marker id="dim-arrow" viewBox="0 0 8 8" refX="4" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 1L6 4L0 7" fill="none" stroke="var(--ink-2)" strokeWidth="1" />
        </marker>
      </defs>

      {/* Front */}
      <g fill="none" stroke="var(--ink)" strokeWidth="2.4" strokeLinejoin="round">
        <path d={lens} transform={`translate(${cxL} ${cy}) scale(-1 1)`} />
        <path d={lens} transform={`translate(${cxR} ${cy})`} />
        <path d={`M${cxL + w * 0.97} ${cy - h * 0.45}Q${cx} ${cy - h * 0.7} ${cxR - w * 0.97} ${cy - h * 0.45}`} />
      </g>

      {/* Lens width */}
      <g stroke="var(--ink-2)" strokeWidth="1">
        <path d={`M${cxR - w} ${top - 8}V${cy - h * 0.5}M${cxR + w} ${top - 8}V${cy - h * 0.5}`} strokeDasharray="2 3" strokeOpacity="0.6" />
        <path d={`M${cxR - w + 3} ${top}H${cxR + w - 3}`} markerStart="url(#dim-arrow)" markerEnd="url(#dim-arrow)" />
      </g>
      <DimLabel x={cxR} y={top - 12} value={d.lensWidth} label={copy.measurements.lensWidth} />

      {/* Bridge */}
      <g stroke="var(--ink-2)" strokeWidth="1">
        <path d={`M${cx - gap / 2 + 3} ${cy - h * 0.15}H${cx + gap / 2 - 3}`} markerStart="url(#dim-arrow)" markerEnd="url(#dim-arrow)" />
        <path d={`M${cx} ${cy - h * 0.15 + 6}V${cy + h + 12}`} strokeDasharray="2 3" strokeOpacity="0.6" />
      </g>
      <DimLabel x={cx} y={cy + h + 30} value={d.bridge} label={copy.measurements.bridge} />

      {/* Temple, side view */}
      <path
        d={`M${tx} ${ty}H${tx + templeLen * 0.82}Q${tx + templeLen * 0.95} ${ty} ${tx + templeLen} ${ty + 22}`}
        fill="none"
        stroke="var(--ink)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect x={tx - 6} y={ty - 6} width="10" height="12" rx="2" fill="var(--ink)" />
      <path d={`M${tx + 3} ${ty + 46}H${tx + templeLen - 3}`} stroke="var(--ink-2)" markerStart="url(#dim-arrow)" markerEnd="url(#dim-arrow)" />
      <DimLabel x={cx} y={ty + 70} value={d.templeLength} label={copy.measurements.templeLength} />
    </svg>
  )
}

function DimLabel({ x, y, value, label }: { x: number; y: number; value: number; label: string }) {
  return (
    <text x={x} y={y} textAnchor="middle" fontFamily="var(--font-plex-mono), monospace" fontSize="11" letterSpacing="2" fill="var(--ink-2)">
      {label.toUpperCase()} · {value} MM
    </text>
  )
}
