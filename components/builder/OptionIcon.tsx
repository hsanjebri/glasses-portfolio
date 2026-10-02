import type { OptionIcon as IconKind } from '@/content/types'
import { useSvgId } from '@/lib/svg-id'

/**
 * Schematic icons for the options a photograph cannot show: lens types,
 * index thickness, coatings and sizes. Line drawings in currentColor, the
 * way an optician sketches them on the counter pad.
 */
export function OptionIcon({ kind, className = '' }: { kind: IconKind; className?: string }) {
  const id = useSvgId('oi')

  const lens = (children: React.ReactNode, fill = 'none') => (
    <svg viewBox="0 0 120 60" className={className} aria-hidden="true">
      <defs>
        <clipPath id={`${id}-c`}>
          <circle cx="60" cy="30" r="24" />
        </clipPath>
      </defs>
      <circle cx="60" cy="30" r="24" fill={fill} />
      <g clipPath={`url(#${id}-c)`}>{children}</g>
      <circle cx="60" cy="30" r="24" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )

  switch (kind) {
    case 'narrow':
    case 'medium':
    case 'wide': {
      const r = kind === 'narrow' ? 13 : kind === 'medium' ? 16 : 19
      const gap = kind === 'narrow' ? 6 : kind === 'medium' ? 8 : 9
      return (
        <svg viewBox="0 0 120 60" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4">
          <circle cx={60 - gap / 2 - r} cy="30" r={r} />
          <circle cx={60 + gap / 2 + r} cy="30" r={r} />
          <path d={`M${60 - gap / 2} 28q${gap / 2} -3 ${gap} 0`} />
          <path d={`M${60 - gap / 2 - r * 2} 54H${60 + gap / 2 + r * 2}`} strokeOpacity="0.4" strokeWidth="1" />
        </svg>
      )
    }
    case 'plano':
      return lens(<path d="M44 20l10 -8" stroke="currentColor" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" />)
    case 'single-vision':
      return lens(
        <>
          <rect x="30" y="0" width="60" height="60" fill="currentColor" fillOpacity="0.08" />
          <circle cx="60" cy="30" r="3" fill="currentColor" />
        </>,
      )
    case 'progressive':
      return lens(
        <>
          <rect x="30" y="30" width="60" height="30" fill="var(--accent)" fillOpacity="0.25" />
          <path d="M56 18h8M57 30h6M54 42h12" stroke="currentColor" strokeWidth="1.4" />
        </>,
      )
    case 'sun':
      return lens(<path d="M42 22l12 -10" stroke="#fff" strokeOpacity="0.5" strokeWidth="2.4" strokeLinecap="round" />, '#2a2520')
    case 'std-15':
    case 'thin-16':
    case 'ultra-167': {
      // Edge-on lens profiles: a higher index means a thinner edge.
      const edge = kind === 'std-15' ? 10 : kind === 'thin-16' ? 7 : 4.5
      return (
        <svg viewBox="0 0 120 60" className={className} aria-hidden="true">
          <path
            d={`M20 ${30 - edge}Q60 28 100 ${30 - edge}V${30 + edge}Q60 32 20 ${30 + edge}Z`}
            fill="currentColor"
            fillOpacity="0.12"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <path d={`M14 ${30 - edge}V${30 + edge}`} stroke="var(--accent)" strokeWidth="1.4" />
        </svg>
      )
    }
    case 'anti-reflective':
      return lens(
        <>
          <path d="M20 8L60 30L100 8" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.4" strokeDasharray="3 3" />
          <path d="M20 52L60 30" stroke="var(--accent)" strokeWidth="1.6" />
        </>,
      )
    case 'blue-light':
      return lens(
        <>
          <path d="M30 30q4 -8 8 0t8 0t8 0" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M62 30h28" stroke="var(--accent)" strokeWidth="1.6" />
        </>,
      )
    case 'photochromic':
      return lens(<path d="M30 60L90 0V60Z" fill="currentColor" fillOpacity="0.6" />)
    case 'polarised':
      return lens(
        <g stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.2">
          {[14, 20, 26, 32, 38, 44].map((y) => (
            <path key={y} d={`M30 ${y}H90`} />
          ))}
        </g>,
      )
  }
}
