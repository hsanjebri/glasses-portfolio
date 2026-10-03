'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Photo } from '@/components/media/Photo'
import { brands } from '@/content/brands'
import { catalogue, labels } from '@/content/copy'
import { formatPrice } from '@/content/site'
import { isFrame, type Product } from '@/content/types'

/**
 * A catalogue card. On hover the photograph turns a touch and its colourway
 * chips surface; a chip switches the card to that colourway (and its photo,
 * where the content file has one). The title link is stretched over the
 * card, so the chips can be real buttons rather than nested links.
 */
export function ProductCard({ product, headingLevel = 'h3' }: { product: Product; headingLevel?: 'h2' | 'h3' }) {
  const [cwIndex, setCwIndex] = useState(0)
  // The focus pull plays when a chip switches the photo, not on first paint:
  // a grid of cards all blurring in at once is expensive to paint on phones.
  const [switched, setSwitched] = useState(false)
  const frame = isFrame(product) ? product : null
  const colourway = frame?.colourways[cwIndex]
  const photo = colourway?.photo ?? product.photo
  const href = `/catalogue/${product.slug}${colourway && cwIndex > 0 ? `?cw=${colourway.id}` : ''}`
  const Heading = headingLevel

  return (
    <article className="group relative flex h-full flex-col gap-3 sm:gap-4">
      <div className="relative overflow-hidden rounded-[4px] bg-paper" data-cursor="magnify">
        <div key={photo} className={switched ? 'animate-[focus-pull_.7s_cubic-bezier(.2,.7,.1,1)_both]' : undefined}>
          <Photo
            photo={photo}
            ratio="4 / 5"
            sizes="(max-width: 1280px) 46vw, 30vw"
            imgClassName="transition-transform duration-[1.2s] ease-focus group-hover:rotate-[-1.5deg] group-hover:scale-[1.05] motion-reduce:!transform-none"
          />
        </div>
        <span className="label-sm sm:label absolute left-2 top-2 rounded-full bg-bg/85 px-2 py-1 text-ink sm:left-3 sm:top-3 sm:px-2.5 sm:py-1.5">{labels[product.category]}</span>

        {frame && frame.colourways.length > 1 ? (
          <div
            className="absolute inset-x-2 bottom-2 z-[2] flex translate-y-1 items-center gap-1 rounded-full sm:inset-x-3 sm:bottom-3 sm:gap-1.5 bg-bg/90 p-1 pr-3 opacity-0 transition-[opacity,transform] duration-500 ease-focus group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100"
            role="group"
            aria-label={`${product.name} — ${catalogue.card.colourways(frame.colourways.length)}`}
          >
            {frame.colourways.map((c, i) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setSwitched(true)
                  setCwIndex(i)
                }}
                aria-pressed={i === cwIndex}
                aria-label={c.name}
                title={c.name}
                className="grid size-7 place-items-center rounded-full border border-transparent transition-colors duration-300 aria-pressed:border-ink"
              >
                <span
                  className="block size-[18px] rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,.18)]"
                  style={{ background: `linear-gradient(135deg, ${c.swatch[0]} 50%, ${c.swatch[1]} 50%)` }}
                />
              </button>
            ))}
            <span className="label ml-1 hidden min-w-0 truncate text-ink-2 sm:block">{colourway?.name}</span>
          </div>
        ) : null}
      </div>

      {/* Phones: brand, name and price stacked; wider: the price sits beside the name. */}
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex min-w-0 flex-col gap-1.5 sm:gap-2">
          <p className="label-sm sm:label truncate text-ink-3">{brands[product.brand].name}</p>
          <Heading className="display-italic text-[21px] leading-[1.05] sm:text-[clamp(26px,2.2vw,34px)] sm:leading-none">
            <Link href={href} className="after:absolute after:inset-0 after:content-['']" data-cursor-label="Voir">
              {product.name}
            </Link>
          </Heading>
        </div>
        <p className="label-sm sm:label tnum shrink-0 text-ink-2 sm:pt-0.5">{formatPrice(product.price)}</p>
      </div>
    </article>
  )
}
