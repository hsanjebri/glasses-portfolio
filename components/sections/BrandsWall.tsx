import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { SectionHead } from '@/components/ui/SectionHead'
import { brands, logoWall, type BrandId } from '@/content/brands'
import { brandsWall } from '@/content/copy'

/** Optical heights in px: long wordmarks sit lower, compact marks taller, so they read as one weight. */
const HEIGHT: Partial<Record<BrandId, number>> = {
  cartier: 34,
  celine: 24,
  dior: 34,
  gucci: 52,
  moscot: 24,
  oakley: 34,
  'oliver-peoples': 34,
  prada: 22,
  'ray-ban': 38,
  'saint-laurent': 18,
  'tom-ford': 24,
}

/** Width/height of an SVG from its viewBox, or its width/height attributes. Read once at build. */
function aspect(file: string): number {
  const svg = readFileSync(join(process.cwd(), 'public', file), 'utf8')
  const vb = svg.match(/viewBox="[\d.\s-]*?([\d.]+)\s+([\d.]+)"/)
  if (vb) return Number(vb[1]) / Number(vb[2])
  const w = svg.match(/<svg[^>]*\swidth="([\d.]+)/)
  const h = svg.match(/<svg[^>]*\sheight="([\d.]+)/)
  return w && h ? Number(w[1]) / Number(h[1]) : 3
}

/**
 * The houses the shop carries, as a slow drifting band of their own marks.
 * A server component: the logos are plain images, each with its exact size
 * reserved, and the drift is CSS — nothing to hydrate. Under reduced motion
 * the band becomes a still, wrapped grid.
 */
export function BrandsWall() {
  const logos = logoWall.map((id) => {
    const b = brands[id]
    const h = HEIGHT[id] ?? 28
    return { id, name: b.name, src: b.logo ?? '', h, w: Math.round(h * aspect(b.logo ?? '')) }
  })

  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-16 pr-16 md:gap-24 md:pr-24 motion-reduce:flex-wrap motion-reduce:justify-center">
      {logos.map((l) => (
        <li key={l.id} className="shrink-0">
          <img
            src={l.src}
            alt={hidden ? '' : l.name}
            width={l.w}
            height={l.h}
            loading="lazy"
            decoding="async"
            className="opacity-70 transition-opacity duration-500 [filter:brightness(0)_invert(1)] hover:opacity-100"
            style={{ width: l.w, height: l.h }}
          />
        </li>
      ))}
    </ul>
  )

  return (
    <section aria-labelledby="brands-title" className="overflow-hidden border-y border-line py-24 md:py-32">
      <div className="shell mb-14 md:mb-20">
        <SectionHead id="brands-title" label={brandsWall.label} title={brandsWall.title} blurb={brandsWall.blurb} />
      </div>
      <div className="flex w-max animate-[marquee_60s_linear_infinite] motion-reduce:w-full motion-reduce:animate-none motion-reduce:justify-center">
        {row(false)}
        <div className="motion-reduce:hidden">{row(true)}</div>
      </div>
    </section>
  )
}
