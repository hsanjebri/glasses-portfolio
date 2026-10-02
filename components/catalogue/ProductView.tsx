'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { Photo } from '@/components/media/Photo'
import { Focus } from '@/components/motion/Focus'
import { SunMode } from '@/components/motion/ThemeProvider'
import { Pill } from '@/components/ui/Pill'
import { brands } from '@/content/brands'
import { defaultConfig, lensTypeOptions } from '@/content/builder'
import { labels, product as copy, whatsapp } from '@/content/copy'
import { formatPrice, site } from '@/content/site'
import { isFrame, type Product, type SizeKey } from '@/content/types'
import { encodeConfig, normalize } from '@/lib/builder'
import { whatsappLink } from '@/lib/whatsapp'

import { SizeDiagram } from './SizeDiagram'

/** Catalogue colourways whose configurator material has a different id. */
const TO_BUILDER: Record<string, string> = { or: 'or-brosse', argent: 'titane' }

function sizeFor(lensWidth: number): SizeKey {
  if (lensWidth < 48) return 'narrow'
  if (lensWidth <= 52) return 'medium'
  return 'wide'
}

/** The interactive half of a product page: art, colourways and the calls to action. */
export function ProductView({ product }: { product: Product }) {
  const frame = isFrame(product) ? product : null
  const [cwIndex, setCwIndex] = useState(0)

  // A card's chosen colourway arrives as ?cw= — honour it after hydration.
  useEffect(() => {
    if (!frame) return
    const cw = new URLSearchParams(window.location.search).get('cw')
    const i = frame.colourways.findIndex((c) => c.id === cw)
    if (i > 0) setCwIndex(i)
  }, [frame])

  const colourway = frame?.colourways[cwIndex]
  const photo = colourway?.photo ?? product.photo

  const buildHref = frame
    ? `/build?${encodeConfig(
        normalize({
          ...defaultConfig,
          shape: frame.shape,
          colourway: colourway ? (TO_BUILDER[colourway.id] ?? colourway.id) : defaultConfig.colourway,
          size: sizeFor(frame.dimensions.lensWidth),
          lensType: frame.category === 'sun' ? 'sun' : defaultConfig.lensType,
          coatings: frame.category === 'blue-light' ? ['anti-reflective', 'blue-light'] : defaultConfig.coatings,
        }),
      )}`
    : null

  const tryHref = `/?product=${product.slug}${colourway ? `&cw=${colourway.id}` : ''}#visite`
  const waHref = whatsappLink(
    [
      whatsapp.productIntro(`${brands[product.brand].name} ${product.name}` + (colourway ? ` (${colourway.name})` : '')),
      `${formatPrice(product.price)}`,
      `${site.url}/catalogue/${product.slug}`,
    ].join('\n'),
  )

  const lensOptions = frame ? lensTypeOptions.filter((o) => frame.lensCapability.includes(o.id)) : []

  return (
    <div className="grid gap-10 min-[900px]:grid-cols-[1.25fr_1fr] min-[900px]:gap-16">
      <SunMode active={product.category === 'sun'} />

      {/* Stage */}
      <div className="min-[900px]:sticky min-[900px]:top-24 min-[900px]:self-start">
        <Focus immediate className="relative overflow-hidden rounded-[4px] bg-paper">
          <div key={photo} className="animate-[focus-pull_.8s_cubic-bezier(.2,.7,.1,1)_both]" data-cursor="magnify">
            <Photo photo={photo} ratio="4 / 5" priority sizes="(max-width: 900px) 100vw, 55vw" />
          </div>
          <div className="on-dark pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/40 to-transparent p-4 md:p-6">
            <span className="label">{labels[product.category]}</span>
            {colourway ? <span className="label">{colourway.name}</span> : null}
          </div>
        </Focus>
      </div>

      {/* Details */}
      <div className="flex flex-col gap-10">
        <Focus immediate index={1} className="flex flex-col gap-5">
          <Link href="/catalogue" className="label self-start text-ink-3 transition-colors hover:text-ink">
            ← {copy.back}
          </Link>
          <p className="label text-ink-2">
            {brands[product.brand].name}
            {product.reference ? <span className="text-ink-3"> · {copy.reference} {product.reference}</span> : null}
          </p>
          <h1 className="display-italic text-[clamp(56px,7vw,104px)] leading-[0.9] tracking-[-0.02em]">{product.name}</h1>
          <p className="label tnum text-ink">{formatPrice(product.price)}</p>
          <p className="max-w-[46ch] text-[16px] leading-[1.65] text-ink-2">{product.description}</p>
        </Focus>

        {frame && frame.colourways.length > 1 ? (
          <Focus immediate index={2}>
            <fieldset className="m-0 border-0 p-0">
              <legend className="label mb-4 text-ink-3">{copy.colourwayLabel}</legend>
              <div className="flex flex-wrap gap-2">
                {frame.colourways.map((c, i) => (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={i === cwIndex}
                    onClick={() => setCwIndex(i)}
                    className="inline-flex min-h-11 items-center gap-3 rounded-full border border-line py-1.5 pl-1.5 pr-4 text-[13px] text-ink-2 transition-colors duration-300 hover:border-ink aria-pressed:border-ink aria-pressed:text-ink"
                  >
                    <span
                      aria-hidden="true"
                      className="size-8 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,.12)]"
                      style={{ background: `linear-gradient(135deg, ${c.swatch[0]} 50%, ${c.swatch[1]} 50%)` }}
                    />
                    {c.name}
                  </button>
                ))}
              </div>
            </fieldset>
          </Focus>
        ) : null}

        <Focus immediate index={3} className="flex flex-wrap items-center gap-4">
          {buildHref ? (
            <Pill href={buildHref} cursorLabel="Composer">
              {copy.build}
            </Pill>
          ) : (
            <Pill href={waHref} target="_blank" rel="noreferrer noopener" variant="solid" cursorLabel="Commander">
              {copy.whatsapp}
            </Pill>
          )}
          <Pill href={tryHref} variant="ghost" cursorLabel="RDV">
            {copy.tryInStore}
          </Pill>
        </Focus>

        {lensOptions.length ? (
          <Focus index={3}>
            <h2 className="label mb-4 text-ink-3">{copy.lensLabel}</h2>
            <ul className="border-t border-line">
              {lensOptions.map((o) => (
                <li key={o.id} className="flex items-baseline justify-between gap-6 border-b border-line py-4">
                  <div>
                    <p className="text-[15px] text-ink">{o.label}</p>
                    <p className="text-[13px] leading-[1.5] text-ink-3">{o.blurb}</p>
                  </div>
                  <p className="label tnum shrink-0 text-ink-2">{o.priceDelta ? copy.lensFrom(formatPrice(o.priceDelta)) : copy.lensIncluded}</p>
                </li>
              ))}
            </ul>
          </Focus>
        ) : null}

        {frame ? (
          <Focus index={4}>
            <h2 className="label mb-4 text-ink-3">{copy.sizeLabel}</h2>
            <div className="rounded-[4px] border border-line p-4 md:p-6">
              <SizeDiagram frame={frame} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-6 sm:grid-cols-3">
              {(Object.keys(copy.measurements) as (keyof typeof copy.measurements)[]).map((k) => (
                <div key={k} className="flex items-baseline justify-between gap-3 border-b border-line py-3">
                  <dt className="label text-ink-3">{copy.measurements[k]}</dt>
                  <dd className="tnum text-[15px] text-ink">{frame.dimensions[k]} mm</dd>
                </div>
              ))}
            </dl>
          </Focus>
        ) : null}

        <Focus index={5}>
          <h2 className="label mb-4 text-ink-3">{copy.detailsLabel}</h2>
          <ul className="flex flex-col gap-2">
            {product.details.map((d) => (
              <li key={d} className="flex gap-3 text-[15px] text-ink-2">
                <span aria-hidden="true" className="mt-[0.7em] h-px w-4 shrink-0 bg-accent" />
                {d}
              </li>
            ))}
          </ul>
        </Focus>
      </div>
    </div>
  )
}
