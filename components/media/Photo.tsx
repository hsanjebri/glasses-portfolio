import Image from 'next/image'
import type { CSSProperties } from 'react'

import { photos, type PhotoKey } from '@/content/photos'

type Props = {
  photo: PhotoKey
  /** next/image sizes hint — always pass one that matches the layout. */
  sizes: string
  className?: string
  /** Applied to the <img>, e.g. object-position. */
  imgClassName?: string
  /** CSS aspect ratio for the frame, e.g. "4 / 5". Omit to fill the parent. */
  ratio?: string
  priority?: boolean
  quality?: 60 | 72 | 85
  /** Overrides the alt text from content/photos.ts. Empty string = decorative. */
  alt?: string
  style?: CSSProperties
}

/**
 * The one way a photograph is shown. It reserves its box (no layout shift),
 * paints the photo's dominant colour while it loads, and lets the Unsplash
 * CDN deliver the right size.
 */
export function Photo({ photo, sizes, className = '', imgClassName = '', ratio, priority, quality, alt, style }: Props) {
  const p = photos[photo]
  return (
    <div
      className={`relative overflow-hidden ${ratio ? '' : 'h-full w-full'} ${className}`}
      style={{ backgroundColor: p.color, aspectRatio: ratio, ...style }}
    >
      <Image
        src={p.src}
        alt={alt ?? p.alt}
        fill
        sizes={sizes}
        priority={priority}
        quality={quality}
        className={`object-cover ${imgClassName}`}
      />
    </div>
  )
}
